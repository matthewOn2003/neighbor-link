package delivery

import (
	"encoding/json"
	"net/http"
	"strings"

	"backend/internal/pkg/httpx"
	"backend/internal/pkg/response"

	"gorm.io/gorm"
)

type staffListRequest struct {
	CurrentPage int    `json:"current_page"`
	PerPage     int    `json:"per_page"`
	Keyword     string `json:"keyword"`
}

func decodeStaffListRequest(w http.ResponseWriter, r *http.Request) (staffListRequest, bool) {
	var req staffListRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.WriteError(w, http.StatusBadRequest, "INVALID_INPUT", "invalid request body")
		return req, false
	}
	return req, true
}

// keywordLike returns the trimmed keyword wrapped for a LIKE match, or "" when empty.
func keywordLike(keyword string) string {
	keyword = strings.TrimSpace(keyword)
	if keyword == "" {
		return ""
	}
	return "%" + keyword + "%"
}

// writePagedList counts the query, applies the page window and writes the standard list payload.
func writePagedList[T any](w http.ResponseWriter, query *gorm.DB, order string, currentPage, perPage int, failMessage string) {
	var total int64
	if err := query.Count(&total).Error; err != nil {
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", failMessage)
		return
	}

	var rows []T
	err := query.
		Order(order).
		Offset((currentPage - 1) * perPage).
		Limit(perPage).
		Scan(&rows).Error
	if err != nil {
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", failMessage)
		return
	}

	response.WriteSuccess(w, http.StatusOK, response.NewListData(rows, currentPage, perPage, total))
}

func (c *Controller) ListDepartments(w http.ResponseWriter, r *http.Request) {
	req, ok := decodeStaffListRequest(w, r)
	if !ok {
		return
	}
	currentPage, perPage := httpx.NormalizePagination(req.CurrentPage, req.PerPage)

	query := c.db.Model(&Department{})
	if like := keywordLike(req.Keyword); like != "" {
		query = query.Where("name LIKE ? OR code LIKE ?", like, like)
	}
	writePagedList[Department](w, query, "name", currentPage, perPage, "failed to list departments")
}

func (c *Controller) ListPositions(w http.ResponseWriter, r *http.Request) {
	req, ok := decodeStaffListRequest(w, r)
	if !ok {
		return
	}
	currentPage, perPage := httpx.NormalizePagination(req.CurrentPage, req.PerPage)

	query := c.db.Table("staff_positions p").
		Joins("LEFT JOIN staff_departments d ON d.id = p.department_id").
		Select("p.*, d.name AS department_name")
	if like := keywordLike(req.Keyword); like != "" {
		query = query.Where("p.name LIKE ? OR p.code LIKE ? OR d.name LIKE ?", like, like, like)
	}
	writePagedList[Position](w, query, "d.name, p.name", currentPage, perPage, "failed to list positions")
}

func (c *Controller) ListAccounts(w http.ResponseWriter, r *http.Request) {
	req, ok := decodeStaffListRequest(w, r)
	if !ok {
		return
	}
	currentPage, perPage := httpx.NormalizePagination(req.CurrentPage, req.PerPage)

	query := c.db.Table("staff_accounts a").
		Joins("LEFT JOIN staff_positions p ON p.id = a.position_id").
		Joins("LEFT JOIN staff_departments d ON d.id = p.department_id").
		Select("a.id, a.username, a.name, a.phone, a.email, a.position_id, a.status, p.name AS position_name, d.name AS department_name")
	if like := keywordLike(req.Keyword); like != "" {
		query = query.Where(
			"a.username LIKE ? OR a.name LIKE ? OR a.email LIKE ? OR a.phone LIKE ? OR p.name LIKE ?",
			like, like, like, like, like,
		)
	}
	writePagedList[Account](w, query, "a.id DESC", currentPage, perPage, "failed to list accounts")
}
