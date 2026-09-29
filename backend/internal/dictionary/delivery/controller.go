package delivery

import (
	"net/http"

	"backend/internal/dictionary/usecase"
	"backend/internal/pkg/response"
)

type DictionaryController struct {
	usecase *usecase.DictionaryUsecase
}

func NewDictionaryController(uc *usecase.DictionaryUsecase) *DictionaryController {
	return &DictionaryController{usecase: uc}
}

func (c *DictionaryController) Options(w http.ResponseWriter, r *http.Request) {
	slug := r.URL.Query().Get("slug")
	if slug == "" {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "slug is required")
		return
	}
	options, err := c.usecase.ListOptions(slug)
	if err != nil {
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to load options")
		return
	}
	response.WriteSuccess(w, http.StatusOK, options)
}
