package delivery

import (
	"encoding/json"
	"errors"
	"fmt"

	"gorm.io/gorm"
)

// rootPermissionIDs mirrors the permission tree rendered by the admin Users page
// (module nodes plus one perm-<module>-<action> leaf per action).
var rootPermissionIDs = buildRootPermissionIDs()

func buildRootPermissionIDs() []string {
	modules := []struct {
		id      string
		actions []string
	}{
		{"dashboard", []string{"list"}},
		{"properties", []string{"list", "add", "update", "delete"}},
		{"tenant", []string{"list", "add", "update", "delete"}},
		{"contracts", []string{"list", "add", "update", "delete"}},
		{"bills", []string{"list", "add", "update", "delete"}},
		{"users", []string{"list", "add", "update", "delete"}},
	}
	ids := []string{"root"}
	for _, m := range modules {
		ids = append(ids, m.id)
		for _, a := range m.actions {
			ids = append(ids, fmt.Sprintf("perm-%s-%s", m.id, a))
		}
	}
	return ids
}

// SeedRootAdmin makes sure the login account `username` (auth_users) also exists as a staff account,
// so it shows up on the Users page. It creates a "Management" department and a "Root Admin" position
// holding every permission, and reuses the password hash of the auth user so the two stay in sync.
// It is idempotent: if a staff account with that username already exists, nothing is changed.
func SeedRootAdmin(db *gorm.DB, username string) error {
	var authUser struct {
		PasswordHash string
	}
	if err := db.Table("auth_users").
		Select("password_hash").
		Where("username = ? AND role = ?", username, "admin").
		Limit(1).
		Scan(&authUser).Error; err != nil {
		return fmt.Errorf("read auth user %q: %w", username, err)
	}
	authHash := authUser.PasswordHash
	if authHash == "" {
		return errors.New("auth user for root admin not found")
	}

	return db.Transaction(func(tx *gorm.DB) error {
		var existing int64
		if err := tx.Model(&Account{}).Where("username = ?", username).Count(&existing).Error; err != nil {
			return err
		}
		if existing > 0 {
			return nil
		}

		dept := Department{
			Name:        "管理部门",
			Code:        "management",
			Description: "Property management and administration",
			Status:      "active",
		}
		if err := tx.Where("code = ?", dept.Code).FirstOrCreate(&dept).Error; err != nil {
			return fmt.Errorf("seed management department: %w", err)
		}

		permJSON, err := json.Marshal(rootPermissionIDs)
		if err != nil {
			return err
		}
		pos := Position{
			DepartmentID:  dept.ID,
			Name:          "Root Admin",
			Code:          "root_admin",
			Description:   "Full access to every admin module",
			PermissionIDs: string(permJSON),
			Status:        "active",
		}
		if err := tx.Where("code = ?", pos.Code).FirstOrCreate(&pos).Error; err != nil {
			return fmt.Errorf("seed root admin position: %w", err)
		}

		account := Account{
			Username:     username,
			PasswordHash: authHash,
			Name:         "System Administrator",
			PositionID:   pos.ID,
			Status:       "active",
		}
		if err := tx.Create(&account).Error; err != nil {
			return fmt.Errorf("seed root admin account: %w", err)
		}
		return nil
	})
}
