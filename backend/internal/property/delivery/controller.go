package delivery

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"backend/internal/pkg/httpx"
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


type propertyListRequest struct {
	CurrentPage  int    `json:"current_page"`
	PerPage      int    `json:"per_page"`
	Keyword      string `json:"keyword"`
	PropertyType string `json:"property_type"`
	DeveloperID  string `json:"developer_id"`
	Region       string `json:"region"`
}

type blockListRequest struct {
	CurrentPage int    `json:"current_page"`
	PerPage     int    `json:"per_page"`
	PropertyID  string `json:"property_id"`
}

type floorListRequest struct {
	CurrentPage int    `json:"current_page"`
	PerPage     int    `json:"per_page"`
	BlockID     string `json:"block_id"`
}

type unitListRequest struct {
	CurrentPage int    `json:"current_page"`
	PerPage     int    `json:"per_page"`
	PropertyID  string `json:"property_id"`
	BlockID     string `json:"block_id"`
	FloorID     string `json:"floor_id"`
	Status      string `json:"status"`
	Keyword     string `json:"keyword"`
}

func decodeBody(r *http.Request, dst any) bool {
	return json.NewDecoder(r.Body).Decode(dst) == nil
}

func (c *PropertyController) List(w http.ResponseWriter, r *http.Request) {
	var req propertyListRequest
	if !decodeBody(r, &req) {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid request body")
		return
	}
	currentPage, perPage := httpx.NormalizePagination(req.CurrentPage, req.PerPage)
	developerID, err := httpx.ParseOptionalID(req.DeveloperID)
	if err != nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid developer_id")
		return
	}
	filter := repository.PropertyFilter{
		Keyword: strings.TrimSpace(req.Keyword),
		PropertyType: strings.TrimSpace(req.PropertyType),
		DeveloperID: developerID,
		Region: strings.TrimSpace(req.Region),
	}
	properties, total, err := c.usecase.List(filter, currentPage, perPage)
	if err != nil {
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to list properties")
		return
	}
	response.WriteSuccess(w, http.StatusOK, response.NewListData(properties, currentPage, perPage, total))
}


func (c *PropertyController) Facets(w http.ResponseWriter, r *http.Request) {
	facets, err := c.usecase.Facets()
	if err != nil {
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to load facets")
		return
	}
	response.WriteSuccess(w, http.StatusOK, facets)
}

func (c *PropertyController) Detail(w http.ResponseWriter, r *http.Request) {
	id, err := httpx.ParseIDParam(r)
	if err != nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid id")
		return
	}
	property, err := c.usecase.FindDetail(id)
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

func (c *PropertyController) BlockDetail(w http.ResponseWriter, r *http.Request) {
	id, err := httpx.ParseIDParam(r)
	if err != nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid id")
		return
	}
	block, err := c.usecase.FindBlockDetail(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.WriteError(w, http.StatusNotFound, "NOT_FOUND", "block not found")
			return
		}
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to load block")
		return
	}
	response.WriteSuccess(w, http.StatusOK, block)
}

func (c *PropertyController) FloorDetail(w http.ResponseWriter, r *http.Request) {
	id, err := httpx.ParseIDParam(r)
	if err != nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid id")
		return
	}
	floor, err := c.usecase.FindFloorDetail(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.WriteError(w, http.StatusNotFound, "NOT_FOUND", "floor not found")
			return
		}
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to load floor")
		return
	}
	response.WriteSuccess(w, http.StatusOK, floor)
}

func (c *PropertyController) BlockList(w http.ResponseWriter, r *http.Request) {
	var req blockListRequest
	if !decodeBody(r, &req) {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid request body")
		return
	}
	propertyID, err := httpx.ParseOptionalID(req.PropertyID)
	if err != nil || propertyID == nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "valid property_id is required")
		return
	}
	currentPage, perPage := httpx.NormalizePagination(req.CurrentPage, req.PerPage)
	blocks, total, err := c.usecase.ListBlocks(repository.BlockFilter{PropertyID: *propertyID}, currentPage, perPage)
	if err != nil {
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to list blocks")
		return
	}
	response.WriteSuccess(w, http.StatusOK, response.NewListData(blocks, currentPage, perPage, total))
}

