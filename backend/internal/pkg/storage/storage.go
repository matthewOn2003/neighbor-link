// Package storage is the object storage placeholder for uploaded files such as payment proofs.
// The S3 SDK is not wired yet: credentials are supplied later by the owner.
package storage

import (
	"context"
	"errors"
	"io"
	"os"
	"strings"
)

// ErrNotConfigured is returned when the S3 endpoint or bucket is not set.
var ErrNotConfigured = errors.New("object storage is not configured")

// Config holds S3-compatible storage settings, read from the environment.
type Config struct {
	Endpoint        string
	Region          string
	Bucket          string
	AccessKeyID     string
	SecretAccessKey string
}

// LoadConfigFromEnv reads S3_ENDPOINT, S3_REGION, S3_BUCKET, S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY.
func LoadConfigFromEnv() Config {
	return Config{
		Endpoint:        strings.TrimSpace(os.Getenv("S3_ENDPOINT")),
		Region:          strings.TrimSpace(os.Getenv("S3_REGION")),
		Bucket:          strings.TrimSpace(os.Getenv("S3_BUCKET")),
		AccessKeyID:     strings.TrimSpace(os.Getenv("S3_ACCESS_KEY_ID")),
		SecretAccessKey: strings.TrimSpace(os.Getenv("S3_SECRET_ACCESS_KEY")),
	}
}

// Uploader stores an object and returns its URL.
type Uploader interface {
	Put(ctx context.Context, key, contentType string, body io.Reader) (url string, err error)
}

// stubUploader is used until the S3 SDK is added. It reports ErrNotConfigured for every upload.
type stubUploader struct {
	cfg Config
}

// NewUploader returns the uploader for the given config.
func NewUploader(cfg Config) Uploader {
	return &stubUploader{cfg: cfg}
}

func (u *stubUploader) Put(ctx context.Context, key, contentType string, body io.Reader) (string, error) {
	if u.cfg.Bucket == "" || u.cfg.Endpoint == "" {
		return "", ErrNotConfigured
	}
	// TODO: replace with the real S3 upload (PutObject with the configured endpoint, region, bucket and
	// credentials) once the owner supplies them. Until then uploads are not stored.
	return "", ErrNotConfigured
}
