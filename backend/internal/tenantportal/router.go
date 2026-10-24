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
	mux.HandleFunc("POST /api/v1/tenant-portal/bills/detail", tenantOnly(c.BillDetail))
	mux.HandleFunc("POST /api/v1/tenant-portal/home", tenantOnly(c.Home))
	mux.HandleFunc("POST /api/v1/tenant-portal/announcement/list", tenantOnly(c.AnnouncementList))
	mux.HandleFunc("POST /api/v1/tenant-portal/wifi", tenantOnly(c.WiFi))
	mux.HandleFunc("POST /api/v1/tenant-portal/notification/list", tenantOnly(c.NotificationList))
	mux.HandleFunc("POST /api/v1/tenant-portal/notification/read", tenantOnly(c.NotificationRead))

	mux.HandleFunc("POST /api/v1/tenant-portal/payment-proof/create", tenantOnly(c.ProofCreate))
	mux.HandleFunc("POST /api/v1/tenant-portal/payment-proof/list", tenantOnly(c.ProofList))

	mux.HandleFunc("POST /api/v1/tenant-portal/maintenance/create", tenantOnly(c.MaintenanceCreate))
	mux.HandleFunc("POST /api/v1/tenant-portal/maintenance/list", tenantOnly(c.MaintenanceList))
	mux.HandleFunc("POST /api/v1/tenant-portal/maintenance/detail", tenantOnly(c.MaintenanceDetail))

	mux.HandleFunc("POST /api/v1/tenant-portal/complaint/create", tenantOnly(c.ComplaintCreate))
	mux.HandleFunc("POST /api/v1/tenant-portal/complaint/list", tenantOnly(c.ComplaintList))
	mux.HandleFunc("POST /api/v1/tenant-portal/complaint/detail", tenantOnly(c.ComplaintDetail))

	return middleware.WithCORS(mux, allowedOrigins)
}
