package delivery

import (
	"backend/internal/tenant/usecase"
	"net/http"
)

// NewTenantHandler preserves backward compatibility while delegating to TenantController and TenantRouter.
func NewTenantHandler(uc *usecase.TenantUsecase, tokenSecret string, allowedOrigins []string) http.Handler {
	controller := NewTenantController(uc)
	return NewTenantRouter(controller, tokenSecret, allowedOrigins)
}

