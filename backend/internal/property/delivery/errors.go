package delivery

import (
	"errors"
	"net/http"

	"backend/internal/pkg/httpx"
	"backend/internal/property/usecase"
)

// writeUnitError maps unit usecase errors to API responses.
func writeUnitError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, usecase.ErrUnitNotFound):
		httpx.WriteNotFound(w, "unit not found")
	case errors.Is(err, usecase.ErrUnitInvalid):
		httpx.WriteInvalidInput(w, "block_id, floor_id and code are required; bedrooms and size_sqft must be >= 0")
	case errors.Is(err, usecase.ErrUnitFloorMismatch):
		httpx.WriteInvalidInput(w, "floor does not belong to the selected block")
	case errors.Is(err, usecase.ErrUnitStatusInvalid):
		httpx.WriteInvalidInput(w, "status must be one of the unit_status options")
	case errors.Is(err, usecase.ErrUnitCodeExists):
		httpx.WriteConflict(w, "unit code already exists in this block")
	case errors.Is(err, usecase.ErrUnitHasActiveTenant):
		httpx.WriteConflict(w, "unit has an active tenant and cannot be set to vacant")
	default:
		httpx.WriteInternalError(w, "failed to save unit")
	}
}
