package delivery

import (
	"net/http"

	"backend/internal/pkg/middleware"
	userdelivery "backend/internal/user/delivery"
)

// NewComplaintRouter serves the admin complaint routes.
func NewComplaintRouter(c *ComplaintController, tokenSecret string, allowedOrigins []string) http.Handler {
	mux := http.NewServeMux()
	admin := middleware.RequireRole(tokenSecret, userdelivery.VerifyToken, "admin")

	mux.HandleFunc("POST /api/v1/complaint/list", admin(c.List))
	mux.HandleFunc("POST /api/v1/complaint/detail", admin(c.Detail))
	mux.HandleFunc("POST /api/v1/complaint/update", admin(c.Update))

	return middleware.WithCORS(mux, allowedOrigins)
}
