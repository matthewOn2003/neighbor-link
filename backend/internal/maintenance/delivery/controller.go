package delivery

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"backend/internal/maintenance/repository"
	"backend/internal/maintenance/usecase"
	"backend/internal/pkg/httpx"
	"backend/internal/pkg/response"
)

type MaintenanceController struct {
	uc *usecase.MaintenanceUsecase
}

func NewMaintenanceController(uc *usecase.MaintenanceUsecase) *MaintenanceController {
	return &MaintenanceController{uc: uc}
}

type listRequest struct {
	CurrentPage int    `json:"current_page"`
	PerPage     int    `json:"per_page"`
	Keyword     string `json:"keyword"`
	Status      string `json:"status"`
	Priority    string `json:"priority"`
	Category    string `json:"category"`
	PropertyID  string `json:"property_id"`
	UnitID      string `json:"unit_id"`
	CreatedFrom string `json:"created_from"`
	CreatedTo   string `json:"created_to"`
}

func (c *MaintenanceController) List(w http.ResponseWriter, r *http.Request) {
	var req listRequest
	if json.NewDecoder(r.Body).Decode(&req) != nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid request body")
		return
	}
	propertyID, err := httpx.ParseOptionalID(req.PropertyID)
	if err != nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid property_id")
		return
	}
	unitID, err := httpx.ParseOptionalID(req.UnitID)
	if err != nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid unit_id")
		return
	}
	filter := repository.Filter{
		Keyword:     strings.TrimSpace(req.Keyword),
		Status:      strings.TrimSpace(req.Status),
		Priority:    strings.TrimSpace(req.Priority),
		Category:    strings.TrimSpace(req.Category),
		PropertyID:  propertyID,
		UnitID:      unitID,
		CreatedFrom: strings.TrimSpace(req.CreatedFrom),
		CreatedTo:   strings.TrimSpace(req.CreatedTo),
	}
	if err := usecase.ValidateFilter(filter); err != nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "check created_from and created_to")
		return
	}
	page, perPage := httpx.NormalizePagination(req.CurrentPage, req.PerPage)
	rows, total, err := c.uc.List(filter, page, perPage)
	if err != nil {
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to list maintenance requests")
		return
	}
	response.WriteSuccess(w, http.StatusOK, response.NewListData(rows, page, perPage, total))
}

func (c *MaintenanceController) Detail(w http.ResponseWriter, r *http.Request) {
	id, err := httpx.ParseIDParam(r)
	if err != nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid id")
		return
	}
	detail, err := c.uc.Detail(id)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			response.WriteError(w, http.StatusNotFound, "NOT_FOUND", "maintenance request not found")
			return
		}
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to load maintenance request")
		return
	}
	response.WriteSuccess(w, http.StatusOK, detail)
}

type createRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Category    string `json:"category"`
	Priority    string `json:"priority"`
	PropertyID  string `json:"property_id"`
	UnitID      string `json:"unit_id"`
	Assignee    string `json:"assignee"`
}

// writeMaintenanceError maps usecase errors to responses shared by create and update.
func writeMaintenanceError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, repository.ErrNotFound):
		response.WriteError(w, http.StatusNotFound, "NOT_FOUND", "maintenance request not found")
	case errors.Is(err, usecase.ErrUnitNotFound):
		response.WriteError(w, http.StatusBadRequest, "UNIT_NOT_FOUND", "unit does not exist")
	case errors.Is(err, usecase.ErrInvalidInput):
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "check title, unit, category, priority and status")
	default:
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to save maintenance request")
	}
}

func (c *MaintenanceController) Create(w http.ResponseWriter, r *http.Request) {
	var req createRequest
	if json.NewDecoder(r.Body).Decode(&req) != nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid request body")
		return
	}
	unitID, err := httpx.ParseID(strings.TrimSpace(req.UnitID))
	if err != nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "unit_id is required")
		return
	}
	detail, err := c.uc.Create(usecase.CreateInput{
		Title:       req.Title,
		Description: req.Description,
		Category:    req.Category,
		Priority:    req.Priority,
		UnitID:      unitID,
		Assignee:    req.Assignee,
	})
	if err != nil {
		writeMaintenanceError(w, err)
		return
	}
	response.WriteSuccess(w, http.StatusCreated, detail)
}

type updateRequest struct {
	Title           *string `json:"title"`
	Description     *string `json:"description"`
	Category        *string `json:"category"`
	Priority        *string `json:"priority"`
	Assignee        *string `json:"assignee"`
	Status          *string `json:"status"`
	ResolutionNotes *string `json:"resolution_notes"`
}

func (c *MaintenanceController) Update(w http.ResponseWriter, r *http.Request) {
	id, err := httpx.ParseIDParam(r)
	if err != nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid id")
		return
	}
	var req updateRequest
	if json.NewDecoder(r.Body).Decode(&req) != nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid request body")
		return
	}
	detail, err := c.uc.Update(id, usecase.UpdateInput{
		Title:           req.Title,
		Description:     req.Description,
		Category:        req.Category,
		Priority:        req.Priority,
		Assignee:        req.Assignee,
		Status:          req.Status,
		ResolutionNotes: req.ResolutionNotes,
	})
	if err != nil {
		writeMaintenanceError(w, err)
		return
	}
	response.WriteSuccess(w, http.StatusOK, detail)
}
