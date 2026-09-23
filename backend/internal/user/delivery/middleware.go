package delivery

import (
	"net/http"
)

// requireAuth rejects requests without a valid auth_token cookie.
func (h *UserHandler) requireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie(authCookieName)
		if err != nil {
			writeUnauthenticated(w)
			return
		}
		if _, _, ok := verifyToken(cookie.Value, h.secret); !ok {
			writeUnauthenticated(w)
			return
		}
		next(w, r)
	}
}
