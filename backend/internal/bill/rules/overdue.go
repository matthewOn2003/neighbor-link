// Package rules holds pure billing rules shared by the bill, payment and dashboard modules.
package rules

import (
	"fmt"
	"time"
)

// Display statuses returned to the admin UI. They are derived; the stored bills.status is unchanged.
const (
	DisplayPaid          = "paid"
	DisplayVoid          = "void"
	DisplayOverdue       = "overdue"
	DisplayPendingReview = "pending_review"
	DisplayUnpaid        = "unpaid"
)

// OverdueDate returns the YYYY-MM-DD date from which a bill of billingPeriod (YYYY-MM) counts as overdue.
func OverdueDate(billingPeriod string, overdueDay int) string {
	return fmt.Sprintf("%s-%02d", billingPeriod, overdueDay)
}

// IsOverdue reports whether an open bill is overdue on the given day.
// Stored status 'overdue' is always overdue. 'unpaid' and 'partial' bills become overdue
// once today reaches the overdue date for their billing period. Paid and void bills never are.
func IsOverdue(status, billingPeriod string, overdueDay int, today time.Time) bool {
	switch status {
	case "overdue":
		return true
	case "unpaid", "partial":
		if len(billingPeriod) != 7 || overdueDay < 1 || overdueDay > 28 {
			return false
		}
		return today.Format("2006-01-02") >= OverdueDate(billingPeriod, overdueDay)
	default:
		return false
	}
}

// DisplayStatus maps a bill to the admin display status.
// Priority: paid, void, pending_review (a payment proof awaits review), overdue, then unpaid.
func DisplayStatus(status string, pendingProofs int64, isOverdue bool) string {
	switch status {
	case "paid":
		return DisplayPaid
	case "void":
		return DisplayVoid
	}
	if pendingProofs > 0 {
		return DisplayPendingReview
	}
	if isOverdue {
		return DisplayOverdue
	}
	return DisplayUnpaid
}
