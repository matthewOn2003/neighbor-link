package tenantportal

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"strings"
	"time"
	"unicode/utf8"

	maintenancerepo "backend/internal/maintenance/repository"
	maintenanceusecase "backend/internal/maintenance/usecase"
	"backend/internal/pkg/httpx"
	"backend/internal/pkg/response"
	"backend/internal/pkg/storage"
)

// tenantPriorities are the priorities a tenant may choose. Urgent is reserved for admins.
var tenantPriorities = map[string]bool{"low": true, "normal": true, "high": true}

// maxRepairPhotos caps how many photos a tenant can attach to one repair request.
const maxRepairPhotos = 5

const maxFileNameLength = 255

type maintenanceCreateRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Category    string `json:"category"`
	Priority    string `json:"priority"`
}

type tenantListRequest struct {
	CurrentPage int    `json:"current_page"`
	PerPage     int    `json:"per_page"`
	Keyword     string `json:"keyword"`
	Status      string `json:"status"`
}

type attachmentItem struct {
	ID          uint      `json:"id"`
	FileName    string    `json:"file_name"`
	ContentType string    `json:"content_type"`
	SizeBytes   int64     `json:"size_bytes"`
	FileURL     string    `json:"file_url"`
	CreatedAt   time.Time `json:"created_at"`
}

// maintenanceDetailView is one repair request with its photos and the property notes written on it.
type maintenanceDetailView struct {
	*maintenancerepo.Detail
	Attachments []attachmentItem `json:"attachments"`
	Notes       []noteItem       `json:"notes"`
}

// photoUpload is one validated image read from a multipart form.
type photoUpload struct {
	name        string
	contentType string
	ext         string
	data        []byte
}

var (
	errTooManyPhotos = errors.New("too many photos")
	errPhotoTooLarge = errors.New("photo too large")
	errPhotoType     = errors.New("unsupported photo type")
)

// tenantUnitID returns the unit the tenant currently lives in. found is false when none is assigned.
func (c *Controller) tenantUnitID(tenantID uint) (uint, bool, error) {
	var row struct {
		UnitID *uint
	}
	err := c.db.Raw(`SELECT unit_id FROM tenants WHERE id = ?`, tenantID).Scan(&row).Error
	if err != nil {
		return 0, false, err
	}
	if row.UnitID == nil || *row.UnitID == 0 {
		return 0, false, nil
	}
	return *row.UnitID, true, nil
}

// readPhotos validates and reads the uploaded photos. Every file must be a JPEG, PNG or WebP under the size limit.
func readPhotos(headers []*multipart.FileHeader) ([]photoUpload, error) {
	if len(headers) > maxRepairPhotos {
		return nil, errTooManyPhotos
	}
	photos := make([]photoUpload, 0)
	for _, h := range headers {
		if h.Size > storage.MaxObjectSize {
			return nil, errPhotoTooLarge
		}
		f, err := h.Open()
		if err != nil {
			return nil, err
		}
		data, err := io.ReadAll(io.LimitReader(f, storage.MaxObjectSize+1))
		f.Close()
		if err != nil {
			return nil, err
		}
		if len(data) > storage.MaxObjectSize {
			return nil, errPhotoTooLarge
		}
		contentType := http.DetectContentType(data)
		ext, ok := proofExtensions[contentType]
		if !ok {
			return nil, errPhotoType
		}
		photos = append(photos, photoUpload{name: fileNameOf(h.Filename), contentType: contentType, ext: ext, data: data})
	}
	return photos, nil
}

// fileNameOf keeps only the base name of an upload, capped in length.
func fileNameOf(name string) string {
	base := filepath.Base(strings.TrimSpace(name))
	if base == "." || base == "/" || base == "" {
		return "photo"
	}
	if utf8.RuneCountInString(base) > maxFileNameLength {
		base = string([]rune(base)[:maxFileNameLength])
	}
	return base
}

