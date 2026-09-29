package delivery

import (
	"backend/internal/pkg/middleware"
	userdelivery "backend/internal/user/delivery"
	"net/http"
)

type DictionaryRouter struct {
	controller *DictionaryController
	secret     string
	origins    []string
}

func NewDictionaryRouter(controller *DictionaryController, tokenSecret string, allowedOrigins []string) http.Handler {
	mux := http.NewServeMux()

	authMiddleware := middleware.RequireAuth(tokenSecret, userdelivery.VerifyToken)

	mux.HandleFunc("GET /api/v1/dictionary/options", authMiddleware(controller.Options))

	return middleware.WithCORS(mux, allowedOrigins)
}
