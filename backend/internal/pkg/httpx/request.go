package httpx

import (
	"net/http"
	"strconv"
	"strings"
)

// NormalizePagination applies the standard list endpoint pagination limits.
func NormalizePagination(currentPage, perPage int) (int, int) {
	if currentPage <= 0 {
		currentPage = 1
	}
	if perPage <= 0 {
		perPage = 10
	}
	if perPage > 100 {
		perPage = 100
	}
	return currentPage, perPage
}

// ParseID parses a numeric ID from a string.
func ParseID(raw string) (uint, error) {
	id, err := strconv.ParseUint(raw, 10, 64)
	if err != nil {
		return 0, err
	}
	return uint(id), nil
}

// ParseIDParam parses the standard path parameter named "id".
func ParseIDParam(r *http.Request) (uint, error) {
	return ParseID(r.PathValue("id"))
}

// ParseOptionalInt parses an optional non-negative integer. Empty input means no filter;
// malformed input is an error so invalid filters are not silently ignored.
func ParseOptionalInt(raw string) (*int, error) {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return nil, nil
	}
	value, err := strconv.Atoi(raw)
	if err != nil {
		return nil, err
	}
	if value < 0 {
		return nil, strconv.ErrSyntax
	}
	return &value, nil
}

// ParseOptionalID parses an optional numeric ID. Empty input means no filter;
// malformed input is an error so invalid filters are not silently ignored.
func ParseOptionalID(raw string) (*uint, error) {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return nil, nil
	}
	id, err := strconv.ParseUint(raw, 10, 64)
	if err != nil {
		return nil, err
	}
	value := uint(id)
	return &value, nil
}
