package delivery

import (
	"backend/internal/pkg/middleware"
	userdelivery "backend/internal/user/delivery"
	"net/http"
)

type TenantRouter struct {
	controller *TenantController
	secret     string
	origins    []string
}

func NewTenantRouter(controller *TenantController, tokenSecret string, allowedOrigins []string) http.Handler {
	mux := http.NewServeMux()

	authMiddleware := middleware.RequireAuth(tokenSecret, userdelivery.VerifyToken)

	mux.HandleFunc("POST /api/v1/tenant/list", authMiddleware(controller.List))
	mux.HandleFunc("POST /api/v1/tenant/detail/{id}", authMiddleware(controller.Detail))
	mux.HandleFunc("POST /api/v1/tenant/create", authMiddleware(controller.Create))
	mux.HandleFunc("POST /api/v1/tenant/update/{id}", authMiddleware(controller.Update))
	mux.HandleFunc("POST /api/v1/tenant/delete/{id}", authMiddleware(controller.Delete))

	return middleware.WithCORS(mux, allowedOrigins)
}
