package delivery

import (
	"net/http"

	"backend/internal/pkg/middleware"
	userdelivery "backend/internal/user/delivery"
)

func NewMaintenanceRouter(c *MaintenanceController, tokenSecret string, allowedOrigins []string) http.Handler {
	mux := http.NewServeMux()
	admin := middleware.RequireRole(tokenSecret, userdelivery.VerifyToken, "admin")

	mux.HandleFunc("POST /api/v1/maintenance/list", admin(c.List))
	mux.HandleFunc("POST /api/v1/maintenance/detail/{id}", admin(c.Detail))
	mux.HandleFunc("POST /api/v1/maintenance/create", admin(c.Create))
	mux.HandleFunc("POST /api/v1/maintenance/update/{id}", admin(c.Update))

	return middleware.WithCORS(mux, allowedOrigins)
}
