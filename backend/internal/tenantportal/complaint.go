package tenantportal

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	complaintrepo "backend/internal/complaint/repository"
	complaintusecase "backend/internal/complaint/usecase"
	"backend/internal/pkg/httpx"
	"backend/internal/pkg/response"
)

// complaintDetailView is one complaint with the property notes written on it.
type complaintDetailView struct {
	*complaintrepo.Detail
	Notes []noteItem `json:"notes"`
}

type complaintCreateRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Category    string `json:"category"`
}

// ComplaintCreate files a complaint on behalf of the logged-in tenant.
func (c *Controller) ComplaintCreate(w http.ResponseWriter, r *http.Request) {
	tenantID, err := c.currentTenantID(r)
	if err != nil {
		response.WriteError(w, http.StatusNotFound, "TENANT_NOT_LINKED", "no tenant profile is linked to this account")
		return
	}
	var req complaintCreateRequest
	if json.NewDecoder(r.Body).Decode(&req) != nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid request body")
		return
	}
	d, err := c.complaints.Create(complaintusecase.CreateInput{
		TenantID:    tenantID,
		Category:    req.Category,
		Title:       req.Title,
		Description: req.Description,
	})
	switch {
	case errors.Is(err, complaintusecase.ErrInvalidInput):
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "title and a valid category are required")
		return
	case errors.Is(err, complaintusecase.ErrTenantNotLinked):
		response.WriteError(w, http.StatusNotFound, "TENANT_NOT_LINKED", "no tenant profile is linked to this account")
		return
	case err != nil:
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to create complaint")
		return
	}
	response.WriteSuccess(w, http.StatusOK, d)
}

// ComplaintList returns only the tenant's own complaints.
func (c *Controller) ComplaintList(w http.ResponseWriter, r *http.Request) {
	tenantID, err := c.currentTenantID(r)
	if err != nil {
		response.WriteError(w, http.StatusNotFound, "TENANT_NOT_LINKED", "no tenant profile is linked to this account")
		return
	}
	var req tenantListRequest
	if json.NewDecoder(r.Body).Decode(&req) != nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid request body")
		return
	}
	page, perPage := httpx.NormalizePagination(req.CurrentPage, req.PerPage)
	rows, total, err := c.complaints.List(complaintrepo.Filter{
		Keyword:  strings.TrimSpace(req.Keyword),
		Status:   strings.TrimSpace(req.Status),
		TenantID: &tenantID,
	}, page, perPage)
	if err != nil {
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to list complaints")
		return
	}
	summary, err := c.complaintSummary(tenantID)
	if err != nil {
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to summarise complaints")
		return
	}
	response.WriteSuccess(w, http.StatusOK, response.NewListData(rows, page, perPage, total).WithSummary(summary))
}

// ComplaintDetail returns one complaint. Complaints belonging to other tenants report 404.
func (c *Controller) ComplaintDetail(w http.ResponseWriter, r *http.Request) {
	tenantID, err := c.currentTenantID(r)
	if err != nil {
		response.WriteError(w, http.StatusNotFound, "TENANT_NOT_LINKED", "no tenant profile is linked to this account")
		return
	}
	id, err := httpx.ParseIDParam(r)
	if err != nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid id")
		return
	}
	d, err := c.complaints.DetailForTenant(tenantID, id)
	if errors.Is(err, complaintrepo.ErrNotFound) {
		response.WriteError(w, http.StatusNotFound, "NOT_FOUND", "complaint not found")
		return
	}
	if err != nil {
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to load complaint")
		return
	}
	notes, err := c.loadNotes("complaint", d.ID)
	if err != nil {
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to load complaint")
		return
	}
	response.WriteSuccess(w, http.StatusOK, complaintDetailView{Detail: d, Notes: notes})
}
