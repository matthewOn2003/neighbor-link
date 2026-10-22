// Package notify writes the notifications that the tenant portal lists and counts.
package notify

import (
	"time"

	"gorm.io/gorm"
)

// Kinds understood by the tenant portal. Announcements are written by the property team, not by this package.
const (
	KindBilling     = "billing"
	KindMaintenance = "maintenance"
	KindComplaint   = "complaint"
)

// Notice is one notification for one tenant.
type Notice struct {
	TenantID uint
	Kind     string
	Title    string
	Body     string
}

// Send inserts a notice inside the caller's transaction, so it commits or rolls back with the change that caused it.
func Send(tx *gorm.DB, n Notice) error {
	return tx.Exec(
		`INSERT INTO tenant_notifications (tenant_id, kind, title, body, created_at) VALUES (?, ?, ?, ?, ?)`,
		n.TenantID, n.Kind, n.Title, n.Body, time.Now(),
	).Error
}
