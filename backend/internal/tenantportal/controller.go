// Package tenantportal exposes read-only endpoints for the logged-in tenant.
// Every query is scoped to the tenant profile linked to the session's user.
package tenantportal

import (
	"errors"
	"net/http"

	complaintrepo "backend/internal/complaint/repository"
	complaintusecase "backend/internal/complaint/usecase"
	maintenancerepo "backend/internal/maintenance/repository"
	maintenanceusecase "backend/internal/maintenance/usecase"
	paymentrepo "backend/internal/payment/repository"
	"backend/internal/pkg/middleware"
	"backend/internal/pkg/response"
	"backend/internal/pkg/storage"
	userdelivery "backend/internal/user/delivery"

	"gorm.io/gorm"
)

type Controller struct {
	db          *gorm.DB
	secret      string
	store       storage.Uploader
	payments    *paymentrepo.SQLiteRepository
	maintenance *maintenanceusecase.MaintenanceUsecase
	complaints  *complaintusecase.ComplaintUsecase
}

func NewController(db *gorm.DB, tokenSecret string) *Controller {
	return &Controller{
		db:          db,
		secret:      tokenSecret,
		payments:    paymentrepo.NewSQLiteRepository(db),
		maintenance: maintenanceusecase.NewMaintenanceUsecase(maintenancerepo.NewSQLiteRepository(db)),
		complaints:  complaintusecase.NewComplaintUsecase(complaintrepo.NewSQLiteRepository(db)),
	}
}

// WithStorage attaches object storage used for payment proof uploads and presigned file links.
func (c *Controller) WithStorage(u storage.Uploader) *Controller {
	c.store = u
	return c
}

// currentTenantID resolves the session's username to the tenant row linked to it.
func (c *Controller) currentTenantID(r *http.Request) (uint, error) {
	cookie, err := r.Cookie(middleware.AuthCookieName)
	if err != nil {
		return 0, err
	}
	username, _, ok := userdelivery.VerifyToken(cookie.Value, c.secret)
	if !ok {
		return 0, errors.New("invalid session")
	}

	var id uint
	err = c.db.Raw(`
		SELECT t.id FROM tenants t
		JOIN auth_users u ON u.id = t.user_id
		WHERE u.username = ? AND u.role = 'tenant'
		LIMIT 1`, username).Scan(&id).Error
	if err != nil {
		return 0, err
	}
	if id == 0 {
		return 0, gorm.ErrRecordNotFound
	}
	return id, nil
}

// tenantOr404 resolves the tenant for the request, or writes the not-linked error and reports false.
func (c *Controller) tenantOr404(w http.ResponseWriter, r *http.Request) (uint, bool) {
	tenantID, err := c.currentTenantID(r)
	if err != nil {
		response.WriteError(w, http.StatusNotFound, "TENANT_NOT_LINKED", "no tenant profile is linked to this account")
		return 0, false
	}
	return tenantID, true
}

// paginate returns the slice for the 1-based page, or an empty slice when the page is past the end.
func paginate[T any](rows []T, page, perPage int) []T {
	start := (page - 1) * perPage
	if start >= len(rows) {
		return []T{}
	}
	return rows[start:min(start+perPage, len(rows))]
}
