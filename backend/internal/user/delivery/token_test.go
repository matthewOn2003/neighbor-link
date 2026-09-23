package delivery

import (
	"encoding/base64"
	"fmt"
	"testing"
	"time"
)

func TestVerifyToken_Valid(t *testing.T) {
	token := createToken("admin", "admin", "secret")
	username, role, ok := verifyToken(token, "secret")
	if !ok || username != "admin" || role != "admin" {
		t.Fatalf("expected valid token, got username=%q role=%q ok=%v", username, role, ok)
	}
}

func TestVerifyToken_WrongSecret(t *testing.T) {
	token := createToken("admin", "admin", "secret")
	if _, _, ok := verifyToken(token, "wrong-secret"); ok {
		t.Fatal("expected verification to fail with wrong secret")
	}
}

func TestVerifyToken_Expired(t *testing.T) {
	issuedAt := time.Now().Add(-9 * time.Hour).Unix()
	payload := fmt.Sprintf("%s:%s:%d", "admin", "admin", issuedAt)
	token := base64.RawURLEncoding.EncodeToString([]byte(payload)) + "." + sign(payload, "secret")

	if _, _, ok := verifyToken(token, "secret"); ok {
		t.Fatal("expected verification to fail for expired token")
	}
}

