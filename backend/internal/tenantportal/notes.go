package tenantportal

import "time"

// noteItem is a note the property team wrote on a repair request or complaint.
type noteItem struct {
	ID         uint      `json:"id"`
	AuthorName string    `json:"author_name"`
	Body       string    `json:"body"`
	CreatedAt  time.Time `json:"created_at"`
}

// loadNotes returns the notes on one request, newest first. kind is 'maintenance' or 'complaint'.
func (c *Controller) loadNotes(kind string, requestID uint) ([]noteItem, error) {
	rows := []noteItem{}
	err := c.db.Raw(`
		SELECT id, author_name, body, created_at FROM request_notes
		WHERE kind = ? AND request_id = ?
		ORDER BY created_at DESC, id DESC`, kind, requestID).Scan(&rows).Error
	return rows, err
}
