package delivery

import (
	"backend/internal/pkg/middleware"
	userdelivery "backend/internal/user/delivery"
	"net/http"
)

type PropertyRouter struct {
	controller *PropertyController
	secret     string
	origins    []string
}

func NewPropertyRouter(controller *PropertyController, tokenSecret string, allowedOrigins []string) http.Handler {
	mux := http.NewServeMux()

	authMiddleware := middleware.RequireAuth(tokenSecret, userdelivery.VerifyToken)

	mux.HandleFunc("POST /api/v1/property/list", authMiddleware(controller.List))
	mux.HandleFunc("POST /api/v1/property/facets", authMiddleware(controller.Facets))
	mux.HandleFunc("POST /api/v1/property/detail/{id}", authMiddleware(controller.Detail))
	mux.HandleFunc("POST /api/v1/property/block/list", authMiddleware(controller.BlockList))
	mux.HandleFunc("POST /api/v1/property/block/{id}", authMiddleware(controller.BlockDetail))
	mux.HandleFunc("POST /api/v1/property/floor/list", authMiddleware(controller.FloorList))
	mux.HandleFunc("POST /api/v1/property/floor/{id}", authMiddleware(controller.FloorDetail))
	mux.HandleFunc("POST /api/v1/property/unit/list", authMiddleware(controller.UnitList))
	mux.HandleFunc("POST /api/v1/property/create", authMiddleware(controller.Create))
	mux.HandleFunc("POST /api/v1/property/update/{id}", authMiddleware(controller.Update))
	mux.HandleFunc("POST /api/v1/property/delete/{id}", authMiddleware(controller.Delete))

	return middleware.WithCORS(mux, allowedOrigins)
}
