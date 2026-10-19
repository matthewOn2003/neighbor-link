package delivery
import("net/http";"backend/internal/pkg/middleware";userdelivery "backend/internal/user/delivery")
func NewContractRouter(c *ContractController,secret string,origins []string)http.Handler{m:=http.NewServeMux();admin:=middleware.RequireRole(secret,userdelivery.VerifyToken,"admin");m.HandleFunc("POST /api/v1/contract/list",admin(c.List));m.HandleFunc("POST /api/v1/contract/detail/{id}",admin(c.Detail));m.HandleFunc("POST /api/v1/contract/create",admin(c.Create));m.HandleFunc("POST /api/v1/contract/update/{id}",admin(c.Update));return middleware.WithCORS(m,origins)}
