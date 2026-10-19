package delivery

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"backend/internal/pkg/httpx"
	"backend/internal/pkg/response"
	"backend/internal/tenant/repository"
	"backend/internal/tenant/usecase"

	"gorm.io/gorm"
)

type TenantController struct {
	usecase *usecase.TenantUsecase
}

func NewTenantController(uc *usecase.TenantUsecase) *TenantController {
	return &TenantController{usecase: uc}
}

type tenantListRequest struct {
	CurrentPage int    `json:"current_page"`
	PerPage     int    `json:"per_page"`
	Keyword     string `json:"keyword"`
	Status      string `json:"status"`
	PropertyID  string `json:"property_id"`
}

func parseTenantFilter(req tenantListRequest) (repository.TenantFilter, error) {
	propertyID, err := httpx.ParseOptionalID(req.PropertyID)
	if err != nil {
		return repository.TenantFilter{}, err
	}
	return repository.TenantFilter{
		Keyword: strings.TrimSpace(req.Keyword),
		Status: strings.TrimSpace(req.Status),
		PropertyID: propertyID,
	}, nil
}

func (c *TenantController) List(w http.ResponseWriter, r *http.Request) {
	var req tenantListRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid request body")
		return
	}
	currentPage, perPage := httpx.NormalizePagination(req.CurrentPage, req.PerPage)
	filter, err := parseTenantFilter(req)
	if err != nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid property_id")
		return
	}
	tenants, total, err := c.usecase.List(filter, currentPage, perPage)
	if err != nil {
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to list tenants")
		return
	}
	response.WriteSuccess(w, http.StatusOK, response.NewListData(tenants, currentPage, perPage, total))
}

func (c *TenantController) Detail(w http.ResponseWriter, r *http.Request) {
	id, err := httpx.ParseIDParam(r)
	if err != nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid id")
		return
	}
	tenant, err := c.usecase.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.WriteError(w, http.StatusNotFound, "NOT_FOUND", "tenant not found")
			return
		}
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to load tenant")
		return
	}
	response.WriteSuccess(w, http.StatusOK, tenant)
}

type tenantCreateRequest struct {
	Username   string `json:"username"`
	Name       string `json:"name"`
	Phone      string `json:"phone"`
	Email      string `json:"email"`
	PropertyID *uint  `json:"property_id"`
	UnitID     *uint  `json:"unit_id"`
	Status     string `json:"status"`
}

type tenantCreateResponse struct {
	repository.Tenant
	Username          string `json:"username"`
	GeneratedPassword string `json:"generated_password"`
}

func (c *TenantController) Create(w http.ResponseWriter, r *http.Request) {
	var req tenantCreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Username == "" || req.Name == "" || req.Phone == "" {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "username, name and phone are required")
		return
	}
	tenant, generatedPassword, err := c.usecase.CreateTenant(req.Username, req.Name, req.Phone, req.Email, req.PropertyID, req.UnitID, req.Status)
	if err != nil {
		writeUnitError(w, err, "failed to create tenant")
		return
	}
	response.WriteSuccess(w, http.StatusCreated, tenantCreateResponse{Tenant: *tenant, Username: req.Username, GeneratedPassword: generatedPassword})
}

// writeUnitError maps unit assignment failures to client errors; anything else becomes a 500.
func writeUnitError(w http.ResponseWriter, err error, fallback string) {
	switch {
	case errors.Is(err, repository.ErrUnitNotFound):
		response.WriteError(w, http.StatusBadRequest, "UNIT_NOT_FOUND", "unit not found")
	case errors.Is(err, repository.ErrUnitNotVacant):
		response.WriteError(w, http.StatusConflict, "UNIT_NOT_VACANT", "unit is not vacant")
	default:
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", fallback)
	}
}

type tenantUpdateRequest struct {
	Name       string `json:"name"`
	Phone      string `json:"phone"`
	Email      string `json:"email"`
	PropertyID *uint  `json:"property_id"`
	UnitID     *uint  `json:"unit_id"`
	Status     string `json:"status"`
}

func (c *TenantController) Update(w http.ResponseWriter, r *http.Request) {
	id, err := httpx.ParseIDParam(r)
	if err != nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid id")
		return
	}
	tenant, err := c.usecase.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.WriteError(w, http.StatusNotFound, "NOT_FOUND", "tenant not found")
			return
		}
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to load tenant")
		return
	}
	var req tenantUpdateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid request body")
		return
	}
	if req.Name != "" {
		tenant.Name = req.Name
	}
	if req.Phone != "" {
		tenant.Phone = req.Phone
	}
	tenant.Email = req.Email
	tenant.PropertyID = req.PropertyID
	tenant.UnitID = req.UnitID
	if req.Status != "" {
		tenant.Status = req.Status
	}
	if err := c.usecase.Update(tenant); err != nil {
		writeUnitError(w, err, "failed to update tenant")
		return
	}
	response.WriteSuccess(w, http.StatusOK, tenant)
}

func (c *TenantController) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := httpx.ParseIDParam(r)
	if err != nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid id")
		return
	}
	if err := c.usecase.Delete(id); err != nil {
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to delete tenant")
		return
	}
	response.WriteSuccess(w, http.StatusOK, map[string]uint{"id": id})
}