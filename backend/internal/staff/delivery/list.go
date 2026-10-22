package delivery

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"backend/internal/pkg/httpx"
	"backend/internal/pkg/response"

	"gorm.io/gorm"
)

// pageRequest 是所有列表请求共用的分页参数。
type pageRequest struct {
	CurrentPage int `json:"current_page"`
	PerPage     int `json:"per_page"`
}

type departmentListRequest struct {
	pageRequest
	Keyword     string `json:"keyword"`
	Code        string `json:"code"`
	Status      string `json:"status"`
	Location    string `json:"location"`
	ManagerName string `json:"manager_name"`
	CreatedFrom string `json:"created_from"`
	CreatedTo   string `json:"created_to"`
}

type positionListRequest struct {
	pageRequest
	Keyword        string `json:"keyword"`
	Code           string `json:"code"`
	DepartmentID   string `json:"department_id"`
	Level          string `json:"level"`
	EmploymentType string `json:"employment_type"`
	Status         string `json:"status"`
}

type accountListRequest struct {
	pageRequest
	Keyword      string `json:"keyword"`
	Username     string `json:"username"`
	DepartmentID string `json:"department_id"`
	PositionID   string `json:"position_id"`
	Status       string `json:"status"`
	HireFrom     string `json:"hire_date_from"`
	HireTo       string `json:"hire_date_to"`
}

func decodeListRequest[T any](w http.ResponseWriter, r *http.Request) (T, bool) {
	var req T
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

// whereKeyword 在多个列上做模糊匹配（任一列命中即可）；关键字为空时不加条件。
func whereKeyword(q *gorm.DB, keyword string, columns ...string) *gorm.DB {
	like := keywordLike(keyword)
	if like == "" {
		return q
	}
	conditions := make([]string, 0)
	args := make([]any, 0)
	for _, column := range columns {
		conditions = append(conditions, column+" LIKE ?")
		args = append(args, like)
	}
	return q.Where("("+strings.Join(conditions, " OR ")+")", args...)
}

// whereLike 对单个文本列做模糊匹配；值为空时不加条件。
func whereLike(q *gorm.DB, column, value string) *gorm.DB {
	like := keywordLike(value)
	if like == "" {
		return q
	}
	return q.Where(column+" LIKE ?", like)
}

// whereEqual 对精确匹配的列做过滤（状态、外键等）；值为空时不加条件。
func whereEqual(q *gorm.DB, column, value string) *gorm.DB {
	value = strings.TrimSpace(value)
	if value == "" {
		return q
	}
	return q.Where(column+" = ?", value)
}

// whereDateRange 对日期表达式做闭区间过滤（YYYY-MM-DD）；边界为空时不限制该侧。
func whereDateRange(q *gorm.DB, dateExpr, from, to string) *gorm.DB {
	if from = strings.TrimSpace(from); from != "" {
		q = q.Where(dateExpr+" >= ?", from)
	}
	if to = strings.TrimSpace(to); to != "" {
		q = q.Where(dateExpr+" <= ?", to)
	}
	return q
}

// validDateOrEmpty reports whether value is empty or a valid YYYY-MM-DD date.
func validDateOrEmpty(value string) bool {
	if value == "" {
		return true
	}
	_, err := time.Parse("2006-01-02", value)
	return err == nil
}

// writePagedList 分别用 build 生成的查询做计数与分页取数，并写出标准列表结构。
// build 每次都返回全新的查询，避免计数与取数之间互相污染条件。
func writePagedList[T any](w http.ResponseWriter, build func() *gorm.DB, selectExpr, order string, currentPage, perPage int, failMessage string) {
	var total int64
	if err := build().Count(&total).Error; err != nil {
		response.WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", failMessage)
		return
	}

	var rows []T
	err := build().
		Select(selectExpr).
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

// departmentHeadcount 统计部门下所有职位的员工数。
const departmentHeadcount = "(SELECT COUNT(*) FROM staff_accounts a JOIN staff_positions p ON p.id = a.position_id WHERE p.department_id = staff_departments.id) AS headcount"

// positionHeadcount 统计职位下的员工数。
const positionHeadcount = "(SELECT COUNT(*) FROM staff_accounts a WHERE a.position_id = p.id) AS headcount"

func (c *Controller) ListDepartments(w http.ResponseWriter, r *http.Request) {
	req, ok := decodeListRequest[departmentListRequest](w, r)
	if !ok {
		return
	}
	currentPage, perPage := httpx.NormalizePagination(req.CurrentPage, req.PerPage)

	build := func() *gorm.DB {
		q := c.db.Table("staff_departments")
		q = whereKeyword(q, req.Keyword, "staff_departments.name", "staff_departments.code", "staff_departments.manager_name", "staff_departments.location")
		q = whereLike(q, "staff_departments.code", req.Code)
		q = whereEqual(q, "staff_departments.status", req.Status)
		q = whereLike(q, "staff_departments.location", req.Location)
		q = whereLike(q, "staff_departments.manager_name", req.ManagerName)
		q = whereDateRange(q, "date(staff_departments.created_at)", req.CreatedFrom, req.CreatedTo)
		return q
	}
	writePagedList[Department](w, build, "staff_departments.*, "+departmentHeadcount, "staff_departments.name", currentPage, perPage, "failed to list departments")
}

func (c *Controller) ListPositions(w http.ResponseWriter, r *http.Request) {
	req, ok := decodeListRequest[positionListRequest](w, r)
	if !ok {
		return
	}
	currentPage, perPage := httpx.NormalizePagination(req.CurrentPage, req.PerPage)

	build := func() *gorm.DB {
		q := c.db.Table("staff_positions p").
			Joins("LEFT JOIN staff_departments d ON d.id = p.department_id")
		q = whereKeyword(q, req.Keyword, "p.name", "p.code", "d.name")
		q = whereLike(q, "p.code", req.Code)
		q = whereEqual(q, "p.department_id", req.DepartmentID)
		q = whereEqual(q, "p.level", req.Level)
		q = whereEqual(q, "p.employment_type", req.EmploymentType)
		q = whereEqual(q, "p.status", req.Status)
		return q
	}
	writePagedList[Position](w, build, "p.*, d.name AS department_name, "+positionHeadcount, "d.name, p.name", currentPage, perPage, "failed to list positions")
}

func (c *Controller) ListAccounts(w http.ResponseWriter, r *http.Request) {
	req, ok := decodeListRequest[accountListRequest](w, r)
	if !ok {
		return
	}
	currentPage, perPage := httpx.NormalizePagination(req.CurrentPage, req.PerPage)

	build := func() *gorm.DB {
		q := c.db.Table("staff_accounts a").
			Joins("LEFT JOIN staff_positions p ON p.id = a.position_id").
			Joins("LEFT JOIN staff_departments d ON d.id = p.department_id")
		q = whereKeyword(q, req.Keyword, "a.username", "a.name", "a.email", "a.phone", "a.employee_no", "p.name")
		q = whereLike(q, "a.username", req.Username)
		q = whereEqual(q, "d.id", req.DepartmentID)
		q = whereEqual(q, "a.position_id", req.PositionID)
		q = whereEqual(q, "a.status", req.Status)
		q = whereDateRange(q, "a.hire_date", req.HireFrom, req.HireTo)
		return q
	}
	selectExpr := "a.id, a.username, a.name, a.phone, a.email, a.employee_no, a.hire_date, a.created_at, a.updated_at, a.position_id, a.status, p.name AS position_name, d.name AS department_name"
	writePagedList[Account](w, build, selectExpr, "a.id DESC", currentPage, perPage, "failed to list accounts")
}
