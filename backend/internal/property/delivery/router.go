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

	adminMiddleware := middleware.RequireRole(tokenSecret, userdelivery.VerifyToken, "admin")

	mux.HandleFunc("POST /api/v1/property/list", adminMiddleware(controller.List))
	mux.HandleFunc("POST /api/v1/property/facets", adminMiddleware(controller.Facets))
	mux.HandleFunc("POST /api/v1/property/detail", adminMiddleware(controller.Detail))
	mux.HandleFunc("POST /api/v1/property/block/list", adminMiddleware(controller.BlockList))
	mux.HandleFunc("POST /api/v1/property/block/detail", adminMiddleware(controller.BlockDetail))
	mux.HandleFunc("POST /api/v1/property/floor/list", adminMiddleware(controller.FloorList))
	mux.HandleFunc("POST /api/v1/property/floor/detail", adminMiddleware(controller.FloorDetail))
	mux.HandleFunc("POST /api/v1/property/unit/list", adminMiddleware(controller.UnitList))
	mux.HandleFunc("POST /api/v1/property/unit/create", adminMiddleware(controller.UnitCreate))
	mux.HandleFunc("POST /api/v1/property/unit/update", adminMiddleware(controller.UnitUpdate))
	mux.HandleFunc("POST /api/v1/property/create", adminMiddleware(controller.Create))
	mux.HandleFunc("POST /api/v1/property/update", adminMiddleware(controller.Update))
	mux.HandleFunc("POST /api/v1/property/delete", adminMiddleware(controller.Delete))
	mux.HandleFunc("POST /api/v1/property/cover/upload", adminMiddleware(controller.UploadCover))

	return middleware.WithCORS(mux, allowedOrigins)
}
