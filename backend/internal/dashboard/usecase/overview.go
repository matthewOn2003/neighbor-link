package usecase

import (
	"fmt"
	"math"
	"sort"
	"time"

	billrepo "backend/internal/bill/repository"
	"backend/internal/bill/rules"
	dashrepo "backend/internal/dashboard/repository"
)

const (
	priorityBillLimit  = 10
	activityLimit      = 10
	activityPerSource  = 10
	revenueMonths      = 12
	expiringWindowDays = 60
	renewalNotStarted  = "not_started"
	// occupancyTargetRate is the portfolio occupancy goal, in percent.
	occupancyTargetRate = 85
	// complaintSLADays is how long a complaint may stay open before it counts as over SLA.
	complaintSLADays = 3
)

// The JSON keys below are camelCase to match the admin dashboard.

type Summary struct {
	TotalUnits             int64   `json:"totalUnits"`
	OccupiedUnits          int64   `json:"occupiedUnits"`
	MaintenanceUnits       int64   `json:"maintenanceUnits"`
	OccupancyRate          float64 `json:"occupancyRate"`
	OccupancyRatePrevMonth float64 `json:"occupancyRatePrevMonth"`
	OccupancyTarget        float64 `json:"occupancyTarget"`
	UnitsToTarget          int64   `json:"unitsToTarget"`
	ActiveLeases           int64   `json:"activeLeases"`
	CycleBilledAmount      float64 `json:"cycleBilledAmount"`
	CycleCollectedAmount   float64 `json:"cycleCollectedAmount"`
	CycleOverdueAmount     float64 `json:"cycleOverdueAmount"`
	CycleOverdueCount      int64   `json:"cycleOverdueCount"`
	CycleOutstandingAmount float64 `json:"cycleOutstandingAmount"`
	CollectedRateTarget    float64 `json:"collectedRateTarget"`
	ContractsExpiring30d   int64   `json:"contractsExpiring30d"`
	ContractsExpiring60d   int64   `json:"contractsExpiring60d"`
	OpenComplaints         int64   `json:"openComplaints"`
	ComplaintsOverSLA      int64   `json:"complaintsOverSla"`
	OpenMaintenance        int64   `json:"openMaintenance"`
	UrgentMaintenance      int64   `json:"urgentMaintenance"`
	AvgResolutionDays      float64 `json:"avgResolutionDays"`
	MaintenanceNewWeek     int64   `json:"maintenanceNewWeek"`
	MaintenanceNewTenant   int64   `json:"maintenanceNewTenant"`
	MaintenanceNewAdmin    int64   `json:"maintenanceNewAdmin"`
	PendingProofCount      int64   `json:"pendingProofCount"`
	PendingProofAmount     float64 `json:"pendingProofAmount"`
	OpenBills              int64   `json:"openBills"`
	VacantUnits            int64   `json:"vacantUnits"`
}

type Focus struct {
	OverdueBills      int64 `json:"overdueBills"`
	ExpiringContracts int64 `json:"expiringContracts"`
	UrgentMaintenance int64 `json:"urgentMaintenance"`
	PendingProofs     int64 `json:"pendingProofs"`
}

type PropertyStat struct {
	ID               uint   `json:"id"`
	Name             string `json:"name"`
	TotalUnits       int64  `json:"totalUnits"`
	OccupiedUnits    int64  `json:"occupiedUnits"`
	MaintenanceUnits int64  `json:"maintenanceUnits"`
}

// RevenuePoint is one month. Billed is what was charged for that billing period; Rent and Extra
// together are what was collected in that month (Extra = late fees).
type RevenuePoint struct {
	Month  string  `json:"month"`
	Billed float64 `json:"billed"`
	Rent   float64 `json:"rent"`
	Extra  float64 `json:"extra"`
}

type FunnelGroup struct {
	ID     string  `json:"id"`
	Count  int64   `json:"count"`
	Amount float64 `json:"amount"`
}

type PriorityBill struct {
	ID       uint    `json:"id"`
	Tenant   string  `json:"tenant"`
	Property string  `json:"property"`
	Unit     string  `json:"unit"`
	Period   string  `json:"period"`
	Amount   float64 `json:"amount"`
	Paid     float64 `json:"paid"`
	DueDate  string  `json:"dueDate"`
	Status   string  `json:"status"`
}

