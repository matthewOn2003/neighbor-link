package delivery

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"backend/internal/pkg/response"
	"backend/internal/property/repository"
	"backend/internal/property/usecase"

	"gorm.io/gorm"
)

type PropertyController struct {
	usecase *usecase.PropertyUsecase
}

func NewPropertyController(uc *usecase.PropertyUsecase) *PropertyController {
	return &PropertyController{usecase: uc}
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

func (c *PropertyController) List(w http.ResponseWriter, r *http.Request) {
	currentPage, perPage := parsePagination(r)
	properties, total, err := c.usecase.List(currentPage, perPage)
	if err != nil {
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to list properties")
		return
	}
	response.WriteSuccess(w, http.StatusOK, response.NewListData(properties, currentPage, perPage, total))
}

func (c *PropertyController) Detail(w http.ResponseWriter, r *http.Request) {
	id, err := parseIDParam(r)
	if err != nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid id")
		return
	}
	property, err := c.usecase.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.WriteError(w, http.StatusNotFound, "NOT_FOUND", "property not found")
			return
		}
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to load property")
		return
	}
	response.WriteSuccess(w, http.StatusOK, property)
}

type propertyRequest struct {
	Name         string `json:"name"`
	Address      string `json:"address"`
	WifiSSID     string `json:"wifi_ssid"`
	WifiPassword string `json:"wifi_password"`
	Status       string `json:"status"`
	Notes        string `json:"notes"`
}

func (c *PropertyController) Create(w http.ResponseWriter, r *http.Request) {
	var req propertyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Name == "" || req.Address == "" {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "name and address are required")
		return
	}
	status := req.Status
	if status == "" {
		status = "vacant"
	}
	property := &repository.Property{
		Name:         req.Name,
		Address:      req.Address,
		WifiSSID:     req.WifiSSID,
		WifiPassword: req.WifiPassword,
		Status:       status,
		Notes:        req.Notes,
	}
	if err := c.usecase.Create(property); err != nil {
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to create property")
		return
	}
	response.WriteSuccess(w, http.StatusCreated, property)
}

func (c *PropertyController) Update(w http.ResponseWriter, r *http.Request) {
	id, err := parseIDParam(r)
	if err != nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid id")
		return
	}
	property, err := c.usecase.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.WriteError(w, http.StatusNotFound, "NOT_FOUND", "property not found")
			return
		}
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to load property")
		return
	}
	var req propertyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid request body")
		return
	}
	if req.Name != "" {
		property.Name = req.Name
	}
	if req.Address != "" {
		property.Address = req.Address
	}
	property.WifiSSID = req.WifiSSID
	property.WifiPassword = req.WifiPassword
	if req.Status != "" {
		property.Status = req.Status
	}
	property.Notes = req.Notes
	if err := c.usecase.Update(property); err != nil {
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to update property")
		return
	}
	response.WriteSuccess(w, http.StatusOK, property)
}

func (c *PropertyController) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := parseIDParam(r)
	if err != nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid id")
		return
	}
	if err := c.usecase.Delete(id); err != nil {
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to delete property")
		return
	}
	response.WriteSuccess(w, http.StatusOK, map[string]uint{"id": id})
}
