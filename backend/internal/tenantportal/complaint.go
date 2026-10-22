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
		httpx.WriteNotFound(w, "no tenant profile is linked to this account")
		return
	}
	var req complaintCreateRequest
	if json.NewDecoder(r.Body).Decode(&req) != nil {
		httpx.WriteInvalidInput(w, "invalid request body")
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
		httpx.WriteInvalidInput(w, "title and a valid category are required")
		return
	case errors.Is(err, complaintusecase.ErrTenantNotLinked):
		httpx.WriteNotFound(w, "no tenant profile is linked to this account")
		return
	case err != nil:
		httpx.WriteInternalError(w, "failed to create complaint")
		return
	}
	httpx.WriteOK(w, d)
}

// ComplaintList returns only the tenant's own complaints.
func (c *Controller) ComplaintList(w http.ResponseWriter, r *http.Request) {
	tenantID, err := c.currentTenantID(r)
	if err != nil {
		httpx.WriteNotFound(w, "no tenant profile is linked to this account")
		return
	}
	var req tenantListRequest
	if json.NewDecoder(r.Body).Decode(&req) != nil {
		httpx.WriteInvalidInput(w, "invalid request body")
		return
	}
	page, perPage := httpx.NormalizePagination(req.CurrentPage, req.PerPage)
	rows, total, err := c.complaints.List(complaintrepo.Filter{
		Keyword:  strings.TrimSpace(req.Keyword),
		Status:   strings.TrimSpace(req.Status),
		TenantID: &tenantID,
	}, page, perPage)
	if err != nil {
		httpx.WriteInternalError(w, "failed to list complaints")
		return
	}
	summary, err := c.complaintSummary(tenantID)
	if err != nil {
		httpx.WriteInternalError(w, "failed to summarise complaints")
		return
	}
	httpx.WriteOK(w, response.NewListData(rows, page, perPage, total).WithSummary(summary))
}

// ComplaintDetail returns one complaint. Complaints belonging to other tenants report 404.
func (c *Controller) ComplaintDetail(w http.ResponseWriter, r *http.Request) {
	tenantID, err := c.currentTenantID(r)
	if err != nil {
		httpx.WriteNotFound(w, "no tenant profile is linked to this account")
		return
	}
	id, err := httpx.ParseIDParam(r)
	if err != nil {
		httpx.WriteInvalidInput(w, "invalid id")
		return
	}
	d, err := c.complaints.DetailForTenant(tenantID, id)
	if errors.Is(err, complaintrepo.ErrNotFound) {
		httpx.WriteNotFound(w, "complaint not found")
		return
	}
	if err != nil {
		httpx.WriteInternalError(w, "failed to load complaint")
		return
	}
	notes, err := c.loadNotes("complaint", d.ID)
	if err != nil {
		httpx.WriteInternalError(w, "failed to load complaint")
		return
	}
	httpx.WriteOK(w, complaintDetailView{Detail: d, Notes: notes})
}
