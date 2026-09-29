package delivery

import (
	"backend/internal/pkg/middleware"
	"backend/internal/user/usecase"
	"net/http"
)

// AuthCookieName is exposed so other modules can reuse the same session cookie.
const AuthCookieName = middleware.AuthCookieName

// NewUserHandler preserves backward compatibility while delegating to UserController and UserRouter.
func NewUserHandler(uc *usecase.UserUsecase, tokenSecret string, allowedOrigins []string, cookieSecure bool) http.Handler {
	controller := NewUserController(uc, tokenSecret, cookieSecure)
	return NewUserRouter(controller, tokenSecret, allowedOrigins)
}

// WithCORS is exposed so other modules can apply the same CORS policy.
func WithCORS(next http.Handler, allowedOrigins []string) http.Handler {
	return middleware.WithCORS(next, allowedOrigins)
}