func writePhotoError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, errTooManyPhotos):
		httpx.WriteInvalidInput(w, "up to 5 photos can be attached")
	case errors.Is(err, errPhotoTooLarge):
		httpx.WriteInvalidInput(w, "each photo must be 10 MiB or smaller")
	case errors.Is(err, errPhotoType):
		httpx.WriteInvalidInput(w, "only JPEG, PNG and WebP images are accepted")
	default:
		httpx.WriteInvalidInput(w, "failed to read attached photos")
	}
}

// parseMaintenanceCreate reads the request either as JSON (no photos) or as multipart form data with optional photos in "files".
func parseMaintenanceCreate(w http.ResponseWriter, r *http.Request) (maintenanceCreateRequest, []photoUpload, bool) {
	if strings.HasPrefix(r.Header.Get("Content-Type"), "multipart/form-data") {
		r.Body = http.MaxBytesReader(w, r.Body, maxRepairPhotos*storage.MaxObjectSize+(1<<20))
		if err := r.ParseMultipartForm(storage.MaxObjectSize); err != nil {
			httpx.WriteInvalidInput(w, "invalid form or photos too large")
			return maintenanceCreateRequest{}, nil, false
		}
		req := maintenanceCreateRequest{
			Title:       r.FormValue("title"),
			Description: r.FormValue("description"),
			Category:    r.FormValue("category"),
			Priority:    r.FormValue("priority"),
		}
		photos, err := readPhotos(r.MultipartForm.File["files"])
		if err != nil {
			writePhotoError(w, err)
			return maintenanceCreateRequest{}, nil, false
		}
		return req, photos, true
	}
	var req maintenanceCreateRequest
	if json.NewDecoder(r.Body).Decode(&req) != nil {
		httpx.WriteInvalidInput(w, "invalid request body")
		return maintenanceCreateRequest{}, nil, false
	}
	return req, nil, true
}

// maintenanceView attaches photos (with fresh links) and property notes to a repair request.
func (c *Controller) maintenanceView(d *maintenancerepo.Detail) (maintenanceDetailView, error) {
	rows, err := c.maintenance.Attachments(d.ID)
	if err != nil {
		return maintenanceDetailView{}, err
	}
	items := make([]attachmentItem, 0)
	for _, a := range rows {
		item := attachmentItem{
			ID:          a.ID,
			FileName:    a.FileName,
			ContentType: a.ContentType,
			SizeBytes:   a.SizeBytes,
			CreatedAt:   a.CreatedAt,
		}
		if c.store != nil {
			if link, err := c.store.Presign(a.FileKey, proofPresignTTL); err == nil {
				item.FileURL = link
			}
		}
		items = append(items, item)
	}
	notes, err := c.loadNotes("maintenance", d.ID)
	if err != nil {
		return maintenanceDetailView{}, err
	}
	return maintenanceDetailView{Detail: d, Attachments: items, Notes: notes}, nil
}

