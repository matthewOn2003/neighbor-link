package httpx

import (
	"bytes"
	"encoding/json"
	"io"
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

// ParseIDParam reads the standard "id" field the client sends: the JSON body field "id"
// (a number or a numeric string), or the "id" form field for multipart uploads.
//
// For JSON bodies the body is read and then restored, so the handler can still decode the
// full request body afterwards. For multipart requests this parses the form, so a handler
// must apply its own body size limit (http.MaxBytesReader) before calling it.
func ParseIDParam(r *http.Request) (uint, error) {
	if strings.HasPrefix(r.Header.Get("Content-Type"), "multipart/form-data") {
		return ParseID(r.FormValue("id"))
	}
	raw, err := io.ReadAll(r.Body)
	if err != nil {
		return 0, err
	}
	r.Body = io.NopCloser(bytes.NewReader(raw))
	var q struct {
		ID json.Number `json:"id"`
	}
	if err := json.Unmarshal(raw, &q); err != nil {
		return 0, err
	}
	return ParseID(q.ID.String())
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
