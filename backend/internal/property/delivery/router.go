package delivery

import (
	"backend/internal/pkg/middleware"
	userdelivery "backend/internal/user/delivery"
	"net/http"
)

type PropertyRouter struct {
	controller *PropertyController
	secret     string
	origins    []string
}

func NewPropertyRouter(controller *PropertyController, tokenSecret string, allowedOrigins []string) http.Handler {
	mux := http.NewServeMux()

	authMiddleware := middleware.RequireAuth(tokenSecret, userdelivery.VerifyToken)

	mux.HandleFunc("GET /api/v1/property/list", authMiddleware(controller.List))
	mux.HandleFunc("GET /api/v1/property/detail/{id}", authMiddleware(controller.Detail))
	mux.HandleFunc("POST /api/v1/property/create", authMiddleware(controller.Create))
	mux.HandleFunc("POST /api/v1/property/update/{id}", authMiddleware(controller.Update))
	mux.HandleFunc("POST /api/v1/property/delete/{id}", authMiddleware(controller.Delete))

	return middleware.WithCORS(mux, allowedOrigins)
}