type ExpiringContract struct {
	ID       uint   `json:"id"`
	Tenant   string `json:"tenant"`
	Property string `json:"property"`
	Unit     string `json:"unit"`
	EndDate  string `json:"endDate"`
	DaysLeft int    `json:"daysLeft"`
	Renewal  string `json:"renewal"`
}

type ActivityItem struct {
	ID         string  `json:"id"`
	Type       string  `json:"type"`
	MinutesAgo int     `json:"minutesAgo"`
	Tenant     string  `json:"tenant,omitempty"`
	Detail     any     `json:"detail,omitempty"`
	Property   *string `json:"property"`
}

type Overview struct {
	Cycle             string             `json:"cycle"`
	Summary           Summary            `json:"summary"`
	Focus             Focus              `json:"focus"`
	Properties        []PropertyStat     `json:"properties"`
	Revenue           []RevenuePoint     `json:"revenue"`
	CollectionFunnel  []FunnelGroup      `json:"collectionFunnel"`
	PriorityBills     []PriorityBill     `json:"priorityBills"`
	ExpiringContracts []ExpiringContract `json:"expiringContracts"`
	Complaints        []any              `json:"complaints"`
	Activity          []ActivityItem     `json:"activity"`
	Today             string             `json:"today"`
	GeneratedAt       string             `json:"generatedAt"`
}

type DashboardUsecase struct {
	repo  *dashrepo.SQLiteRepository
	bills *billrepo.SQLiteRepository
}

func NewDashboardUsecase(repo *dashrepo.SQLiteRepository, bills *billrepo.SQLiteRepository) *DashboardUsecase {
	return &DashboardUsecase{repo: repo, bills: bills}
}

func round1(v float64) float64 {
	return math.Round(v*10) / 10
}

