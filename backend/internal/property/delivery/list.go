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

type propertyListRequest struct {
	CurrentPage  int    `json:"current_page"`
	PerPage      int    `json:"per_page"`
	Keyword      string `json:"keyword"`
	PropertyType string `json:"property_type"`
	DeveloperID  string `json:"developer_id"`
	Region       string `json:"region"`
}

func (c *PropertyController) List(w http.ResponseWriter, r *http.Request) {
	var req propertyListRequest
	if !decodeBody(r, &req) {
		httpx.WriteInvalidInput(w, "invalid request body")
		return
	}
	currentPage, perPage := httpx.NormalizePagination(req.CurrentPage, req.PerPage)
	developerID, err := httpx.ParseOptionalID(req.DeveloperID)
	if err != nil {
		httpx.WriteInvalidInput(w, "invalid developer_id")
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
		httpx.WriteInternalError(w, "failed to list properties")
		return
	}
	for i := range properties {
		c.fillCoverURL(&properties[i])
	}
	httpx.WriteOK(w, response.NewListData(properties, currentPage, perPage, total))
}

func (c *PropertyController) Facets(w http.ResponseWriter, r *http.Request) {
	facets, err := c.usecase.Facets()
	if err != nil {
		httpx.WriteInternalError(w, "failed to load facets")
		return
	}
	httpx.WriteOK(w, facets)
}

func (c *PropertyController) Detail(w http.ResponseWriter, r *http.Request) {
	id, err := httpx.ParseIDParam(r)
	if err != nil {
		httpx.WriteInvalidInput(w, "invalid id")
		return
	}
	property, err := c.usecase.FindDetail(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			httpx.WriteNotFound(w, "property not found")
			return
		}
		httpx.WriteInternalError(w, "failed to load property")
		return
	}
	c.fillCoverURL(property)
	httpx.WriteOK(w, property)
}
