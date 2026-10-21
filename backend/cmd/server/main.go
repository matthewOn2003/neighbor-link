package main

import (
	"errors"
	"log"

	staffdelivery "backend/internal/staff/delivery"
	"net/http"
	"os"
	"strings"

	"github.com/joho/godotenv"

	billdelivery "backend/internal/bill/delivery"
	billrepository "backend/internal/bill/repository"
	billusecase "backend/internal/bill/usecase"
	contractdelivery "backend/internal/contract/delivery"
	contractrepository "backend/internal/contract/repository"
	contractusecase "backend/internal/contract/usecase"
	dashboarddelivery "backend/internal/dashboard/delivery"
	dashboardrepository "backend/internal/dashboard/repository"
	dashboardusecase "backend/internal/dashboard/usecase"
	dictionarydelivery "backend/internal/dictionary/delivery"
	dictionaryrepository "backend/internal/dictionary/repository"
	dictionaryusecase "backend/internal/dictionary/usecase"
	maintenancedelivery "backend/internal/maintenance/delivery"
	maintenancerepository "backend/internal/maintenance/repository"
	maintenanceusecase "backend/internal/maintenance/usecase"
	paymentdelivery "backend/internal/payment/delivery"
	paymentrepository "backend/internal/payment/repository"
	paymentusecase "backend/internal/payment/usecase"
	"backend/internal/pkg/database"
	"backend/internal/pkg/middleware"
	propertydelivery "backend/internal/property/delivery"
	propertyrepository "backend/internal/property/repository"
	propertyusecase "backend/internal/property/usecase"
	settingsdelivery "backend/internal/settings/delivery"
	settingsrepository "backend/internal/settings/repository"
	settingsusecase "backend/internal/settings/usecase"
	tenantdelivery "backend/internal/tenant/delivery"
	tenantrepository "backend/internal/tenant/repository"
	tenantusecase "backend/internal/tenant/usecase"
	"backend/internal/tenantportal"
	"backend/internal/user/delivery"
	"backend/internal/user/repository"
	"backend/internal/user/usecase"
)

