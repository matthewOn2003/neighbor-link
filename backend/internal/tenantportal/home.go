package tenantportal

import (
	"net/http"

	"backend/internal/bill/rules"
	maintenancerepo "backend/internal/maintenance/repository"
	"backend/internal/pkg/httpx"
)

const (
	homeActiveRequestLimit = 3
	homeAnnouncementLimit  = 3
)

// homeResponse is everything the home screen shows, returned in one request.
type homeResponse struct {
	Name               string                     `json:"name"`
	Property           *propertyInfo              `json:"property"`
	Unit               *unitInfo                  `json:"unit"`
	ContractStatus     string                     `json:"contract_status"`
	MonthlyRent        float64                    `json:"monthly_rent"`
	BillingDay         int                        `json:"billing_day"`
	OutstandingBalance float64                    `json:"outstanding_balance"`
	OverdueBill        *bill                      `json:"overdue_bill"`
	ActiveRequestCount int64                      `json:"active_request_count"`
	ActiveRequests     []maintenancerepo.ListItem `json:"active_requests"`
	AnnouncementCount  int64                      `json:"announcement_count"`
	Announcements      []announcementItem         `json:"announcements"`
}

// Home aggregates the tenant's profile, billing, open repairs and property announcements.
func (c *Controller) Home(w http.ResponseWriter, r *http.Request) {
	tenantID, ok := c.tenantOr404(w, r)
	if !ok {
		return
	}
	t, err := c.loadTenant(tenantID)
	if err != nil {
		httpx.WriteInternalError(w, "failed to load profile")
		return
	}
	property, err := c.loadProperty(t.PropertyID)
	if err != nil {
		httpx.WriteInternalError(w, "failed to load property")
		return
	}
	unit, err := c.loadUnit(t.UnitID)
	if err != nil {
		httpx.WriteInternalError(w, "failed to load unit")
		return
	}
	contract, err := c.loadContract(tenantID)
	if err != nil {
		httpx.WriteInternalError(w, "failed to load contract")
		return
	}
	bills, err := c.loadBills(tenantID)
	if err != nil {
		httpx.WriteInternalError(w, "failed to load bills")
		return
	}
	active, activeTotal, err := maintenancerepo.NewSQLiteRepository(c.db).ListActiveForTenant(tenantID, homeActiveRequestLimit)
	if err != nil {
		httpx.WriteInternalError(w, "failed to load requests")
		return
	}
	announcements := []announcementItem{}
	var announcementCount int64
	if t.PropertyID != nil {
		announcements, announcementCount, err = c.propertyAnnouncements(*t.PropertyID, homeAnnouncementLimit)
		if err != nil {
			httpx.WriteInternalError(w, "failed to load announcements")
			return
		}
	}

	// Bills come newest first, so the last match is the oldest bill still waiting on the tenant.
	var overdue *bill
	for i := range bills {
		if bills[i].DisplayStatus == rules.DisplayOverdue || bills[i].DisplayStatus == rules.DisplayPendingReview {
			overdue = &bills[i]
		}
	}

	out := homeResponse{
		Name:               t.Name,
		Property:           property,
		Unit:               unit,
		MonthlyRent:        t.MonthlyRent,
		OutstandingBalance: summarizeBills(bills).OutstandingTotal,
		OverdueBill:        overdue,
		ActiveRequestCount: activeTotal,
		ActiveRequests:     active,
		AnnouncementCount:  announcementCount,
		Announcements:      announcements,
	}
	if contract != nil {
		out.ContractStatus = contract.Status
		out.BillingDay = contract.BillingDay
		out.MonthlyRent = contract.MonthlyRent
	}
	httpx.WriteOK(w, out)
}
