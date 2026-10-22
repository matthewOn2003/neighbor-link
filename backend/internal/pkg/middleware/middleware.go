package middleware

import (
	"backend/internal/pkg/httpx"
	"log"
	"net/http"
	"net/http/httputil"
)

const AuthCookieName = "auth_token"

// RequireAuth returns a middleware that validates the auth_token cookie.
func RequireAuth(tokenSecret string, verifyToken func(string, string) (string, string, bool)) func(http.HandlerFunc) http.HandlerFunc {
	return func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			cookie, err := r.Cookie(AuthCookieName)
			if err != nil {
				httpx.WriteUnauthorized(w, "authentication required")
				return
			}
			if _, _, ok := verifyToken(cookie.Value, tokenSecret); !ok {
				httpx.WriteUnauthorized(w, "authentication required")
				return
			}
			next(w, r)
		}
	}
}

// RequireRole validates the session and restricts the endpoint to the supplied roles.
func RequireRole(tokenSecret string, verifyToken func(string, string) (string, string, bool), allowedRoles ...string) func(http.HandlerFunc) http.HandlerFunc {
	allowed := make(map[string]struct{})
	for _, role := range allowedRoles {
		allowed[role] = struct{}{}
	}
	return func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {

			dump, _ := httputil.DumpRequest(r, true)
			log.Printf("[LOG] dump: %v", string(dump))

			cookie, err := r.Cookie(AuthCookieName) // cookie = read the Cookie value, like in the dumped request above
			// dGVuYW50OnRlbmFudDoxNzkyNjY3MDYx.dtDcl1Qgqc5VsHjDRTJDq10NQLchiZdodmbx33dwX14
			if err != nil {
				httpx.WriteUnauthorized(w, "authentication required")
				return
			}
			_, role, ok := verifyToken(cookie.Value, tokenSecret)
			if !ok {
				httpx.WriteUnauthorized(w, "authentication required")
				return
			}
			if _, ok := allowed[role]; !ok {
				httpx.WriteForbidden(w, "insufficient permissions")
				return
			}
			next(w, r)
		}
	}
}

// WithCORS wraps an http.Handler with CORS headers.
func WithCORS(next http.Handler, allowedOrigins []string) http.Handler {
	allowedMap := make(map[string]struct{})
	for _, origin := range allowedOrigins {
		allowedMap[origin] = struct{}{}
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin != "" {
			if _, ok := allowedMap[origin]; ok || len(allowedOrigins) == 0 {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Access-Control-Allow-Credentials", "true")
				w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
				w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
			}
		}

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}
