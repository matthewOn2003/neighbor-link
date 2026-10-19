package tenantportal

import (
	"net/http"

	"backend/internal/pkg/middleware"
	userdelivery "backend/internal/user/delivery"
)

func NewRouter(c *Controller, tokenSecret string, allowedOrigins []string) http.Handler {
	mux := http.NewServeMux()

	tenantOnly := middleware.RequireRole(tokenSecret, userdelivery.VerifyToken, "tenant")

	mux.HandleFunc("POST /api/v1/tenant-portal/me", tenantOnly(c.Me))
	mux.HandleFunc("POST /api/v1/tenant-portal/bills", tenantOnly(c.Bills))

	return middleware.WithCORS(mux, allowedOrigins)
}
