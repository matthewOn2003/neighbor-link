package delivery

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"backend/internal/complaint/repository"
	"backend/internal/complaint/usecase"
	"backend/internal/pkg/httpx"
	"backend/internal/pkg/response"
)

type ComplaintController struct {
	uc *usecase.ComplaintUsecase
}

func NewComplaintController(uc *usecase.ComplaintUsecase) *ComplaintController {
	return &ComplaintController{uc: uc}
}

type listRequest struct {
	CurrentPage int    `json:"current_page"`
	PerPage     int    `json:"per_page"`
	Keyword     string `json:"keyword"`
	Status      string `json:"status"`
	Category    string `json:"category"`
	TenantID    string `json:"tenant_id"`
}

func (c *ComplaintController) List(w http.ResponseWriter, r *http.Request) {
	var req listRequest
	if json.NewDecoder(r.Body).Decode(&req) != nil {
		httpx.WriteInvalidInput(w, "invalid request body")

		return
	}
	tenantID, err := httpx.ParseOptionalID(req.TenantID)
	if err != nil {
		httpx.WriteInvalidInput(w, "invalid tenant_id")
		return
	}
	page, perPage := httpx.NormalizePagination(req.CurrentPage, req.PerPage)
	rows, total, err := c.uc.List(repository.Filter{
		Keyword:  strings.TrimSpace(req.Keyword),
		Status:   strings.TrimSpace(req.Status),
		Category: strings.TrimSpace(req.Category),
		TenantID: tenantID,
	}, page, perPage)
	if err != nil {
		httpx.WriteInternalError(w, "failed to list complaints")
		return
	}
	httpx.WriteOK(w, response.NewListData(rows, page, perPage, total))
}

func (c *ComplaintController) Detail(w http.ResponseWriter, r *http.Request) {
	id, err := httpx.ParseIDParam(r)
	if err != nil {
		httpx.WriteInvalidInput(w, "invalid id")
		return
	}
	d, err := c.uc.Detail(id)
	if errors.Is(err, repository.ErrNotFound) {
		httpx.WriteNotFound(w, "complaint not found")
		return
	}
	if err != nil {
		httpx.WriteInternalError(w, "failed to load complaint")
		return
	}
	httpx.WriteOK(w, d)
}

type updateRequest struct {
	Status          *string `json:"status"`
	Assignee        *string `json:"assignee"`
	ResolutionNotes *string `json:"resolution_notes"`
}

func (c *ComplaintController) Update(w http.ResponseWriter, r *http.Request) {
	id, err := httpx.ParseIDParam(r)
	if err != nil {
		httpx.WriteInvalidInput(w, "invalid id")
		return
	}
	var req updateRequest
	if json.NewDecoder(r.Body).Decode(&req) != nil {
		httpx.WriteInvalidInput(w, "invalid request body")
		return
	}
	d, err := c.uc.Update(id, usecase.UpdateInput{
		Status:          req.Status,
		Assignee:        req.Assignee,
		ResolutionNotes: req.ResolutionNotes,
	})
	switch {
	case errors.Is(err, repository.ErrNotFound):
		httpx.WriteNotFound(w, "complaint not found")
		return
	case errors.Is(err, usecase.ErrInvalidInput):
		httpx.WriteInvalidInput(w, "invalid status")
		return
	case err != nil:
		httpx.WriteInternalError(w, "failed to update complaint")
		return
	}
	httpx.WriteOK(w, d)
}
