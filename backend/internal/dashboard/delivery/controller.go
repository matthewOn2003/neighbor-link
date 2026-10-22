package delivery

import (
	"net/http"
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

func (c *DashboardController) Overview(w http.ResponseWriter, r *http.Request) {
	overview, err := c.uc.Overview(time.Now())
	if err != nil {
		httpx.WriteInternalError(w, "failed to load dashboard overview")
		return
	}
	httpx.WriteOK(w, overview)
}
