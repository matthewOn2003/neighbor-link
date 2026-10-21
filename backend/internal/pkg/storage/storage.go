// Package storage uploads objects to Cloudflare R2 (S3-compatible) using only the standard library.
// Requests are signed with AWS Signature Version 4, region "auto".
//
// Environment variables read by LoadConfigFromEnv:
//
//	R2_ENDPOINT           e.g. https://<account-id>.r2.cloudflarestorage.com (no bucket in the path)
//	R2_BUCKET             bucket name
//	R2_ACCESS_KEY_ID      R2 API token access key id
//	R2_SECRET_ACCESS_KEY  R2 API token secret access key
//	R2_REGION             optional, defaults to "auto"
package storage

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"sort"
	"strings"
	"time"
)

var (
	// ErrNotConfigured is returned when the endpoint, bucket or credentials are missing.
	ErrNotConfigured = errors.New("object storage is not configured")
	// ErrObjectTooLarge is returned when the body exceeds MaxObjectSize.
	ErrObjectTooLarge = errors.New("object is too large")
	// ErrInvalidKey is returned for an empty object key.
	ErrInvalidKey = errors.New("object key is empty")
)

// MaxObjectSize limits a single upload (10 MiB), enough for payment proof images.
const MaxObjectSize = 10 << 20

// Config holds R2 settings read from the environment.
type Config struct {
	Endpoint        string
	Region          string
	Bucket          string
	AccessKeyID     string
	SecretAccessKey string
}

// LoadConfigFromEnv reads the R2_* variables.
func LoadConfigFromEnv() Config {
	region := strings.TrimSpace(os.Getenv("R2_REGION"))
	if region == "" {
		region = "auto"
	}
	return Config{
		Endpoint:        strings.TrimRight(strings.TrimSpace(os.Getenv("R2_ENDPOINT")), "/"),
		Region:          region,
		Bucket:          strings.TrimSpace(os.Getenv("R2_BUCKET")),
		AccessKeyID:     strings.TrimSpace(os.Getenv("R2_ACCESS_KEY_ID")),
		SecretAccessKey: strings.TrimSpace(os.Getenv("R2_SECRET_ACCESS_KEY")),
	}
}

// Configured reports whether every required setting is present.
func (c Config) Configured() bool {
	return c.Endpoint != "" && c.Bucket != "" && c.AccessKeyID != "" && c.SecretAccessKey != ""
}

// Uploader stores an object and returns its URL.
type Uploader interface {
	Put(ctx context.Context, key, contentType string, body io.Reader) (url string, err error)
}

type r2Uploader struct {
	cfg    Config
	client *http.Client
	now    func() time.Time
}

// NewUploader returns an R2 uploader for the given config.
func NewUploader(cfg Config) Uploader {
	return &r2Uploader{cfg: cfg, client: &http.Client{Timeout: 30 * time.Second}, now: time.Now}
}

