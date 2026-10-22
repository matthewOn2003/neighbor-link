package delivery

import (
	"backend/internal/pkg/middleware"
	userdelivery "backend/internal/user/delivery"
	"net/http"
)

func NewBillRouter(c *BillController, secret string, origins []string) http.Handler {
	mux := http.NewServeMux()
	adminMiddleware := middleware.RequireRole(secret, userdelivery.VerifyToken, "admin")
	mux.HandleFunc("POST /api/v1/bill/list", adminMiddleware(c.List))
	mux.HandleFunc("POST /api/v1/bill/detail/{id}", adminMiddleware(c.Detail))
	mux.HandleFunc("POST /api/v1/bill/create", adminMiddleware(c.Create))
	mux.HandleFunc("POST /api/v1/bill/generate", adminMiddleware(c.Generate))
	mux.HandleFunc("POST /api/v1/bill/payment/{id}", adminMiddleware(c.Payment))
	mux.HandleFunc("POST /api/v1/bill/update/{id}", adminMiddleware(c.Update))
	mux.HandleFunc("POST /api/v1/bill/void/{id}", adminMiddleware(c.Void))
	mux.HandleFunc("POST /api/v1/bill/active-contracts", adminMiddleware(c.ActiveContracts))
	return middleware.WithCORS(mux, origins)
}
