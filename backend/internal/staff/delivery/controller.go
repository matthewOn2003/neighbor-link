package delivery

import (
	"backend/internal/pkg/middleware"
	"backend/internal/pkg/response"
	userdelivery "backend/internal/user/delivery"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type Controller struct{ db *gorm.DB }

func NewController(db *gorm.DB) *Controller { return &Controller{db: db} }

// Department 对应 staff_departments。Headcount 为只读统计（由列表查询计算），不会被写入数据库。
type Department struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `json:"name"`
	Code        string    `json:"code"`
	Description string    `json:"description"`
	ManagerName string    `json:"manager_name"`
	Location    string    `json:"location"`
	Phone       string    `json:"phone"`
	Headcount   int       `gorm:"->" json:"headcount"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (Department) TableName() string { return "staff_departments" }

// Position 对应 staff_positions。Headcount 为只读统计，DepartmentName 为联表字段。
type Position struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	DepartmentID   uint      `json:"department_id"`
	DepartmentName string    `gorm:"-" json:"department_name"`
	Name           string    `json:"name"`
	Code           string    `json:"code"`
	Description    string    `json:"description"`
	Level          string    `json:"level"`
	EmploymentType string    `json:"employment_type"`
	PermissionIDs  string    `json:"permission_ids"`
	Headcount      int       `gorm:"->" json:"headcount"`
	Status         string    `json:"status"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

func (Position) TableName() string { return "staff_positions" }

// Account 对应 staff_accounts。PositionName / DepartmentName 为联表字段。
type Account struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	Username       string    `json:"username"`
	PasswordHash   string    `json:"-"`
	Name           string    `json:"name"`
	Phone          string    `json:"phone"`
	Email          string    `json:"email"`
	EmployeeNo     string    `json:"employee_no"`
	HireDate       string    `json:"hire_date"`
	PositionID     uint      `json:"position_id"`
	PositionName   string    `gorm:"-" json:"position_name"`
	DepartmentName string    `gorm:"-" json:"department_name"`
	Status         string    `json:"status"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

func (Account) TableName() string        { return "staff_accounts" }
func decode(r *http.Request, v any) bool { return json.NewDecoder(r.Body).Decode(v) == nil }
func id(r *http.Request) (uint, bool) {
	n, e := strconv.ParseUint(r.PathValue("id"), 10, 64)
	return uint(n), e == nil && n > 0
}
func (c *Controller) SaveDepartment(w http.ResponseWriter, r *http.Request) {
	var v Department
	if !decode(r, &v) || strings.TrimSpace(v.Name) == "" || strings.TrimSpace(v.Code) == "" {
		response.WriteError(w, 400, "INVALID_INPUT", "name and code required")
		return
	}
	if v.Status == "" {
		v.Status = "active"
	}
	if n, ok := id(r); ok {
		if e := c.db.Model(&Department{}).Where("id=?", n).Updates(map[string]any{"name": v.Name, "code": v.Code, "description": v.Description, "manager_name": v.ManagerName, "location": v.Location, "phone": v.Phone, "status": v.Status, "updated_at": time.Now()}).Error; e != nil {
			response.WriteError(w, 409, "DUPLICATE", "name or code exists")
			return
		}
		v.ID = n
		response.WriteSuccess(w, 200, v)
		return
	}
	if e := c.db.Create(&v).Error; e != nil {
		response.WriteError(w, 409, "DUPLICATE", "name or code exists")
		return
	}
	response.WriteSuccess(w, 201, v)
}
func (c *Controller) SavePosition(w http.ResponseWriter, r *http.Request) {
	var v struct {
		DepartmentID   uint     `json:"department_id"`
		Name           string   `json:"name"`
		Code           string   `json:"code"`
		Description    string   `json:"description"`
		Level          string   `json:"level"`
		EmploymentType string   `json:"employment_type"`
		PermissionIDs  []string `json:"permission_ids"`
		Status         string   `json:"status"`
	}
	if !decode(r, &v) || v.DepartmentID == 0 || v.Name == "" || v.Code == "" {
		response.WriteError(w, 400, "INVALID_INPUT", "department, name and code required")
		return
	}
	var d Department
	if c.db.First(&d, v.DepartmentID).Error != nil {
		response.WriteError(w, 400, "INVALID_DEPARTMENT", "department not found")
		return
	}
	b, _ := json.Marshal(v.PermissionIDs)
	if v.Status == "" {
		v.Status = "active"
	}
	if v.Level == "" {
		v.Level = "staff"
	}
	if v.EmploymentType == "" {
		v.EmploymentType = "full_time"
	}
	p := Position{DepartmentID: v.DepartmentID, DepartmentName: d.Name, Name: v.Name, Code: v.Code, Description: v.Description, Level: v.Level, EmploymentType: v.EmploymentType, PermissionIDs: string(b), Status: v.Status}
	if n, ok := id(r); ok {
		p.ID = n
		if e := c.db.Model(&Position{}).Where("id=?", n).Updates(map[string]any{"department_id": p.DepartmentID, "name": p.Name, "code": p.Code, "description": p.Description, "level": p.Level, "employment_type": p.EmploymentType, "permission_ids": p.PermissionIDs, "status": p.Status, "updated_at": time.Now()}).Error; e != nil {
			response.WriteError(w, 409, "DUPLICATE", "position code exists")
			return
		}
	} else if e := c.db.Create(&p).Error; e != nil {
		response.WriteError(w, 409, "DUPLICATE", "position code exists")
		return
	}
	response.WriteSuccess(w, 200, p)
}
func (c *Controller) SaveAccount(w http.ResponseWriter, r *http.Request) {
	var v struct {
		Username   string `json:"username"`
		Password   string `json:"password"`
		Name       string `json:"name"`
		Phone      string `json:"phone"`
		Email      string `json:"email"`
		EmployeeNo string `json:"employee_no"`
		HireDate   string `json:"hire_date"`
		PositionID uint   `json:"position_id"`
		Status     string `json:"status"`
	}
	if !decode(r, &v) || v.Username == "" || v.Name == "" || v.PositionID == 0 {
		response.WriteError(w, 400, "INVALID_INPUT", "username, name and position required")
		return
	}
	if !validDateOrEmpty(v.HireDate) {
		response.WriteError(w, 400, "INVALID_INPUT", "hire_date must be YYYY-MM-DD")
		return
	}
	var p Position
	if c.db.First(&p, v.PositionID).Error != nil {
		response.WriteError(w, 400, "INVALID_POSITION", "position not found")
		return
	}
	if v.Status == "" {
		v.Status = "active"
	}
	values := map[string]any{"username": v.Username, "name": v.Name, "phone": v.Phone, "email": v.Email, "employee_no": v.EmployeeNo, "hire_date": v.HireDate, "position_id": v.PositionID, "status": v.Status, "updated_at": time.Now()}
	if n, ok := id(r); ok {
		if v.Password != "" {
			h, e := bcrypt.GenerateFromPassword([]byte(v.Password), bcrypt.DefaultCost)
			if e != nil {
				response.WriteError(w, 500, "INTERNAL_ERROR", "password hash failed")
				return
			}
			values["password_hash"] = string(h)
		}
		res := c.db.Model(&Account{}).Where("id=?", n).Updates(values)
		if res.Error != nil {
			response.WriteError(w, 409, "DUPLICATE", "account exists")
			return
		}
		if res.RowsAffected == 0 {
			response.WriteError(w, 404, "NOT_FOUND", "account not found")
			return
		}
		response.WriteSuccess(w, 200, map[string]any{"id": n, "username": v.Username, "name": v.Name, "phone": v.Phone, "email": v.Email, "employee_no": v.EmployeeNo, "hire_date": v.HireDate, "position_id": v.PositionID, "position_name": p.Name, "status": v.Status})
		return
	}
	if v.Password == "" {
		response.WriteError(w, 400, "INVALID_INPUT", "password required")
		return
	}
	h, e := bcrypt.GenerateFromPassword([]byte(v.Password), bcrypt.DefaultCost)
	if e != nil {
		response.WriteError(w, 500, "INTERNAL_ERROR", "password hash failed")
		return
	}
	a := Account{Username: v.Username, PasswordHash: string(h), Name: v.Name, Phone: v.Phone, Email: v.Email, EmployeeNo: v.EmployeeNo, HireDate: v.HireDate, PositionID: v.PositionID, Status: v.Status}
	if e := c.db.Create(&a).Error; e != nil {
		response.WriteError(w, 409, "DUPLICATE", "account exists")
		return
	}
	a.PositionName = p.Name
	response.WriteSuccess(w, 201, a)
}
func (c *Controller) Delete(w http.ResponseWriter, r *http.Request) {
	n, ok := id(r)
	if !ok {
		response.WriteError(w, 400, "INVALID_INPUT", "invalid id")
		return
	}
	path := r.URL.Path
	var e error
	switch {
	case strings.Contains(path, "staff-account"):
		e = c.db.Delete(&Account{}, n).Error
	case strings.Contains(path, "staff-position"):
		var count int64
		c.db.Model(&Account{}).Where("position_id=?", n).Count(&count)
		if count > 0 {
			response.WriteError(w, 409, "IN_USE", "position assigned to accounts")
			return
		}
		e = c.db.Delete(&Position{}, n).Error
	case strings.Contains(path, "staff-department"):
		var count int64
		c.db.Model(&Position{}).Where("department_id=?", n).Count(&count)
		if count > 0 {
			response.WriteError(w, 409, "IN_USE", "department has positions")
			return
		}
		e = c.db.Delete(&Department{}, n).Error
	}
	if e != nil {
		response.WriteError(w, 500, "INTERNAL_ERROR", "delete failed")
		return
	}
	response.WriteSuccess(w, 200, map[string]bool{"success": true})
}
func NewRouter(c *Controller, secret string, origins []string) http.Handler {
	mux := http.NewServeMux()
	adminMiddleware := middleware.RequireRole(secret, userdelivery.VerifyToken, "admin")
	mux.HandleFunc("POST /api/v1/staff-account/list", adminMiddleware(c.ListAccounts))
	mux.HandleFunc("POST /api/v1/staff-account/create", adminMiddleware(c.SaveAccount))
	mux.HandleFunc("POST /api/v1/staff-account/update/{id}", adminMiddleware(c.SaveAccount))
	mux.HandleFunc("POST /api/v1/staff-account/delete/{id}", adminMiddleware(c.Delete))
	mux.HandleFunc("POST /api/v1/staff-department/list", adminMiddleware(c.ListDepartments))
	mux.HandleFunc("POST /api/v1/staff-department/create", adminMiddleware(c.SaveDepartment))
	mux.HandleFunc("POST /api/v1/staff-department/update/{id}", adminMiddleware(c.SaveDepartment))
	mux.HandleFunc("POST /api/v1/staff-department/delete/{id}", adminMiddleware(c.Delete))
	mux.HandleFunc("POST /api/v1/staff-position/list", adminMiddleware(c.ListPositions))
	mux.HandleFunc("POST /api/v1/staff-position/create", adminMiddleware(c.SavePosition))
	mux.HandleFunc("POST /api/v1/staff-position/update/{id}", adminMiddleware(c.SavePosition))
	mux.HandleFunc("POST /api/v1/staff-position/delete/{id}", adminMiddleware(c.Delete))
	return middleware.WithCORS(mux, origins)
}
