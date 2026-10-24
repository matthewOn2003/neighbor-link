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

	adminMiddleware := middleware.RequireRole(tokenSecret, userdelivery.VerifyToken, "admin")

	mux.HandleFunc("POST /api/v1/tenant/list", adminMiddleware(controller.List))
	mux.HandleFunc("POST /api/v1/tenant/detail", adminMiddleware(controller.Detail))
	mux.HandleFunc("POST /api/v1/tenant/create", adminMiddleware(controller.Create))
	mux.HandleFunc("POST /api/v1/tenant/update", adminMiddleware(controller.Update))
	mux.HandleFunc("POST /api/v1/tenant/delete", adminMiddleware(controller.Delete))

	return middleware.WithCORS(mux, allowedOrigins)
}
