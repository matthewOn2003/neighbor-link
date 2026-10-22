package delivery

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"backend/internal/pkg/httpx"
	"backend/internal/pkg/response"
	"backend/internal/pkg/storage"
	"backend/internal/property/repository"
	"backend/internal/property/usecase"

	"gorm.io/gorm"
)

type PropertyController struct {
	usecase *usecase.PropertyUsecase
	storage storage.Uploader
}

func NewPropertyController(uc *usecase.PropertyUsecase) *PropertyController {
	return &PropertyController{usecase: uc}
}

// WithStorage attaches object storage for cover image uploads and link generation.
func (c *PropertyController) WithStorage(u storage.Uploader) *PropertyController {
	c.storage = u
	return c
}

// coverPresignTTL is how long a cover image link stays valid. The page reloads the detail to refresh it.
const coverPresignTTL = time.Hour

// fillCoverURL sets CoverImageURL. Values starting with http(s) are used as they are; other values
// are object keys in storage and get a presigned link. Without storage the URL stays empty.
func (c *PropertyController) fillCoverURL(item *repository.PropertyListItem) {
	if item.CoverImage == nil || *item.CoverImage == "" {
		return
	}
	value := *item.CoverImage
	if strings.HasPrefix(value, "http://") || strings.HasPrefix(value, "https://") {
		item.CoverImageURL = value
		return
	}
	if c.storage == nil {
		return
	}
	link, err := c.storage.Presign(value, coverPresignTTL)
	if err != nil {
		log.Printf("[LOG] cover image link failed for %q: %v", value, err)
		return
	}
	item.CoverImageURL = link
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
	Bedrooms    string `json:"bedrooms"`
	SizeMin     string `json:"size_min"`
	SizeMax     string `json:"size_max"`
	TenantName  string `json:"tenant_name"`
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
		Keyword:      strings.TrimSpace(req.Keyword),
		PropertyType: strings.TrimSpace(req.PropertyType),
		DeveloperID:  developerID,
		Region:       strings.TrimSpace(req.Region),
	}
	properties, total, err := c.usecase.List(filter, currentPage, perPage)
	if err != nil {
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to list properties")
		return
	}
	for i := range properties {
		c.fillCoverURL(&properties[i])
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
	c.fillCoverURL(property)
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
	bedrooms, err := httpx.ParseOptionalInt(req.Bedrooms)
	if err != nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid bedrooms")
		return
	}
	sizeMin, err := httpx.ParseOptionalInt(req.SizeMin)
	if err != nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid size_min")
		return
	}
	sizeMax, err := httpx.ParseOptionalInt(req.SizeMax)
	if err != nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid size_max")
		return
	}
	filter := repository.UnitFilter{
		PropertyID: propertyID, BlockID: blockID, FloorID: floorID,
		Status: strings.TrimSpace(req.Status), Keyword: strings.TrimSpace(req.Keyword),
		Bedrooms: bedrooms, SizeMin: sizeMin, SizeMax: sizeMax,
		TenantName: strings.TrimSpace(req.TenantName),
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
	if req.CoverImage != nil {
		property.CoverImage = nonEmptyPtr(req.CoverImage)
	}
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

type unitCreateRequest struct {
	BlockID  uint   `json:"block_id"`
	FloorID  uint   `json:"floor_id"`
	Code     string `json:"code"`
	Bedrooms int    `json:"bedrooms"`
	SizeSqft int    `json:"size_sqft"`
	Status   string `json:"status"`
}

type unitUpdateRequest struct {
	Code     *string `json:"code"`
	Bedrooms *int    `json:"bedrooms"`
	SizeSqft *int    `json:"size_sqft"`
	Status   *string `json:"status"`
}

// writeUnitError maps unit usecase errors to API responses.
func writeUnitError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, usecase.ErrUnitNotFound):
		response.WriteError(w, http.StatusNotFound, "NOT_FOUND", "unit not found")
	case errors.Is(err, usecase.ErrUnitInvalid):
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "block_id, floor_id and code are required; bedrooms and size_sqft must be >= 0")
	case errors.Is(err, usecase.ErrUnitFloorMismatch):
		response.WriteError(w, http.StatusBadRequest, "INVALID_FLOOR", "floor does not belong to the selected block")
	case errors.Is(err, usecase.ErrUnitStatusInvalid):
		response.WriteError(w, http.StatusBadRequest, "INVALID_STATUS", "status must be one of the unit_status options")
	case errors.Is(err, usecase.ErrUnitCodeExists):
		response.WriteError(w, http.StatusConflict, "CODE_EXISTS", "unit code already exists in this block")
	case errors.Is(err, usecase.ErrUnitHasActiveTenant):
		response.WriteError(w, http.StatusConflict, "INVALID_STATE", "unit has an active tenant and cannot be set to vacant")
	default:
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to save unit")
	}
}

