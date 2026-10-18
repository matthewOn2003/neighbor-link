package httpx

import (
	"net/http"
	"strconv"
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

// ParseIDParam parses the standard path parameter named "id".
func ParseIDParam(r *http.Request) (uint, error) {
	id, err := strconv.ParseUint(r.PathValue("id"), 10, 64)
	if err != nil {
		return 0, err
	}
	return uint(id), nil
}
