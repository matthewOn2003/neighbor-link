package delivery

import (
	"backend/internal/pkg/httpx"
	"backend/internal/pkg/middleware"
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
		httpx.WriteInvalidInput(w, "name and code required")
		return
	}
	if v.Status == "" {
		v.Status = "active"
	}
	if n, ok := id(r); ok {
		if e := c.db.Model(&Department{}).Where("id=?", n).Updates(map[string]any{"name": v.Name, "code": v.Code, "description": v.Description, "manager_name": v.ManagerName, "location": v.Location, "phone": v.Phone, "status": v.Status, "updated_at": time.Now()}).Error; e != nil {
			httpx.WriteConflict(w, "name or code exists")
			return
		}
		v.ID = n
		httpx.WriteOK(w, v)
		return
	}
	if e := c.db.Create(&v).Error; e != nil {
		httpx.WriteConflict(w, "name or code exists")
		return
	}
	httpx.WriteCreated(w, v)
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
		httpx.WriteInvalidInput(w, "department, name and code required")
		return
	}
	var d Department
	if c.db.First(&d, v.DepartmentID).Error != nil {
		httpx.WriteInvalidInput(w, "department not found")
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
			httpx.WriteConflict(w, "position code exists")
			return
		}
	} else if e := c.db.Create(&p).Error; e != nil {
		httpx.WriteConflict(w, "position code exists")
		return
	}
	httpx.WriteOK(w, p)
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
		httpx.WriteInvalidInput(w, "username, name and position required")
		return
	}
	if !validDateOrEmpty(v.HireDate) {
		httpx.WriteInvalidInput(w, "hire_date must be YYYY-MM-DD")
		return
	}
	var p Position
	if c.db.First(&p, v.PositionID).Error != nil {
		httpx.WriteInvalidInput(w, "position not found")
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
				httpx.WriteInternalError(w, "password hash failed")
				return
			}
			values["password_hash"] = string(h)
		}
		res := c.db.Model(&Account{}).Where("id=?", n).Updates(values)
		if res.Error != nil {
			httpx.WriteConflict(w, "account exists")
			return
		}
		if res.RowsAffected == 0 {
			httpx.WriteNotFound(w, "account not found")
			return
		}
		httpx.WriteOK(w, map[string]any{"id": n, "username": v.Username, "name": v.Name, "phone": v.Phone, "email": v.Email, "employee_no": v.EmployeeNo, "hire_date": v.HireDate, "position_id": v.PositionID, "position_name": p.Name, "status": v.Status})
		return
	}
	if v.Password == "" {
		httpx.WriteInvalidInput(w, "password required")
		return
	}
	h, e := bcrypt.GenerateFromPassword([]byte(v.Password), bcrypt.DefaultCost)
	if e != nil {
		httpx.WriteInternalError(w, "password hash failed")
		return
	}
	a := Account{Username: v.Username, PasswordHash: string(h), Name: v.Name, Phone: v.Phone, Email: v.Email, EmployeeNo: v.EmployeeNo, HireDate: v.HireDate, PositionID: v.PositionID, Status: v.Status}
	if e := c.db.Create(&a).Error; e != nil {
		httpx.WriteConflict(w, "account exists")
		return
	}
	a.PositionName = p.Name
	httpx.WriteCreated(w, a)
}
func (c *Controller) Delete(w http.ResponseWriter, r *http.Request) {
	n, ok := id(r)
	if !ok {
		httpx.WriteInvalidInput(w, "invalid id")
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
			httpx.WriteConflict(w, "position assigned to accounts")
			return
		}
		e = c.db.Delete(&Position{}, n).Error
	case strings.Contains(path, "staff-department"):
		var count int64
		c.db.Model(&Position{}).Where("department_id=?", n).Count(&count)
		if count > 0 {
			httpx.WriteConflict(w, "department has positions")
			return
		}
		e = c.db.Delete(&Department{}, n).Error
	}
	if e != nil {
		httpx.WriteInternalError(w, "delete failed")
		return
	}
	httpx.WriteOK(w, map[string]bool{"success": true})
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
