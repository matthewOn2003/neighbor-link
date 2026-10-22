package tenantportal

import (
	"net/http"
	"time"

	"backend/internal/pkg/httpx"
)

// tenantRecord is the tenant row linked to the session.
type tenantRecord struct {
	ID          uint    `gorm:"column:id"`
	Name        string  `gorm:"column:name"`
	Email       string  `gorm:"column:email"`
	Phone       string  `gorm:"column:phone"`
	PropertyID  *uint   `gorm:"column:property_id"`
	UnitID      *uint   `gorm:"column:unit_id"`
	MonthlyRent float64 `gorm:"column:monthly_rent"`
}

// propertyInfo is the property the tenant lives in. The Wi-Fi password is served by the wifi endpoint only.
type propertyInfo struct {
	ID           uint   `json:"id"`
	Name         string `json:"name"`
	Address      string `json:"address"`
	City         string `json:"city"`
	PropertyType string `json:"property_type"`
	Description  string `json:"description"`
	CoverImage   string `json:"cover_image"`
	WifiSSID     string `json:"wifi_ssid"`
	WifiSpeed    string `json:"wifi_speed"`
	OpsDeskName  string `json:"ops_desk_name"`
	OpsDeskPhone string `json:"ops_desk_phone"`
	OpsDeskHours string `json:"ops_desk_hours"`
}

// unitInfo locates the tenant's unit inside its block and floor.
type unitInfo struct {
	ID         uint   `json:"id"`
	Code       string `json:"code"`
	BlockCode  string `json:"block_code"`
	BlockName  string `json:"block_name"`
	FloorLevel int    `json:"floor_level"`
	Bedrooms   int    `json:"bedrooms"`
	SizeSqft   int    `json:"size_sqft"`
}

// agreementInfo describes the signed tenancy agreement. FileURL is empty until a file is stored.
type agreementInfo struct {
	Name      string `json:"name"`
	SizeBytes int64  `json:"size_bytes"`
	SignedAt  string `json:"signed_at"`
	FileURL   string `json:"file_url"`
}

// contractInfo is the tenant's most relevant lease: an active one if present, otherwise the newest.
type contractInfo struct {
	ID              uint           `json:"id"`
	Status          string         `json:"status"`
	StartDate       string         `json:"start_date"`
	EndDate         string         `json:"end_date"`
	TermMonths      int            `json:"term_months"`
	MonthlyRent     float64        `json:"monthly_rent"`
	SecurityDeposit float64        `json:"security_deposit"`
	BillingDay      int            `json:"billing_day"`
	Agreement       *agreementInfo `json:"agreement"`
}

type contractRow struct {
	ID              uint
	Status          string
	StartDate       string
	EndDate         string
	MonthlyRent     float64
	SecurityDeposit float64
	BillingDay      int
	AgreementName   string
	AgreementKey    string
	AgreementSize   int64
	SignedAt        string
}

type meResponse struct {
	TenantID           uint          `json:"tenant_id"`
	Name               string        `json:"name"`
	Email              string        `json:"email"`
	Phone              string        `json:"phone"`
	MonthlyRent        float64       `json:"monthly_rent"`
	OutstandingBalance float64       `json:"outstanding_balance"`
	Property           *propertyInfo `json:"property"`
	Unit               *unitInfo     `json:"unit"`
	Contract           *contractInfo `json:"contract"`
}

func (c *Controller) loadTenant(tenantID uint) (tenantRecord, error) {
	var t tenantRecord
	err := c.db.Raw(`
		SELECT id, name, COALESCE(email, '') AS email, phone, property_id, unit_id,
		       COALESCE(monthly_rent, 0) AS monthly_rent
		FROM tenants WHERE id = ?`, tenantID).Scan(&t).Error
	return t, err
}

func (c *Controller) loadProperty(propertyID *uint) (*propertyInfo, error) {
	if propertyID == nil {
		return nil, nil
	}
	var p propertyInfo
	err := c.db.Raw(`
		SELECT id, name, address, COALESCE(city, '') AS city, property_type,
		       COALESCE(description, '') AS description, COALESCE(cover_image, '') AS cover_image,
		       COALESCE(wifi_ssid, '') AS wifi_ssid, wifi_speed,
		       ops_desk_name, ops_desk_phone, ops_desk_hours
		FROM properties WHERE id = ?`, *propertyID).Scan(&p).Error
	if err != nil || p.ID == 0 {
		return nil, err
	}
	return &p, nil
}

func (c *Controller) loadUnit(unitID *uint) (*unitInfo, error) {
	if unitID == nil {
		return nil, nil
	}
	var u unitInfo
	err := c.db.Raw(`
		SELECT u.id, u.code, b.code AS block_code, COALESCE(b.name, '') AS block_name,
		       f.level AS floor_level, u.bedrooms, COALESCE(u.size_sqft, 0) AS size_sqft
		FROM units u
		JOIN blocks b ON b.id = u.block_id
		JOIN floors f ON f.id = u.floor_id
		WHERE u.id = ?`, *unitID).Scan(&u).Error
	if err != nil || u.ID == 0 {
		return nil, err
	}
	return &u, nil
}

func (c *Controller) loadContract(tenantID uint) (*contractInfo, error) {
	var row contractRow
	err := c.db.Raw(`
		SELECT id, status, start_date, end_date, monthly_rent, security_deposit, billing_day,
		       agreement_name, agreement_key, agreement_size, signed_at
		FROM contracts
		WHERE tenant_id = ?
		ORDER BY CASE WHEN status = 'active' THEN 0 ELSE 1 END, id DESC
		LIMIT 1`, tenantID).Scan(&row).Error
	if err != nil {
		return nil, err
	}
	if row.ID == 0 {
		return nil, nil
	}

	out := &contractInfo{
		ID:              row.ID,
		Status:          row.Status,
		StartDate:       row.StartDate,
		EndDate:         row.EndDate,
		TermMonths:      termMonths(row.StartDate, row.EndDate),
		MonthlyRent:     row.MonthlyRent,
		SecurityDeposit: row.SecurityDeposit,
		BillingDay:      row.BillingDay,
	}
	if row.AgreementName != "" {
		agreement := &agreementInfo{Name: row.AgreementName, SizeBytes: row.AgreementSize, SignedAt: row.SignedAt}
		if row.AgreementKey != "" && c.store != nil {
			if link, err := c.store.Presign(row.AgreementKey, proofPresignTTL); err == nil {
				agreement.FileURL = link
			}
		}
		out.Agreement = agreement
	}
	return out, nil
}

// termMonths counts whole months between the lease start and end dates (YYYY-MM-DD). Invalid dates give 0.
func termMonths(start, end string) int {
	s, errStart := time.Parse("2006-01-02", start)
	e, errEnd := time.Parse("2006-01-02", end)
	if errStart != nil || errEnd != nil || e.Before(s) {
		return 0
	}
	months := (e.Year()-s.Year())*12 + int(e.Month()-s.Month())
	if e.Day() < s.Day() {
		months--
	}
	return max(months, 0)
}

// Me returns the tenant's profile, property, unit and lease. The outstanding balance is derived from the bills.
func (c *Controller) Me(w http.ResponseWriter, r *http.Request) {
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

	httpx.WriteOK(w, meResponse{
		TenantID:           t.ID,
		Name:               t.Name,
		Email:              t.Email,
		Phone:              t.Phone,
		MonthlyRent:        t.MonthlyRent,
		OutstandingBalance: summarizeBills(bills).OutstandingTotal,
		Property:           property,
		Unit:               unit,
		Contract:           contract,
	})
}
