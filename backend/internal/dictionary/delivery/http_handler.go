package delivery

import (
	"backend/internal/dictionary/usecase"
	"net/http"
)

// NewDictionaryHandler exposes GET /api/v1/dictionary/options?slug=xxx so the
// frontend can fetch dropdown options (statuses, etc.) without hardcoding them.
// Preserves backward compatibility while delegating to DictionaryController and DictionaryRouter.
func NewDictionaryHandler(uc *usecase.DictionaryUsecase, tokenSecret string, allowedOrigins []string) http.Handler {
	controller := NewDictionaryController(uc)
	return NewDictionaryRouter(controller, tokenSecret, allowedOrigins)
}

