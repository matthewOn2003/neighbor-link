package delivery

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"backend/internal/pkg/httpx"
	"backend/internal/property/repository"

	"gorm.io/gorm"
)

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
		httpx.WriteInvalidInput(w, "name and address are required")
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
		httpx.WriteInternalError(w, "failed to create property")
		return
	}
	httpx.WriteCreated(w, property)
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
		httpx.WriteInvalidInput(w, "invalid id")
		return
	}
	property, err := c.usecase.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			httpx.WriteNotFound(w, "property not found")
			return
		}
		httpx.WriteInternalError(w, "failed to load property")
		return
	}
	var req propertyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httpx.WriteInvalidInput(w, "invalid request body")
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
		httpx.WriteInternalError(w, "failed to update property")
		return
	}
	httpx.WriteOK(w, property)
}

func (c *PropertyController) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := httpx.ParseIDParam(r)
	if err != nil {
		httpx.WriteInvalidInput(w, "invalid id")
		return
	}
	if err := c.usecase.Delete(id); err != nil {
		httpx.WriteInternalError(w, "failed to delete property")
		return
	}
	httpx.WriteOK(w, map[string]uint{"id": id})
}
