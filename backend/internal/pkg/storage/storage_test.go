package storage

import (
	"bytes"
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

// Reference example from the AWS S3 documentation (SigV4, GET /test.txt with a Range header).
func TestSignV4MatchesAWSDocumentedExample(t *testing.T) {
	when := time.Date(2013, 5, 24, 0, 0, 0, 0, time.UTC)
	headers := map[string]string{
		"host":                 "examplebucket.s3.amazonaws.com",
		"range":                "bytes=0-9",
		"x-amz-content-sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
		"x-amz-date":           "20130524T000000Z",
	}
	got := signV4(http.MethodGet, "/test.txt", "", headers,
		headers["x-amz-content-sha256"], when,
		credentials{accessKey: "AKIAIOSFODNN7EXAMPLE", secret: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY", region: "us-east-1"})

	want := "AWS4-HMAC-SHA256 Credential=AKIAIOSFODNN7EXAMPLE/20130524/us-east-1/s3/aws4_request, " +
		"SignedHeaders=host;range;x-amz-content-sha256;x-amz-date, " +
		"Signature=f0e8bdb87c964420e857bd35b5d6ed310bd44f0170aba48dd91039c6036bdb41"
	if got != want {
		t.Fatalf("signature mismatch\n got: %s\nwant: %s", got, want)
	}
}

func TestPutSendsSignedPutAndReturnsURL(t *testing.T) {
	var gotMethod, gotPath, gotAuth, gotContentType string
	var gotBody []byte
	server := httptest.NewTLSServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		gotMethod = r.Method
		gotPath = r.URL.EscapedPath()
		gotAuth = r.Header.Get("Authorization")
		gotContentType = r.Header.Get("Content-Type")
		gotBody, _ = io.ReadAll(r.Body)
		w.WriteHeader(http.StatusOK)
	}))
	defer server.Close()

	uploader := &r2Uploader{
		cfg: Config{
			Endpoint:        server.URL,
			Region:          "auto",
			Bucket:          "neighbor-link-staging",
			AccessKeyID:     "test-access",
			SecretAccessKey: "test-secret",
		},
		client: server.Client(),
		now:    func() time.Time { return time.Date(2026, 10, 21, 7, 0, 0, 0, time.UTC) },
	}

	target, err := uploader.Put(context.Background(), "proofs/12/receipt 1.jpg", "image/jpeg", bytes.NewReader([]byte("hello")))
	if err != nil {
		t.Fatalf("Put returned error: %v", err)
	}
	if gotMethod != http.MethodPut {
		t.Errorf("method = %s, want PUT", gotMethod)
	}
	if gotPath != "/neighbor-link-staging/proofs/12/receipt%201.jpg" {
		t.Errorf("path = %s", gotPath)
	}
	if string(gotBody) != "hello" {
		t.Errorf("body = %q", gotBody)
	}
	if gotContentType != "image/jpeg" {
		t.Errorf("content type = %s", gotContentType)
	}
	if !strings.HasPrefix(gotAuth, "AWS4-HMAC-SHA256 Credential=test-access/20261021/auto/s3/aws4_request") {
		t.Errorf("authorization = %s", gotAuth)
	}
	if !strings.HasSuffix(target, "/neighbor-link-staging/proofs/12/receipt%201.jpg") {
		t.Errorf("target = %s", target)
	}
}

func TestPutRejectsWhenNotConfigured(t *testing.T) {
	uploader := NewUploader(Config{})
	if _, err := uploader.Put(context.Background(), "a.jpg", "image/jpeg", bytes.NewReader(nil)); err != ErrNotConfigured {
		t.Fatalf("err = %v, want ErrNotConfigured", err)
	}
}

func TestPutRejectsOversizedObject(t *testing.T) {
	uploader := NewUploader(Config{Endpoint: "https://example.invalid", Bucket: "b", AccessKeyID: "a", SecretAccessKey: "s", Region: "auto"})
	big := bytes.NewReader(make([]byte, MaxObjectSize+1))
	if _, err := uploader.Put(context.Background(), "a.jpg", "image/jpeg", big); err != ErrObjectTooLarge {
		t.Fatalf("err = %v, want ErrObjectTooLarge", err)
	}
}