// MaintenanceCreate files a repair request for the tenant's unit, with optional photos.
// The tenant is never taken from the body. Photos are validated and uploaded before the request is saved.
func (c *Controller) MaintenanceCreate(w http.ResponseWriter, r *http.Request) {
	tenantID, err := c.currentTenantID(r)
	if err != nil {
		httpx.WriteNotFound(w, "no tenant profile is linked to this account")
		return
	}
	req, photos, ok := parseMaintenanceCreate(w, r)
	if !ok {
		return
	}
	priority := strings.TrimSpace(req.Priority)
	if priority == "" {
		priority = "normal"
	}
	if !tenantPriorities[priority] {
		httpx.WriteInvalidInput(w, "priority must be low, normal or high")
		return
	}
	unitID, found, err := c.tenantUnitID(tenantID)
	if err != nil {
		httpx.WriteInternalError(w, "failed to load unit")
		return
	}
	if !found {
		httpx.WriteInvalidInput(w, "no unit is assigned to this tenant")
		return
	}
	if len(photos) > 0 && c.store == nil {
		httpx.WriteServiceUnavailable(w, "file storage is not configured")
		return
	}

	keys := make([]string, len(photos))
	for i, p := range photos {
		key := fmt.Sprintf("maintenance/%d/%d-%d%s", tenantID, time.Now().UnixNano(), i, p.ext)
		if _, err := c.store.Put(r.Context(), key, p.contentType, bytes.NewReader(p.data)); err != nil {
			httpx.WriteInternalError(w, "failed to upload photo")
			return
		}
		keys[i] = key
	}

	d, err := c.maintenance.Create(maintenanceusecase.CreateInput{
		Title:       req.Title,
		Description: req.Description,
		Category:    req.Category,
		Priority:    priority,
		UnitID:      unitID,
		TenantID:    &tenantID,
	})
	switch {
	case errors.Is(err, maintenanceusecase.ErrInvalidInput), errors.Is(err, maintenanceusecase.ErrUnitNotFound):
		httpx.WriteInvalidInput(w, "title and a valid category are required")
		return
	case err != nil:
		httpx.WriteInternalError(w, "failed to create request")
		return
	}

	for i, p := range photos {
		err := c.maintenance.AddAttachment(&maintenancerepo.Attachment{
			RequestID:   d.ID,
			FileKey:     keys[i],
			FileName:    p.name,
			ContentType: p.contentType,
			SizeBytes:   int64(len(p.data)),
		})
		if err != nil {
			httpx.WriteInternalError(w, "failed to save photo")
			return
		}
	}

	view, err := c.maintenanceView(d)
	if err != nil {
		httpx.WriteInternalError(w, "failed to load request")
		return
	}
	httpx.WriteOK(w, view)
}

// MaintenanceList returns only the tenant's own repair requests.
func (c *Controller) MaintenanceList(w http.ResponseWriter, r *http.Request) {
	tenantID, err := c.currentTenantID(r)
	if err != nil {
		httpx.WriteNotFound(w, "no tenant profile is linked to this account")
		return
	}
	var req tenantListRequest
	if json.NewDecoder(r.Body).Decode(&req) != nil {
		httpx.WriteInvalidInput(w, "invalid request body")
		return
	}
	page, perPage := httpx.NormalizePagination(req.CurrentPage, req.PerPage)
	rows, total, err := c.maintenance.List(maintenancerepo.Filter{
		Keyword:  strings.TrimSpace(req.Keyword),
		Status:   strings.TrimSpace(req.Status),
		TenantID: &tenantID,
	}, page, perPage)
	if err != nil {
		httpx.WriteInternalError(w, "failed to list requests")
		return
	}
	summary, err := c.maintenanceSummary(tenantID)
	if err != nil {
		httpx.WriteInternalError(w, "failed to summarise requests")
		return
	}
	httpx.WriteOK(w, response.NewListData(rows, page, perPage, total).WithSummary(summary))
}

// MaintenanceDetail returns one repair request. Requests belonging to other tenants report 404.
func (c *Controller) MaintenanceDetail(w http.ResponseWriter, r *http.Request) {
	tenantID, err := c.currentTenantID(r)
	if err != nil {
		httpx.WriteNotFound(w, "no tenant profile is linked to this account")
		return
	}
	id, err := httpx.ParseIDParam(r)
	if err != nil {
		httpx.WriteInvalidInput(w, "invalid id")
		return
	}
	d, err := c.maintenance.Detail(id)
	if errors.Is(err, maintenancerepo.ErrNotFound) || (err == nil && (d.TenantID == nil || *d.TenantID != tenantID)) {
		httpx.WriteNotFound(w, "request not found")
		return
	}
	if err != nil {
		httpx.WriteInternalError(w, "failed to load request")
		return
	}
	view, err := c.maintenanceView(d)
	if err != nil {
		httpx.WriteInternalError(w, "failed to load request")
		return
	}
	httpx.WriteOK(w, view)
}
