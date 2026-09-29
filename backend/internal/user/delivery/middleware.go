package delivery

import (
	"backend/internal/pkg/middleware"
	"net/http"
)

// requireAuth rejects requests without a valid auth_token cookie.
func (c *UserController) requireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie(middleware.AuthCookieName)
		if err != nil {
			writeUnauthenticated(w)
			return
		}
		if _, _, ok := verifyToken(cookie.Value, c.secret); !ok {
			writeUnauthenticated(w)
			return
		}
		next(w, r)
	}
}