func main() {
	// .env is optional: on Render the variables come from the platform environment.
	if err := godotenv.Load(); err != nil && !errors.Is(err, os.ErrNotExist) {
		log.Fatalf("加载 .env 失败: %v", err)
	}

	db, err := database.InitSQLite(requiredEnv("DB_PATH"))
	if err != nil {
		log.Fatalf("数据库初始化失败: %v", err)
	}

	migrationsDir := os.Getenv("MIGRATIONS_DIR")
	if migrationsDir == "" {
		migrationsDir = "migrations"
	}
	if err := database.RunMigrations(db, migrationsDir); err != nil {
		log.Fatalf("数据库迁移失败: %v", err)
	}

	userRepo, err := repository.NewSQLiteRepository(db)
	if err != nil {
		log.Fatalf("user 仓库初始化失败: %v", err)
	}
	userUsecase := usecase.NewUserUsecase(userRepo)

	adminPassword := requiredEnv("ADMIN_PASSWORD")
	tenantPassword := requiredEnv("TENANT_PASSWORD")
	if err := userUsecase.SeedUser("admin", adminPassword, "admin"); err != nil {
		log.Fatalf("初始化 admin 账号失败: %v", err)
	}
	if err := userUsecase.SeedUser("tenant", tenantPassword, "tenant"); err != nil {
		log.Fatalf("初始化 tenant 账号失败: %v", err)
	}
	if err := staffdelivery.SeedRootAdmin(db, "admin"); err != nil {
		log.Fatalf("初始化 admin 员工账号失败: %v", err)
	}

	// Demo contracts and bills are only seeded in explicitly configured development environments.
	// This runs after the accounts exist so the demo seed can link the "tenant" login to a tenant profile.
	if strings.EqualFold(strings.TrimSpace(os.Getenv("APP_ENV")), "development") {
		seedPath := strings.TrimSpace(os.Getenv("DEMO_SEED_PATH"))
		if seedPath == "" {
			seedPath = "seeds/demo_contracts_bills.sql"
		}
		if err := database.RunSQLFile(db, seedPath); err != nil {
			log.Fatalf("开发环境 demo 数据初始化失败: %v", err)
		}
	}

	propertyRepo, err := propertyrepository.NewSQLiteRepository(db)
	if err != nil {
		log.Fatalf("property 仓库初始化失败: %v", err)
	}
	propertyUsecase := propertyusecase.NewPropertyUsecase(propertyRepo)

	tenantRepo, err := tenantrepository.NewSQLiteRepository(db)
	if err != nil {
		log.Fatalf("tenant 仓库初始化失败: %v", err)
	}
	tenantUsecase := tenantusecase.NewTenantUsecase(tenantRepo, userUsecase)

	contractRepo := contractrepository.NewSQLiteRepository(db)
	contractUsecase := contractusecase.NewContractUsecase(contractRepo)

	billRepo := billrepository.NewSQLiteRepository(db)
	billUsecase := billusecase.NewBillUsecase(billRepo)

	dictionaryRepo, err := dictionaryrepository.NewSQLiteRepository(db)
	if err != nil {
		log.Fatalf("dictionary 仓库初始化失败: %v", err)
	}
	dictionaryUsecase := dictionaryusecase.NewDictionaryUsecase(dictionaryRepo)

	settingsUsecase := settingsusecase.NewSettingsUsecase(settingsrepository.NewSQLiteRepository(db))
	paymentUsecase := paymentusecase.NewPaymentUsecase(paymentrepository.NewSQLiteRepository(db))
	dashboardUsecase := dashboardusecase.NewDashboardUsecase(dashboardrepository.NewSQLiteRepository(db), billRepo)
	maintenanceUsecase := maintenanceusecase.NewMaintenanceUsecase(maintenancerepository.NewSQLiteRepository(db))

	serverAddress := requiredEnv("SERVER_ADDRESS")
	tokenSecret := requiredEnv("AUTH_SECRET")
	allowedOrigins := splitEnv(requiredEnv("CORS_ALLOWED_ORIGINS"))
	cookieSecure := strings.EqualFold(strings.TrimSpace(os.Getenv("COOKIE_SECURE")), "true")

	// Controllers
	userController := delivery.NewUserController(userUsecase, tokenSecret, cookieSecure)
	propertyController := propertydelivery.NewPropertyController(propertyUsecase)
	tenantController := tenantdelivery.NewTenantController(tenantUsecase)
	dictionaryController := dictionarydelivery.NewDictionaryController(dictionaryUsecase)
	staffController := staffdelivery.NewController(db)
	tenantPortalController := tenantportal.NewController(db, tokenSecret)
	contractController := contractdelivery.NewContractController(contractUsecase)
	billController := billdelivery.NewBillController(billUsecase)
	settingsController := settingsdelivery.NewSettingsController(settingsUsecase)
	paymentController := paymentdelivery.NewPaymentController(paymentUsecase, tokenSecret)
	dashboardController := dashboarddelivery.NewDashboardController(dashboardUsecase)
	maintenanceController := maintenancedelivery.NewMaintenanceController(maintenanceUsecase)

	// Routers
	mux := http.NewServeMux()
	mux.Handle("/", delivery.NewUserRouter(userController, tokenSecret, allowedOrigins))
	mux.Handle("/api/v1/property/", propertydelivery.NewPropertyRouter(propertyController, tokenSecret, allowedOrigins))
	mux.Handle("/api/v1/tenant/", tenantdelivery.NewTenantRouter(tenantController, tokenSecret, allowedOrigins))
	mux.Handle("/api/v1/contract/", contractdelivery.NewContractRouter(contractController, tokenSecret, allowedOrigins))
	mux.Handle("/api/v1/bill/", billdelivery.NewBillRouter(billController, tokenSecret, allowedOrigins))
	mux.Handle("/api/v1/dictionary/", dictionarydelivery.NewDictionaryRouter(dictionaryController, tokenSecret, allowedOrigins))
	mux.Handle("/api/v1/staff-account/", staffdelivery.NewRouter(staffController, tokenSecret, allowedOrigins))
	mux.Handle("/api/v1/staff-department/", staffdelivery.NewRouter(staffController, tokenSecret, allowedOrigins))
	mux.Handle("/api/v1/staff-position/", staffdelivery.NewRouter(staffController, tokenSecret, allowedOrigins))
	mux.Handle("/api/v1/tenant-portal/", tenantportal.NewRouter(tenantPortalController, tokenSecret, allowedOrigins))
	mux.Handle("/api/v1/billing-settings/", settingsdelivery.NewSettingsRouter(settingsController, tokenSecret, allowedOrigins))
	paymentRouter := paymentdelivery.NewPaymentRouter(paymentController, tokenSecret, allowedOrigins)
	mux.Handle("/api/v1/payment/", paymentRouter)
	mux.Handle("/api/v1/payment-proof/", paymentRouter)
	mux.Handle("/api/v1/dashboard/", dashboarddelivery.NewDashboardRouter(dashboardController, tokenSecret, allowedOrigins))
	mux.Handle("/api/v1/maintenance/", maintenancedelivery.NewMaintenanceRouter(maintenanceController, tokenSecret, allowedOrigins))
	// Reserved for the tenant portal, not implemented yet:
	//   /api/v1/tenant-portal/payment-proof/*
	//   /api/v1/tenant-portal/maintenance/*

	log.Printf("API server listening on %s", serverAddress)
	log.Fatal(http.ListenAndServe(serverAddress, middleware.Audit(mux, tokenSecret, delivery.VerifyToken)))
}

func requiredEnv(name string) string {
	value := strings.TrimSpace(os.Getenv(name))
	if value == "" {
		log.Fatalf("required environment variable %s is not set", name)
	}
	return value
}

func splitEnv(value string) []string {
	parts := strings.Split(value, ",")
	result := make([]string, 0, len(parts))
	for _, part := range parts {
		if trimmed := strings.TrimSpace(part); trimmed != "" {
			result = append(result, trimmed)
		}
	}
	return result
}
