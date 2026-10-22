package delivery

import (
	"encoding/json"
	"net/http"
	"strings"

	"backend/internal/dictionary/usecase"
	"backend/internal/pkg/httpx"
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
		httpx.WriteInvalidInput(w, "invalid request body")
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
		httpx.WriteInvalidInput(w, "keys is required")
		return
	}
	dropdown, err := c.usecase.Dropdown(keys)
	if err != nil {
		httpx.WriteInternalError(w, "failed to load dropdown")
		return
	}
	httpx.WriteOK(w, map[string]any{"dropdown": dropdown})
}
