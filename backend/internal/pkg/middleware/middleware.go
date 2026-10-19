package middleware

import (
	"backend/internal/pkg/response"
	"net/http"
)

const AuthCookieName = "auth_token"

// RequireAuth returns a middleware that validates the auth_token cookie.
func RequireAuth(tokenSecret string, verifyToken func(string, string) (string, string, bool)) func(http.HandlerFunc) http.HandlerFunc {
	return func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			cookie, err := r.Cookie(AuthCookieName)
			if err != nil {
				response.WriteError(w, http.StatusUnauthorized, "UNAUTHENTICATED", "authentication required")
				return
			}
			if _, _, ok := verifyToken(cookie.Value, tokenSecret); !ok {
				response.WriteError(w, http.StatusUnauthorized, "UNAUTHENTICATED", "authentication required")
				return
			}
			next(w, r)
		}
	}
}

// RequireRole validates the session and restricts the endpoint to the supplied roles.
func RequireRole(tokenSecret string, verifyToken func(string, string) (string, string, bool), allowedRoles ...string) func(http.HandlerFunc) http.HandlerFunc {
	allowed := make(map[string]struct{}, len(allowedRoles))
	for _, role := range allowedRoles {
		allowed[role] = struct{}{}
	}
	return func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			cookie, err := r.Cookie(AuthCookieName)
			if err != nil {
				response.WriteError(w, http.StatusUnauthorized, "UNAUTHENTICATED", "authentication required")
				return
			}
			_, role, ok := verifyToken(cookie.Value, tokenSecret)
			if !ok {
				response.WriteError(w, http.StatusUnauthorized, "UNAUTHENTICATED", "authentication required")
				return
			}
			if _, ok := allowed[role]; !ok {
				response.WriteError(w, http.StatusForbidden, "FORBIDDEN", "insufficient permissions")
				return
			}
			next(w, r)
		}
	}
}

// WithCORS wraps an http.Handler with CORS headers.
func WithCORS(next http.Handler, allowedOrigins []string) http.Handler {
	allowedMap := make(map[string]struct{}, len(allowedOrigins))
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
