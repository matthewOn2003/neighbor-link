package tenantportal

// statusCounts returns how many of the tenant's rows in table sit in each status, and their total.
// table is always one of this package's own constants, never request input.
func (c *Controller) statusCounts(table string, tenantID uint) (map[string]int64, int64, error) {
	type row struct {
		Status string
		N      int64
	}
	var rows []row
	err := c.db.Raw("SELECT status, COUNT(*) AS n FROM "+table+" WHERE tenant_id = ? GROUP BY status", tenantID).Scan(&rows).Error
	if err != nil {
		return nil, 0, err
	}
	counts := make(map[string]int64, len(rows))
	var total int64
	for _, r := range rows {
		counts[r.Status] = r.N
		total += r.N
	}
	return counts, total, nil
}

// maintenanceSummary counts the tenant's repair requests by status and how many have a visit booked.
type maintenanceSummary struct {
	Total      int64 `json:"total"`
	Open       int64 `json:"open"`
	InProgress int64 `json:"in_progress"`
	Resolved   int64 `json:"resolved"`
	Closed     int64 `json:"closed"`
	Scheduled  int64 `json:"scheduled"`
}

func (c *Controller) maintenanceSummary(tenantID uint) (maintenanceSummary, error) {
	counts, total, err := c.statusCounts("maintenance_requests", tenantID)
	if err != nil {
		return maintenanceSummary{}, err
	}
	var scheduled int64
	err = c.db.Raw(`
		SELECT COUNT(*) FROM maintenance_requests
		WHERE tenant_id = ? AND scheduled_at IS NOT NULL AND scheduled_at <> ''
		  AND status IN ('open', 'in_progress')`, tenantID).Scan(&scheduled).Error
	if err != nil {
		return maintenanceSummary{}, err
	}
	return maintenanceSummary{
		Total:      total,
		Open:       counts["open"],
		InProgress: counts["in_progress"],
		Resolved:   counts["resolved"],
		Closed:     counts["closed"],
		Scheduled:  scheduled,
	}, nil
}

// complaintSummary counts the tenant's complaints by status.
type complaintSummary struct {
	Total      int64 `json:"total"`
	Open       int64 `json:"open"`
	InProgress int64 `json:"in_progress"`
	Resolved   int64 `json:"resolved"`
	Closed     int64 `json:"closed"`
}

func (c *Controller) complaintSummary(tenantID uint) (complaintSummary, error) {
	counts, total, err := c.statusCounts("complaints", tenantID)
	if err != nil {
		return complaintSummary{}, err
	}
	return complaintSummary{
		Total:      total,
		Open:       counts["open"],
		InProgress: counts["in_progress"],
		Resolved:   counts["resolved"],
		Closed:     counts["closed"],
	}, nil
}
