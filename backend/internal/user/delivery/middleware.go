package delivery

import "net/http"

// requireAuth rejects requests without a valid auth_token cookie.
func (h *UserHandler) requireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("auth_token")
		if err != nil {
			writeError(w, http.StatusUnauthorized, "authentication required")
			return
		}
		if _, _, ok := verifyToken(cookie.Value, h.secret); !ok {
			writeError(w, http.StatusUnauthorized, "authentication required")
			return
		}
		next(w, r)
	}
}
