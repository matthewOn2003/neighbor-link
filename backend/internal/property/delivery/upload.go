package delivery

import (
	"bytes"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"backend/internal/pkg/httpx"
	"backend/internal/pkg/storage"
	"backend/internal/property/repository"

	"gorm.io/gorm"
)

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
	if c.storage == nil {
		httpx.WriteServiceUnavailable(w, "object storage is not configured")
		return
	}
	// Allow a little overhead for multipart framing on top of the file limit.
	r.Body = http.MaxBytesReader(w, r.Body, maxCoverBytes+(1<<20))
	if err := r.ParseMultipartForm(maxCoverBytes); err != nil {
		httpx.WriteInvalidInput(w, "upload must be multipart form data no larger than 5 MiB")
		return
	}
	// The property id is the "id" form field; the size limit above is applied first.
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

	file, _, err := r.FormFile("file")
	if err != nil {
		httpx.WriteInvalidInput(w, "file is required")
		return
	}
	defer file.Close()

	data, err := io.ReadAll(io.LimitReader(file, maxCoverBytes+1))
	if err != nil {
		httpx.WriteInvalidInput(w, "failed to read file")
		return
	}
	if len(data) > maxCoverBytes {
		httpx.WriteRequestEntityTooLarge(w, "cover image must be 5 MiB or smaller")
		return
	}
	contentType := http.DetectContentType(data)
	extension, ok := coverExtensions[contentType]
	if !ok {
		httpx.WriteInvalidInput(w, "cover image must be JPEG, PNG or WebP")
		return
	}

	key := fmt.Sprintf("properties/%d/cover-%d%s", id, time.Now().UnixNano(), extension)
	if _, err := c.storage.Put(r.Context(), key, contentType, bytes.NewReader(data)); err != nil {
		if errors.Is(err, storage.ErrNotConfigured) {
			httpx.WriteServiceUnavailable(w, "object storage is not configured")
			return
		}
		log.Printf("[LOG] cover upload failed for property %d: %v", id, err)
		httpx.WriteBadGateway(w, "failed to store cover image")
		return
	}

	property.CoverImage = &key
	if err := c.usecase.Update(property); err != nil {
		httpx.WriteInternalError(w, "failed to save cover image")
		return
	}
	updated, err := c.usecase.FindDetail(id)
	if err != nil {
		httpx.WriteInternalError(w, "failed to load property")
		return
	}
	c.fillCoverURL(updated)
	httpx.WriteOK(w, updated)
}
