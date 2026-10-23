package delivery

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strings"
	"time"

	"backend/internal/dashboard/usecase"
	"backend/internal/pkg/httpx"
)

type DashboardController struct {
	uc *usecase.DashboardUsecase
}

func NewDashboardController(uc *usecase.DashboardUsecase) *DashboardController {
	return &DashboardController{uc: uc}
}

type overviewRequest struct {
	Cycle string `json:"cycle"`
}

// Overview accepts an optional JSON body {"cycle": "YYYY-MM"}; without it the current cycle is reported.
func (c *DashboardController) Overview(w http.ResponseWriter, r *http.Request) {
	var q overviewRequest
	if r.Body != nil {
		if err := json.NewDecoder(r.Body).Decode(&q); err != nil && !errors.Is(err, io.EOF) {
			httpx.WriteInvalidInput(w, "invalid request body")
			return
		}
	}

	now := time.Now()
	cycle := strings.TrimSpace(q.Cycle)
	if cycle != "" {
		if _, err := time.ParseInLocation("2006-01", cycle, now.Location()); err != nil {
			httpx.WriteInvalidInput(w, "cycle must be in YYYY-MM format")
			return
		}
	}

	overview, err := c.uc.Overview(now, cycle)
	if err != nil {
		httpx.WriteInternalError(w, "failed to load dashboard overview")
		return
	}
	httpx.WriteOK(w, overview)
}
