package tenantportal

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	maintenancerepo "backend/internal/maintenance/repository"
	maintenanceusecase "backend/internal/maintenance/usecase"
	"backend/internal/pkg/httpx"
	"backend/internal/pkg/response"
)

// tenantPriorities are the priorities a tenant may choose. Urgent is reserved for admins.
var tenantPriorities = map[string]bool{"low": true, "normal": true, "high": true}

type maintenanceCreateRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Category    string `json:"category"`
	Priority    string `json:"priority"`
}

type tenantListRequest struct {
	CurrentPage int    `json:"current_page"`
	PerPage     int    `json:"per_page"`
	Keyword     string `json:"keyword"`
	Status      string `json:"status"`
}

// tenantUnitID returns the unit the tenant currently lives in. found is false when none is assigned.
func (c *Controller) tenantUnitID(tenantID uint) (uint, bool, error) {
	var row struct {
		UnitID *uint
	}
	err := c.db.Raw(`SELECT unit_id FROM tenants WHERE id = ?`, tenantID).Scan(&row).Error
	if err != nil {
		return 0, false, err
	}
	if row.UnitID == nil || *row.UnitID == 0 {
		return 0, false, nil
	}
	return *row.UnitID, true, nil
}

// MaintenanceCreate files a repair request for the tenant's unit. The tenant is never taken from the body.
func (c *Controller) MaintenanceCreate(w http.ResponseWriter, r *http.Request) {
	tenantID, err := c.currentTenantID(r)
	if err != nil {
		response.WriteError(w, http.StatusNotFound, "TENANT_NOT_LINKED", "no tenant profile is linked to this account")
		return
	}
	var req maintenanceCreateRequest
	if json.NewDecoder(r.Body).Decode(&req) != nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid request body")
		return
	}
	priority := strings.TrimSpace(req.Priority)
	if priority == "" {
		priority = "normal"
	}
	if !tenantPriorities[priority] {
		response.WriteError(w, http.StatusBadRequest, "INVALID_PRIORITY", "priority must be low, normal or high")
		return
	}
	unitID, found, err := c.tenantUnitID(tenantID)
	if err != nil {
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to load unit")
		return
	}
	if !found {
		response.WriteError(w, http.StatusBadRequest, "NO_UNIT", "no unit is assigned to this tenant")
		return
	}

	d, err := c.maintenance.Create(maintenanceusecase.CreateInput{
		Title:       req.Title,
		Description: req.Description,
		Category:    req.Category,
		Priority:    priority,
		UnitID:      unitID,
		TenantID:    &tenantID,
	})
	switch {
	case errors.Is(err, maintenanceusecase.ErrInvalidInput), errors.Is(err, maintenanceusecase.ErrUnitNotFound):
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "title and a valid category are required")
		return
	case err != nil:
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to create request")
		return
	}
	response.WriteSuccess(w, http.StatusOK, d)
}

// MaintenanceList returns only the tenant's own repair requests.
func (c *Controller) MaintenanceList(w http.ResponseWriter, r *http.Request) {
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
	rows, total, err := c.maintenance.List(maintenancerepo.Filter{
		Keyword:  strings.TrimSpace(req.Keyword),
		Status:   strings.TrimSpace(req.Status),
		TenantID: &tenantID,
	}, page, perPage)
	if err != nil {
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to list requests")
		return
	}
	summary, err := c.maintenanceSummary(tenantID)
	if err != nil {
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to summarise requests")
		return
	}
	response.WriteSuccess(w, http.StatusOK, response.NewListData(rows, page, perPage, total).WithSummary(summary))
}

// MaintenanceDetail returns one repair request. Requests belonging to other tenants report 404.
func (c *Controller) MaintenanceDetail(w http.ResponseWriter, r *http.Request) {
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
	d, err := c.maintenance.Detail(id)
	if errors.Is(err, maintenancerepo.ErrNotFound) || (err == nil && (d.TenantID == nil || *d.TenantID != tenantID)) {
		response.WriteError(w, http.StatusNotFound, "NOT_FOUND", "request not found")
		return
	}
	if err != nil {
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to load request")
		return
	}
	response.WriteSuccess(w, http.StatusOK, d)
}