func nilIfEmpty(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

// Overview assembles the admin dashboard payload from live data. now is the server's local time.
// cycle is the billing cycle to report on (YYYY-MM); an empty cycle means the cycle of now.
func (uc *DashboardUsecase) Overview(now time.Time, cycle string) (*Overview, error) {
	today := now.Format("2006-01-02")
	if cycle == "" {
		cycle = now.Format("2006-01")
	}
	today0, err := time.ParseInLocation("2006-01-02", today, now.Location())
	if err != nil {
		return nil, err
	}
	cycleStart, err := time.ParseInLocation("2006-01", cycle, now.Location())
	if err != nil {
		return nil, err
	}

	overdueDay, err := uc.bills.OverdueDay()
	if err != nil {
		return nil, err
	}

	out := &Overview{
		Cycle:             cycle,
		Properties:        []PropertyStat{},
		Revenue:           []RevenuePoint{},
		CollectionFunnel:  []FunnelGroup{},
		PriorityBills:     []PriorityBill{},
		ExpiringContracts: []ExpiringContract{},
		Complaints:        []any{},
		Activity:          []ActivityItem{},
		Today:             today,
		GeneratedAt:       now.Format(time.RFC3339),
	}

	// Units and occupancy.
	stats, err := uc.repo.PropertyUnitStats()
	if err != nil {
		return nil, err
	}
	for _, s := range stats {
		out.Properties = append(out.Properties, PropertyStat{
			ID: s.ID, Name: s.Name, TotalUnits: s.TotalUnits,
			OccupiedUnits: s.OccupiedUnits, MaintenanceUnits: s.MaintenanceUnits,
		})
		out.Summary.TotalUnits += s.TotalUnits
		out.Summary.OccupiedUnits += s.OccupiedUnits
		out.Summary.MaintenanceUnits += s.MaintenanceUnits
	}
	total := out.Summary.TotalUnits
	if total > 0 {
		out.Summary.OccupancyRate = round1(float64(out.Summary.OccupiedUnits) / float64(total) * 100)
	}
	// Occupancy at the end of the month before the cycle, rebuilt from contracts.
	prevEnd := cycleStart.AddDate(0, 0, -1).Format("2006-01-02")
	prevOccupied, err := uc.repo.OccupiedUnitsOn(prevEnd)
	if err != nil {
		return nil, err
	}
	if total > 0 {
		out.Summary.OccupancyRatePrevMonth = round1(float64(prevOccupied) / float64(total) * 100)
	}
	out.Summary.OccupancyTarget = occupancyTargetRate
	need := int64(math.Ceil(float64(total)*occupancyTargetRate/100)) - out.Summary.OccupiedUnits
	if need > 0 {
		out.Summary.UnitsToTarget = need
	}
	if out.Summary.ActiveLeases, err = uc.repo.ActiveContracts(); err != nil {
		return nil, err
	}

	// Bills: cycle figures, collection funnel, overdue counts and priority list.
	bills, err := uc.repo.BillsForOverview(cycle)
	if err != nil {
		return nil, err
	}
	funnel := map[string]*FunnelGroup{
		"paid": {ID: "paid"}, "partial": {ID: "partial"}, "unpaid": {ID: "unpaid"}, "overdue": {ID: "overdue"},
	}
	var openOverdue int64
	for _, b := range bills {
		billed := b.Amount + b.LateFee
		outstanding := billed - b.AmountPaid
		overdue := rules.IsOverdue(b.Status, b.BillingPeriod, overdueDay, now)
		if b.Status != "paid" && overdue {
			openOverdue++
		}
		if b.BillingPeriod == cycle {
			out.Summary.CycleBilledAmount += billed
			out.Summary.CycleCollectedAmount += b.AmountPaid
			var key string
			switch {
			case b.Status == "paid":
				key = "paid"
			case overdue:
				key = "overdue"
			case b.Status == "partial":
				key = "partial"
			default:
				key = "unpaid"
			}
			funnel[key].Count++
			funnel[key].Amount += billed
			if overdue {
				out.Summary.CycleOverdueCount++
				out.Summary.CycleOverdueAmount += outstanding
			}
		}
		if b.Status != "paid" && (overdue || b.PendingProofCount > 0) && len(out.PriorityBills) < priorityBillLimit {
			out.PriorityBills = append(out.PriorityBills, PriorityBill{
				ID: b.ID, Tenant: b.TenantName, Property: b.PropertyName, Unit: b.UnitCode,
				Period: b.BillingPeriod, Amount: billed, Paid: b.AmountPaid, DueDate: b.DueDate,
				Status: rules.DisplayStatus(b.Status, b.PendingProofCount, overdue),
			})
		}
	}
	out.Summary.CycleOutstandingAmount = out.Summary.CycleBilledAmount - out.Summary.CycleCollectedAmount
	for _, key := range []string{"paid", "partial", "unpaid", "overdue"} {
		out.CollectionFunnel = append(out.CollectionFunnel, *funnel[key])
	}
	out.Focus.OverdueBills = openOverdue

	// Contracts ending within the expiring window.
	windowEnd := today0.AddDate(0, 0, expiringWindowDays)
	contracts, err := uc.repo.ContractsEndingBetween(today, windowEnd.Format("2006-01-02"))
	if err != nil {
		return nil, err
	}
	for _, c := range contracts {
		end, err := time.ParseInLocation("2006-01-02", c.EndDate, now.Location())
		if err != nil {
			continue
		}
		daysLeft := int(end.Sub(today0).Hours() / 24)
		if daysLeft <= 30 {
			out.Summary.ContractsExpiring30d++
		}
		out.ExpiringContracts = append(out.ExpiringContracts, ExpiringContract{
			ID: c.ID, Tenant: c.TenantName, Property: c.PropertyName, Unit: c.UnitCode,
			EndDate: c.EndDate, DaysLeft: daysLeft, Renewal: renewalNotStarted,
		})
	}
	out.Summary.ContractsExpiring60d = int64(len(out.ExpiringContracts))

	// Complaints: total open, and how many have been open longer than the SLA.
	openComplaints, err := uc.repo.OpenComplaints()
	if err != nil {
		return nil, err
	}
	out.Summary.OpenComplaints = openComplaints
	slaCutoff := today0.AddDate(0, 0, -complaintSLADays).Format("2006-01-02")
	overSLA, err := uc.repo.OpenComplaintsOpenedBefore(slaCutoff)
	if err != nil {
		return nil, err
	}
	out.Summary.ComplaintsOverSLA = overSLA

	weekStart := today0.AddDate(0, 0, -((int(now.Weekday()) + 6) % 7)).Format("2006-01-02")
	maintenance, err := uc.repo.MaintenanceStats(weekStart)
	if err != nil {
		return nil, err
	}
	out.Summary.OpenMaintenance = maintenance.Open
	out.Summary.UrgentMaintenance = maintenance.Urgent
	out.Summary.MaintenanceNewWeek = maintenance.NewThisWeek
	out.Summary.MaintenanceNewTenant = maintenance.NewFromTenant
	out.Summary.MaintenanceNewAdmin = maintenance.NewFromAdmin

	avgDays, err := uc.repo.AvgMaintenanceResolutionDays(cycle)
	if err != nil {
		return nil, err
	}
	out.Summary.AvgResolutionDays = round1(avgDays)

	proofs, err := uc.repo.PendingProofs()
	if err != nil {
		return nil, err
	}
	out.Summary.PendingProofCount = proofs.Pending
	out.Summary.PendingProofAmount = proofs.PendingAmount

	if out.Summary.OpenBills, err = uc.repo.OpenBills(); err != nil {
		return nil, err
	}
	out.Summary.VacantUnits = total - out.Summary.OccupiedUnits

	out.Focus.ExpiringContracts = out.Summary.ContractsExpiring30d
	out.Focus.UrgentMaintenance = out.Summary.UrgentMaintenance
	out.Focus.PendingProofs = out.Summary.PendingProofCount

	// Last 12 months ending with the cycle, oldest first.
	since := cycleStart.AddDate(0, -(revenueMonths - 1), 0)
	collected, err := uc.repo.CollectedByMonth(since.Format("2006-01-02"))
	if err != nil {
		return nil, err
	}
	lateFees, err := uc.repo.LateFeesByMonth(since.Format("2006-01-02"))
	if err != nil {
		return nil, err
	}
	billedRows, err := uc.repo.BilledByMonth(since.Format("2006-01"))
	if err != nil {
		return nil, err
	}
	collectedBy := make(map[string]float64)
	for _, row := range collected {
		collectedBy[row.Month] = row.Total
	}
	lateFeeBy := make(map[string]float64)
	for _, row := range lateFees {
		lateFeeBy[row.Month] = row.Total
	}
	billedBy := make(map[string]float64)
	for _, row := range billedRows {
		billedBy[row.Month] = row.Total
	}
	for i := revenueMonths - 1; i >= 0; i-- {
		month := cycleStart.AddDate(0, -i, 0).Format("2006-01")
		extra := lateFeeBy[month]
		rent := math.Max(collectedBy[month]-extra, 0)
		out.Revenue = append(out.Revenue, RevenuePoint{Month: month, Billed: billedBy[month], Rent: rent, Extra: extra})
	}

	out.Activity = uc.activity(now)
	return out, nil
}

// activity merges recent payments, complaints, new contracts and move-outs into one feed, newest first.
func (uc *DashboardUsecase) activity(now time.Time) []ActivityItem {
	items := make([]ActivityItem, 0)
	add := func(kind string, rows []dashrepo.EventRow, err error) {
		if err != nil {
			return
		}
		for _, row := range rows {
			minutes := int(now.Sub(row.At).Minutes())
			if minutes < 0 {
				minutes = 0
			}
			item := ActivityItem{
				ID:         fmt.Sprintf("%s-%d", kind, row.ID),
				Type:       kind,
				MinutesAgo: minutes,
				Tenant:     row.TenantName,
				Property:   nilIfEmpty(row.PropertyName),
			}
			if kind == "payment" {
				item.Detail = row.Amount
			}
			items = append(items, item)
		}
	}
	payments, err := uc.repo.RecentPayments(activityPerSource)
	add("payment", payments, err)
	complaints, err := uc.repo.RecentComplaints(activityPerSource)
	add("complaint", complaints, err)
	contracts, err := uc.repo.RecentContracts(activityPerSource)
	add("contract", contracts, err)
	moveOuts, err := uc.repo.RecentMoveOuts(activityPerSource)
	add("moveout", moveOuts, err)

	sort.SliceStable(items, func(i, j int) bool { return items[i].MinutesAgo < items[j].MinutesAgo })
	if len(items) > activityLimit {
		items = items[:activityLimit]
	}
	return items
}
