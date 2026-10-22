package delivery

import (
	"backend/internal/property/usecase"
	"net/http"
)

// NewPropertyHandler preserves backward compatibility while delegating to PropertyController and PropertyRouter.
func NewPropertyHandler(uc *usecase.PropertyUsecase, tokenSecret string, allowedOrigins []string) http.Handler {
	controller := NewPropertyController(uc)
	return NewPropertyRouter(controller, tokenSecret, allowedOrigins)
}
