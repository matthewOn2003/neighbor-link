package delivery

import (
	"net/http"

	"backend/internal/pkg/middleware"
	userdelivery "backend/internal/user/delivery"
)

func NewDashboardRouter(c *DashboardController, tokenSecret string, allowedOrigins []string) http.Handler {
	mux := http.NewServeMux()
	admin := middleware.RequireRole(tokenSecret, userdelivery.VerifyToken, "admin")

	mux.HandleFunc("POST /api/v1/dashboard/overview", admin(c.Overview))

	return middleware.WithCORS(mux, allowedOrigins)
}
