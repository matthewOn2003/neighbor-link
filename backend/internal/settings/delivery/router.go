package delivery

import (
	"net/http"

	"backend/internal/pkg/middleware"
	userdelivery "backend/internal/user/delivery"
)

func NewSettingsRouter(c *SettingsController, tokenSecret string, allowedOrigins []string) http.Handler {
	mux := http.NewServeMux()
	admin := middleware.RequireRole(tokenSecret, userdelivery.VerifyToken, "admin")

	mux.HandleFunc("POST /api/v1/billing-settings/detail", admin(c.BillingDetail))
	mux.HandleFunc("POST /api/v1/billing-settings/update", admin(c.BillingUpdate))

	return middleware.WithCORS(mux, allowedOrigins)
}
