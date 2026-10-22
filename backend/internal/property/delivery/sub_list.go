package delivery

import (
	"errors"
	"net/http"
	"strings"

	"backend/internal/pkg/httpx"
	"backend/internal/pkg/response"
	"backend/internal/property/repository"

	"gorm.io/gorm"
)

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

func (c *PropertyController) BlockList(w http.ResponseWriter, r *http.Request) {
	var req blockListRequest
	if !decodeBody(r, &req) {
		httpx.WriteInvalidInput(w, "invalid request body")
		return
	}
	propertyID, err := httpx.ParseOptionalID(req.PropertyID)
	if err != nil || propertyID == nil {
		httpx.WriteInvalidInput(w, "valid property_id is required")
		return
	}
	currentPage, perPage := httpx.NormalizePagination(req.CurrentPage, req.PerPage)
	blocks, total, err := c.usecase.ListBlocks(repository.BlockFilter{PropertyID: *propertyID}, currentPage, perPage)
	if err != nil {
		httpx.WriteInternalError(w, "failed to list blocks")
		return
	}
	httpx.WriteOK(w, response.NewListData(blocks, currentPage, perPage, total))
}

func (c *PropertyController) BlockDetail(w http.ResponseWriter, r *http.Request) {
	id, err := httpx.ParseIDParam(r)
	if err != nil {
		httpx.WriteInvalidInput(w, "invalid id")
		return
	}
	block, err := c.usecase.FindBlockDetail(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			httpx.WriteNotFound(w, "block not found")
			return
		}
		httpx.WriteInternalError(w, "failed to load block")
		return
	}
	httpx.WriteOK(w, block)
}

func (c *PropertyController) FloorList(w http.ResponseWriter, r *http.Request) {
	var req floorListRequest
	if !decodeBody(r, &req) {
		httpx.WriteInvalidInput(w, "invalid request body")
		return
	}
	blockID, err := httpx.ParseOptionalID(req.BlockID)
	if err != nil || blockID == nil {
		httpx.WriteInvalidInput(w, "valid block_id is required")
		return
	}
	currentPage, perPage := httpx.NormalizePagination(req.CurrentPage, req.PerPage)
	floors, total, err := c.usecase.ListFloors(repository.FloorFilter{BlockID: *blockID}, currentPage, perPage)
	if err != nil {
		httpx.WriteInternalError(w, "failed to list floors")
		return
	}
	httpx.WriteOK(w, response.NewListData(floors, currentPage, perPage, total))
}

func (c *PropertyController) FloorDetail(w http.ResponseWriter, r *http.Request) {
	id, err := httpx.ParseIDParam(r)
	if err != nil {
		httpx.WriteInvalidInput(w, "invalid id")
		return
	}
	floor, err := c.usecase.FindFloorDetail(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			httpx.WriteNotFound(w, "floor not found")
			return
		}
		httpx.WriteInternalError(w, "failed to load floor")
		return
	}
	httpx.WriteOK(w, floor)
}

func (c *PropertyController) UnitList(w http.ResponseWriter, r *http.Request) {
	var req unitListRequest
	if !decodeBody(r, &req) {
		httpx.WriteInvalidInput(w, "invalid request body")
		return
	}
	currentPage, perPage := httpx.NormalizePagination(req.CurrentPage, req.PerPage)
	propertyID, err := httpx.ParseOptionalID(req.PropertyID)
	if err != nil {
		httpx.WriteInvalidInput(w, "invalid property_id")
		return
	}
	blockID, err := httpx.ParseOptionalID(req.BlockID)
	if err != nil {
		httpx.WriteInvalidInput(w, "invalid block_id")
		return
	}
	floorID, err := httpx.ParseOptionalID(req.FloorID)
	if err != nil {
		httpx.WriteInvalidInput(w, "invalid floor_id")
		return
	}
	bedrooms, err := httpx.ParseOptionalInt(req.Bedrooms)
	if err != nil {
		httpx.WriteInvalidInput(w, "invalid bedrooms")
		return
	}
	sizeMin, err := httpx.ParseOptionalInt(req.SizeMin)
	if err != nil {
		httpx.WriteInvalidInput(w, "invalid size_min")
		return
	}
	sizeMax, err := httpx.ParseOptionalInt(req.SizeMax)
	if err != nil {
		httpx.WriteInvalidInput(w, "invalid size_max")
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
		httpx.WriteInternalError(w, "failed to list units")
		return
	}
	httpx.WriteOK(w, response.NewListData(units, currentPage, perPage, total))
}
