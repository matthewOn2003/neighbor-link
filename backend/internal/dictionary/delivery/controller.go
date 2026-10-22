package delivery

import (
	"encoding/json"
	"net/http"
	"strings"

	"backend/internal/dictionary/usecase"
	"backend/internal/pkg/response"
)

type DictionaryController struct {
	usecase *usecase.DictionaryUsecase
}

func NewDictionaryController(uc *usecase.DictionaryUsecase) *DictionaryController {
	return &DictionaryController{usecase: uc}
}

func (c *DictionaryController) Dropdown(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Keys []string `json:"keys"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid request body")
		return
	}
	keys := make([]string, 0)
	seen := make(map[string]bool)
	for _, k := range req.Keys {
		k = strings.TrimSpace(k)
		if k == "" || seen[k] {
			continue
		}
		seen[k] = true
		keys = append(keys, k)
	}
	if len(keys) == 0 {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "keys is required")
		return
	}
	dropdown, err := c.usecase.Dropdown(keys)
	if err != nil {
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to load dropdown")
		return
	}
	response.WriteSuccess(w, http.StatusOK, map[string]any{"dropdown": dropdown})
}
