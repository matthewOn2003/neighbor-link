package delivery

import (
	"net/http"

	"backend/internal/pkg/middleware"
	userdelivery "backend/internal/user/delivery"
)

func NewContractRouter(c *ContractController, secret string, origins []string) http.Handler {
	mux := http.NewServeMux()
	adminMiddleware := middleware.RequireRole(secret, userdelivery.VerifyToken, "admin")

	mux.HandleFunc("POST /api/v1/contract/list", adminMiddleware(c.List))
	mux.HandleFunc("POST /api/v1/contract/detail/{id}", adminMiddleware(c.Detail))
	mux.HandleFunc("POST /api/v1/contract/create", adminMiddleware(c.Create))
	mux.HandleFunc("POST /api/v1/contract/update/{id}", adminMiddleware(c.Update))

	return middleware.WithCORS(mux, origins)
}
