package delivery

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"time"
)

func createToken(username, role, configuredSecret string) string {
	issuedAt := time.Now().Unix()
	payload := fmt.Sprintf("%s:%s:%d", username, role, issuedAt)
	signature := sign(payload, configuredSecret)
	return base64.RawURLEncoding.EncodeToString([]byte(payload)) + "." + signature
}

func sign(payload, secret string) string {
	hash := hmac.New(sha256.New, []byte(secret))
	_, _ = hash.Write([]byte(payload))
	return base64.RawURLEncoding.EncodeToString(hash.Sum(nil))
}
