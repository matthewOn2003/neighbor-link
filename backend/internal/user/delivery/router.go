package delivery

import (
	"backend/internal/pkg/middleware"
	"net/http"
)

type UserRouter struct {
	controller *UserController
	secret     string
	origins    []string
}

func NewUserRouter(controller *UserController, tokenSecret string, allowedOrigins []string) http.Handler {
	mux := http.NewServeMux()

	authMiddleware := middleware.RequireAuth(tokenSecret, VerifyToken)

	// Health check endpoint for the Render service
	mux.HandleFunc("GET /health", controller.Health)

	mux.HandleFunc("POST /api/v1/auth/login", controller.Login)
	mux.HandleFunc("POST /api/v1/auth/session", authMiddleware(controller.Session))
	mux.HandleFunc("POST /api/v1/auth/logout", controller.Logout)

	return middleware.WithCORS(mux, allowedOrigins)
}
