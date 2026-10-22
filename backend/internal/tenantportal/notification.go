package tenantportal

import (
	"encoding/json"
	"net/http"
	"time"

	"backend/internal/pkg/httpx"
	"backend/internal/pkg/response"
)

type notificationItem struct {
	ID        uint       `json:"id"`
	Kind      string     `json:"kind"`
	Title     string     `json:"title"`
	Body      string     `json:"body"`
	ReadAt    *time.Time `json:"read_at"`
	CreatedAt time.Time  `json:"created_at"`
}

type notificationSummary struct {
	UnreadCount int64 `json:"unread_count"`
	// ActionCount is the unread notifications that ask the tenant to do something. Announcements are not counted.
	ActionCount int64 `json:"action_count"`
}

type notificationReadRequest struct {
	ID  uint `json:"id"`
	All bool `json:"all"`
}

func (c *Controller) notificationSummaryOf(tenantID uint) (notificationSummary, error) {
	var s notificationSummary
	err := c.db.Raw(`
		SELECT COUNT(*) AS unread_count,
		       COALESCE(SUM(CASE WHEN kind <> 'announcement' THEN 1 ELSE 0 END), 0) AS action_count
		FROM tenant_notifications
		WHERE tenant_id = ? AND read_at IS NULL`, tenantID).Scan(&s).Error
	return s, err
}

// NotificationList returns the tenant's notifications, newest first, with the unread count in the summary.
func (c *Controller) NotificationList(w http.ResponseWriter, r *http.Request) {
	tenantID, ok := c.tenantOr404(w, r)
	if !ok {
		return
	}
	var req tenantListRequest
	if json.NewDecoder(r.Body).Decode(&req) != nil {
		httpx.WriteInvalidInput(w, "invalid request body")
		return
	}
	page, perPage := httpx.NormalizePagination(req.CurrentPage, req.PerPage)

	var total int64
	if err := c.db.Raw(`SELECT COUNT(*) FROM tenant_notifications WHERE tenant_id = ?`, tenantID).Scan(&total).Error; err != nil {
		httpx.WriteInternalError(w, "failed to load notifications")
		return
	}
	rows := []notificationItem{}
	err := c.db.Raw(`
		SELECT id, kind, title, body, read_at, created_at FROM tenant_notifications
		WHERE tenant_id = ?
		ORDER BY created_at DESC, id DESC
		LIMIT ? OFFSET ?`, tenantID, perPage, (page-1)*perPage).Scan(&rows).Error
	if err != nil {
		httpx.WriteInternalError(w, "failed to load notifications")
		return
	}
	summary, err := c.notificationSummaryOf(tenantID)
	if err != nil {
		httpx.WriteInternalError(w, "failed to load notifications")
		return
	}
	list := response.NewListData(rows, page, perPage, total).WithSummary(summary)
	httpx.WriteOK(w, list)
}

// NotificationRead marks one notification (id) or all of them (all) as read, and returns the new unread count.
func (c *Controller) NotificationRead(w http.ResponseWriter, r *http.Request) {
	tenantID, ok := c.tenantOr404(w, r)
	if !ok {
		return
	}
	var req notificationReadRequest
	if json.NewDecoder(r.Body).Decode(&req) != nil {
		httpx.WriteInvalidInput(w, "invalid request body")
		return
	}
	if !req.All && req.ID == 0 {
		httpx.WriteInvalidInput(w, "id or all is required")
		return
	}
	err := c.db.Exec(`
		UPDATE tenant_notifications SET read_at = ?
		WHERE tenant_id = ? AND read_at IS NULL AND (? OR id = ?)`,
		time.Now(), tenantID, req.All, req.ID).Error
	if err != nil {
		httpx.WriteInternalError(w, "failed to update notifications")
		return
	}
	summary, err := c.notificationSummaryOf(tenantID)
	if err != nil {
		httpx.WriteInternalError(w, "failed to update notifications")
		return
	}
	httpx.WriteOK(w, summary)
}
