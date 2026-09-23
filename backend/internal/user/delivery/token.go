package delivery

import (
	"crypto/hmac"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base64"
	"fmt"
	"strconv"
	"strings"
	"time"
)

const tokenTTL = 8 * time.Hour

func createToken(username, role, configuredSecret string) string {
	issuedAt := time.Now().Unix()
	payload := fmt.Sprintf("%s:%s:%d", username, role, issuedAt)
	signature := sign(payload, configuredSecret)
	return base64.RawURLEncoding.EncodeToString([]byte(payload)) + "." + signature
}

// verifyToken checks the signature (constant-time) and the token's age against tokenTTL.
func verifyToken(token, secret string) (username, role string, ok bool) {
	rawPayload, signature, found := strings.Cut(token, ".")
	if !found {
		return "", "", false
	}

	payloadBytes, err := base64.RawURLEncoding.DecodeString(rawPayload)
	if err != nil {
		return "", "", false
	}
	payload := string(payloadBytes)

	expectedSignature := sign(payload, secret)
	if subtle.ConstantTimeCompare([]byte(signature), []byte(expectedSignature)) != 1 {
		return "", "", false
	}

	parts := strings.Split(payload, ":")
	if len(parts) != 3 {
		return "", "", false
	}
	issuedAt, err := strconv.ParseInt(parts[2], 10, 64)
	if err != nil {
		return "", "", false
	}
	if time.Since(time.Unix(issuedAt, 0)) > tokenTTL {
		return "", "", false
	}

	return parts[0], parts[1], true
}

func sign(payload, secret string) string {
	hash := hmac.New(sha256.New, []byte(secret))
	_, _ = hash.Write([]byte(payload))
	return base64.RawURLEncoding.EncodeToString(hash.Sum(nil))
}
