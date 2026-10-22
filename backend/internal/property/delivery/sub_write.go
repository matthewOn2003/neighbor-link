package delivery

import (
	"net/http"

	"backend/internal/pkg/httpx"
	"backend/internal/property/usecase"
)

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

func (c *PropertyController) UnitCreate(w http.ResponseWriter, r *http.Request) {
	var req unitCreateRequest
	if !decodeBody(r, &req) {
		httpx.WriteInvalidInput(w, "invalid request body")
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
	httpx.WriteCreated(w, unit)
}

func (c *PropertyController) UnitUpdate(w http.ResponseWriter, r *http.Request) {
	id, err := httpx.ParseIDParam(r)
	if err != nil {
		httpx.WriteInvalidInput(w, "invalid id")
		return
	}
	var req unitUpdateRequest
	if !decodeBody(r, &req) {
		httpx.WriteInvalidInput(w, "invalid request body")
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
	httpx.WriteOK(w, unit)
}
