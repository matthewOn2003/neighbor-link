package delivery

import (
	"net/http"

	"backend/internal/pkg/middleware"
	userdelivery "backend/internal/user/delivery"
)

// NewPaymentRouter serves admin payment routes. Tenant-facing routes are reserved and not served here:
// /api/v1/tenant-portal/payment-proof/* and /api/v1/tenant-portal/maintenance/*.
func NewPaymentRouter(c *PaymentController, tokenSecret string, allowedOrigins []string) http.Handler {
	mux := http.NewServeMux()
	admin := middleware.RequireRole(tokenSecret, userdelivery.VerifyToken, "admin")

	mux.HandleFunc("POST /api/v1/payment/list", admin(c.PaymentList))
	mux.HandleFunc("POST /api/v1/payment-proof/list", admin(c.ProofList))
	mux.HandleFunc("POST /api/v1/payment-proof/approve", admin(c.Approve))
	mux.HandleFunc("POST /api/v1/payment-proof/reject", admin(c.Reject))

	return middleware.WithCORS(mux, allowedOrigins)
}