func (c *PropertyController) FloorList(w http.ResponseWriter, r *http.Request) {
	var req floorListRequest
	if !decodeBody(r, &req) {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid request body")
		return
	}
	blockID, err := httpx.ParseOptionalID(req.BlockID)
	if err != nil || blockID == nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "valid block_id is required")
		return
	}
	currentPage, perPage := httpx.NormalizePagination(req.CurrentPage, req.PerPage)
	floors, total, err := c.usecase.ListFloors(repository.FloorFilter{BlockID: *blockID}, currentPage, perPage)
	if err != nil {
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to list floors")
		return
	}
	response.WriteSuccess(w, http.StatusOK, response.NewListData(floors, currentPage, perPage, total))
}

func (c *PropertyController) UnitList(w http.ResponseWriter, r *http.Request) {
	var req unitListRequest
	if !decodeBody(r, &req) {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid request body")
		return
	}
	currentPage, perPage := httpx.NormalizePagination(req.CurrentPage, req.PerPage)
	propertyID, err := httpx.ParseOptionalID(req.PropertyID)
	if err != nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid property_id")
		return
	}
	blockID, err := httpx.ParseOptionalID(req.BlockID)
	if err != nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid block_id")
		return
	}
	floorID, err := httpx.ParseOptionalID(req.FloorID)
	if err != nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid floor_id")
		return
	}
	filter := repository.UnitFilter{
		PropertyID: propertyID, BlockID: blockID, FloorID: floorID,
		Status: strings.TrimSpace(req.Status), Keyword: strings.TrimSpace(req.Keyword),
	}
	units, total, err := c.usecase.ListUnits(filter, currentPage, perPage)
	if err != nil {
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to list units")
		return
	}
	response.WriteSuccess(w, http.StatusOK, response.NewListData(units, currentPage, perPage, total))
}

type propertyRequest struct {
	DeveloperID  *uint   `json:"developer_id"`
	Name         string  `json:"name"`
	PropertyType string  `json:"property_type"`
	Address      string  `json:"address"`
	City         string  `json:"city"`
	Region       string  `json:"region"`
	CoverImage   *string `json:"cover_image"`
	Description  string  `json:"description"`
	WifiSSID     string  `json:"wifi_ssid"`
	WifiPassword string  `json:"wifi_password"`
	Notes        string  `json:"notes"`
}

func (c *PropertyController) Create(w http.ResponseWriter, r *http.Request) {
	var req propertyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Name == "" || req.Address == "" {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "name and address are required")
		return
	}
	propertyType := req.PropertyType
	if propertyType == "" {
		propertyType = "condo"
	}
	property := &repository.Property{
		DeveloperID:  req.DeveloperID,
		Name:         req.Name,
		PropertyType: propertyType,
		Address:      req.Address,
		City:         req.City,
		Region:       req.Region,
		CoverImage:   nonEmptyPtr(req.CoverImage),
		Description:  req.Description,
		WifiSSID:     req.WifiSSID,
		WifiPassword: req.WifiPassword,
		Notes:        req.Notes,
	}
	if err := c.usecase.Create(property); err != nil {
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to create property")
		return
	}
	response.WriteSuccess(w, http.StatusCreated, property)
}

func nonEmptyPtr(s *string) *string {
	if s == nil || strings.TrimSpace(*s) == "" {
		return nil
	}
	v := strings.TrimSpace(*s)
	return &v
}



func (c *PropertyController) Update(w http.ResponseWriter, r *http.Request) {
	id, err := httpx.ParseIDParam(r)
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
	if req.PropertyType != "" {
		property.PropertyType = req.PropertyType
	}
	if req.DeveloperID != nil {
		property.DeveloperID = req.DeveloperID
	}
	property.City = req.City
	property.Region = req.Region
	property.CoverImage = nonEmptyPtr(req.CoverImage)
	property.Description = req.Description
	property.WifiSSID = req.WifiSSID
	property.WifiPassword = req.WifiPassword
	property.Notes = req.Notes
	if err := c.usecase.Update(property); err != nil {
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to update property")
		return
	}
	response.WriteSuccess(w, http.StatusOK, property)
}

func (c *PropertyController) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := httpx.ParseIDParam(r)
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
