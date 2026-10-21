package tenantportal

import (
	"encoding/json"
	"net/http"

	"backend/internal/pkg/httpx"
	"backend/internal/pkg/response"
)

type announcementItem struct {
	ID          uint   `json:"id"`
	Title       string `json:"title"`
	Body        string `json:"body"`
	ImageURL    string `json:"image_url"`
	PublishedAt string `json:"published_at"`
}

// propertyAnnouncements returns a property's announcements, newest first. A limit below 1 returns all of them.
// The total is always the full count, so callers can show "more" links.
func (c *Controller) propertyAnnouncements(propertyID uint, limit int) ([]announcementItem, int64, error) {
	var total int64
	if err := c.db.Raw(`SELECT COUNT(*) FROM property_announcements WHERE property_id = ?`, propertyID).Scan(&total).Error; err != nil {
		return nil, 0, err
	}
	if limit < 1 {
		limit = -1 // SQLite treats a negative LIMIT as no limit.
	}
	rows := []announcementItem{}
	err := c.db.Raw(`
		SELECT id, title, body, image_url, published_at
		FROM property_announcements
		WHERE property_id = ?
		ORDER BY published_at DESC, id DESC
		LIMIT ?`, propertyID, limit).Scan(&rows).Error
	if err != nil {
		return nil, 0, err
	}
	return rows, total, nil
}

// AnnouncementList returns the announcements posted for the tenant's property.
func (c *Controller) AnnouncementList(w http.ResponseWriter, r *http.Request) {
	tenantID, ok := c.tenantOr404(w, r)
	if !ok {
		return
	}
	var req tenantListRequest
	if json.NewDecoder(r.Body).Decode(&req) != nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid request body")
		return
	}
	page, perPage := httpx.NormalizePagination(req.CurrentPage, req.PerPage)

	t, err := c.loadTenant(tenantID)
	if err != nil {
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to load tenant")
		return
	}
	if t.PropertyID == nil {
		response.WriteSuccess(w, http.StatusOK, response.NewListData([]announcementItem{}, page, perPage, 0))
		return
	}
	rows, total, err := c.propertyAnnouncements(*t.PropertyID, -1)
	if err != nil {
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to load announcements")
		return
	}
	response.WriteSuccess(w, http.StatusOK, response.NewListData(paginate(rows, page, perPage), page, perPage, total))
}
