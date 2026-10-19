package main

import (
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
	dictionarydelivery "backend/internal/dictionary/delivery"
	dictionaryrepository "backend/internal/dictionary/repository"
	dictionaryusecase "backend/internal/dictionary/usecase"
	"backend/internal/pkg/database"
	propertydelivery "backend/internal/property/delivery"
	propertyrepository "backend/internal/property/repository"
	propertyusecase "backend/internal/property/usecase"
	tenantdelivery "backend/internal/tenant/delivery"
	tenantrepository "backend/internal/tenant/repository"
	"backend/internal/tenantportal"
	tenantusecase "backend/internal/tenant/usecase"
	"backend/internal/user/delivery"
	"backend/internal/user/repository"
	"backend/internal/user/usecase"
)

func main() {
	if err := godotenv.Load(); err != nil {
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

	log.Printf("API server listening on %s", serverAddress)
	log.Fatal(http.ListenAndServe(serverAddress, mux))
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