// Put uploads body to bucket/key. It returns the object URL. The bucket is private, so this URL
// needs a signed request to read; a signed-URL helper is still to be added.
func (u *r2Uploader) Put(ctx context.Context, key, contentType string, body io.Reader) (string, error) {
	if !u.cfg.Configured() {
		return "", ErrNotConfigured
	}
	key = strings.TrimLeft(strings.TrimSpace(key), "/")
	if key == "" {
		return "", ErrInvalidKey
	}
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	data, err := io.ReadAll(io.LimitReader(body, MaxObjectSize+1))
	if err != nil {
		return "", fmt.Errorf("read upload body: %w", err)
	}
	if len(data) > MaxObjectSize {
		return "", ErrObjectTooLarge
	}

	endpoint, err := url.Parse(u.cfg.Endpoint)
	if err != nil || endpoint.Scheme == "" || endpoint.Host == "" {
		return "", fmt.Errorf("invalid R2_ENDPOINT: %q", u.cfg.Endpoint)
	}

	canonicalPath := "/" + escapePath(u.cfg.Bucket) + "/" + escapePath(key)
	target := endpoint.Scheme + "://" + endpoint.Host + canonicalPath

	payloadHash := sha256Hex(data)
	now := u.now().UTC()
	headers := map[string]string{
		"host":                 endpoint.Host,
		"content-type":         contentType,
		"x-amz-content-sha256": payloadHash,
		"x-amz-date":           now.Format("20060102T150405Z"),
	}
	authorization := signV4(
		http.MethodPut,
		canonicalPath,
		"",
		headers,
		payloadHash,
		now,
		credentials{accessKey: u.cfg.AccessKeyID, secret: u.cfg.SecretAccessKey, region: u.cfg.Region},
	)

	req, err := http.NewRequestWithContext(ctx, http.MethodPut, target, bytes.NewReader(data))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", contentType)
	req.Header.Set("X-Amz-Content-Sha256", payloadHash)
	req.Header.Set("X-Amz-Date", headers["x-amz-date"])
	req.Header.Set("Authorization", authorization)

	resp, err := u.client.Do(req)
	if err != nil {
		return "", fmt.Errorf("upload to R2: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode > 299 {
		msg, _ := io.ReadAll(io.LimitReader(resp.Body, 512))
		return "", fmt.Errorf("upload to R2 failed: status %d: %s", resp.StatusCode, strings.TrimSpace(string(msg)))
	}
	return target, nil
}

type credentials struct {
	accessKey string
	secret    string
	region    string
}

// signV4 builds the Authorization header for a request with an empty query string.
// headers must include "host" and "x-amz-date"; names are lower case.
func signV4(method, canonicalPath, query string, headers map[string]string, payloadHash string, t time.Time, c credentials) string {
	names := make([]string, 0, len(headers))
	for name := range headers {
		names = append(names, name)
	}
	sort.Strings(names)

	var canonicalHeaders strings.Builder
	for _, name := range names {
		canonicalHeaders.WriteString(name + ":" + strings.Join(strings.Fields(headers[name]), " ") + "\n")
	}
	signedHeaders := strings.Join(names, ";")

	canonicalRequest := strings.Join([]string{
		method,
		canonicalPath,
		query,
		canonicalHeaders.String(),
		signedHeaders,
		payloadHash,
	}, "\n")

	dateStamp := t.Format("20060102")
	scope := dateStamp + "/" + c.region + "/s3/aws4_request"
	stringToSign := strings.Join([]string{
		"AWS4-HMAC-SHA256",
		t.Format("20060102T150405Z"),
		scope,
		sha256Hex([]byte(canonicalRequest)),
	}, "\n")

	kDate := hmacSHA256([]byte("AWS4"+c.secret), dateStamp)
	kRegion := hmacSHA256(kDate, c.region)
	kService := hmacSHA256(kRegion, "s3")
	kSigning := hmacSHA256(kService, "aws4_request")
	signature := hex.EncodeToString(hmacSHA256(kSigning, stringToSign))

	return "AWS4-HMAC-SHA256 Credential=" + c.accessKey + "/" + scope +
		", SignedHeaders=" + signedHeaders + ", Signature=" + signature
}

func hmacSHA256(key []byte, data string) []byte {
	mac := hmac.New(sha256.New, key)
	mac.Write([]byte(data))
	return mac.Sum(nil)
}

func sha256Hex(data []byte) string {
	sum := sha256.Sum256(data)
	return hex.EncodeToString(sum[:])
}

// escapePath percent-encodes a path segment per RFC 3986, keeping "/" between segments.
func escapePath(p string) string {
	var b strings.Builder
	for i := 0; i < len(p); i++ {
		c := p[i]
		switch {
		case c >= 'A' && c <= 'Z', c >= 'a' && c <= 'z', c >= '0' && c <= '9',
			c == '-', c == '_', c == '.', c == '~', c == '/':
			b.WriteByte(c)
		default:
			fmt.Fprintf(&b, "%%%02X", c)
		}
	}
	return b.String()
}