func (c *PropertyController) UnitCreate(w http.ResponseWriter, r *http.Request) {
	var req unitCreateRequest
	if !decodeBody(r, &req) {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid request body")
		return
	}
	unit, err := c.usecase.CreateUnit(usecase.UnitCreate{
		BlockID:  req.BlockID,
		FloorID:  req.FloorID,
		Code:     req.Code,
		Bedrooms: req.Bedrooms,
		SizeSqft: req.SizeSqft,
		Status:   req.Status,
	})
	if err != nil {
		writeUnitError(w, err)
		return
	}
	response.WriteSuccess(w, http.StatusCreated, unit)
}

func (c *PropertyController) UnitUpdate(w http.ResponseWriter, r *http.Request) {
	id, err := httpx.ParseIDParam(r)
	if err != nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid id")
		return
	}
	var req unitUpdateRequest
	if !decodeBody(r, &req) {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid request body")
		return
	}
	unit, err := c.usecase.UpdateUnit(id, usecase.UnitUpdate{
		Code:     req.Code,
		Bedrooms: req.Bedrooms,
		SizeSqft: req.SizeSqft,
		Status:   req.Status,
	})
	if err != nil {
		writeUnitError(w, err)
		return
	}
	response.WriteSuccess(w, http.StatusOK, unit)
}

// maxCoverBytes limits a cover image upload to 5 MiB.
const maxCoverBytes = 5 << 20

var coverExtensions = map[string]string{
	"image/jpeg": ".jpg",
	"image/png":  ".png",
	"image/webp": ".webp",
}

// UploadCover accepts a multipart "file" field (JPEG, PNG or WebP up to 5 MiB), stores it in object
// storage and points the property's cover at it.
func (c *PropertyController) UploadCover(w http.ResponseWriter, r *http.Request) {
	id, err := httpx.ParseIDParam(r)
	if err != nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid id")
		return
	}
	if c.storage == nil {
		response.WriteError(w, http.StatusServiceUnavailable, "STORAGE_NOT_CONFIGURED", "object storage is not configured")
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

	// Allow a little overhead for multipart framing on top of the file limit.
	r.Body = http.MaxBytesReader(w, r.Body, maxCoverBytes+(1<<20))
	if err := r.ParseMultipartForm(maxCoverBytes); err != nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "upload must be multipart form data no larger than 5 MiB")
		return
	}
	file, _, err := r.FormFile("file")
	if err != nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "file is required")
		return
	}
	defer file.Close()

	data, err := io.ReadAll(io.LimitReader(file, maxCoverBytes+1))
	if err != nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "failed to read file")
		return
	}
	if len(data) > maxCoverBytes {
		response.WriteError(w, http.StatusRequestEntityTooLarge, "FILE_TOO_LARGE", "cover image must be 5 MiB or smaller")
		return
	}
	contentType := http.DetectContentType(data)
	extension, ok := coverExtensions[contentType]
	if !ok {
		response.WriteError(w, http.StatusBadRequest, "INVALID_FILE_TYPE", "cover image must be JPEG, PNG or WebP")
		return
	}

	key := fmt.Sprintf("properties/%d/cover-%d%s", id, time.Now().UnixNano(), extension)
	if _, err := c.storage.Put(r.Context(), key, contentType, bytes.NewReader(data)); err != nil {
		if errors.Is(err, storage.ErrNotConfigured) {
			response.WriteError(w, http.StatusServiceUnavailable, "STORAGE_NOT_CONFIGURED", "object storage is not configured")
			return
		}
		log.Printf("[LOG] cover upload failed for property %d: %v", id, err)
		response.WriteError(w, http.StatusBadGateway, "UPLOAD_FAILED", "failed to store cover image")
		return
	}

	property.CoverImage = &key
	if err := c.usecase.Update(property); err != nil {
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to save cover image")
		return
	}
	updated, err := c.usecase.FindDetail(id)
	if err != nil {
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to load property")
		return
	}
	c.fillCoverURL(updated)
	response.WriteSuccess(w, http.StatusOK, updated)
}
