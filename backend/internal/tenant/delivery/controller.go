package delivery

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

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

func parsePagination(r *http.Request) (currentPage, perPage int) {
	currentPage, perPage = 1, 10
	if v, err := strconv.Atoi(r.URL.Query().Get("current_page")); err == nil && v > 0 {
		currentPage = v
	}
	if v, err := strconv.Atoi(r.URL.Query().Get("per_page")); err == nil && v > 0 {
		perPage = v
	}
	return
}

func parseIDParam(r *http.Request) (uint, error) {
	id, err := strconv.ParseUint(r.PathValue("id"), 10, 64)
	if err != nil {
		return 0, err
	}
	return uint(id), nil
}

func (c *TenantController) List(w http.ResponseWriter, r *http.Request) {
	currentPage, perPage := parsePagination(r)
	tenants, total, err := c.usecase.List(currentPage, perPage)
	if err != nil {
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to list tenants")
		return
	}
	response.WriteSuccess(w, http.StatusOK, response.NewListData(tenants, currentPage, perPage, total))
}

func (c *TenantController) Detail(w http.ResponseWriter, r *http.Request) {
	id, err := parseIDParam(r)
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
	Status     string `json:"status"`
}

type tenantCreateResponse struct {
	repository.Tenant
	GeneratedPassword string `json:"generated_password"`
}

func (c *TenantController) Create(w http.ResponseWriter, r *http.Request) {
	var req tenantCreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Username == "" || req.Name == "" || req.Phone == "" {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "username, name and phone are required")
		return
	}
	tenant, generatedPassword, err := c.usecase.CreateTenant(req.Username, req.Name, req.Phone, req.Email, req.PropertyID, req.Status)
	if err != nil {
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to create tenant")
		return
	}
	response.WriteSuccess(w, http.StatusCreated, tenantCreateResponse{Tenant: *tenant, GeneratedPassword: generatedPassword})
}

type tenantUpdateRequest struct {
	Name       string `json:"name"`
	Phone      string `json:"phone"`
	Email      string `json:"email"`
	PropertyID *uint  `json:"property_id"`
	Status     string `json:"status"`
}

func (c *TenantController) Update(w http.ResponseWriter, r *http.Request) {
	id, err := parseIDParam(r)
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
	if req.Status != "" {
		tenant.Status = req.Status
	}
	if err := c.usecase.Update(tenant); err != nil {
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to update tenant")
		return
	}
	response.WriteSuccess(w, http.StatusOK, tenant)
}

func (c *TenantController) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := parseIDParam(r)
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
