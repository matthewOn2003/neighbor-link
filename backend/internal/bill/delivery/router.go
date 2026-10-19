package delivery

import (
 "net/http"
 "backend/internal/pkg/middleware"
 userdelivery "backend/internal/user/delivery"
)
func NewBillRouter(c *BillController,secret string,origins []string)http.Handler{
 m:=http.NewServeMux();admin:=middleware.RequireRole(secret,userdelivery.VerifyToken,"admin")
 m.HandleFunc("POST /api/v1/bill/list",admin(c.List))
 m.HandleFunc("POST /api/v1/bill/detail/{id}",admin(c.Detail))
 m.HandleFunc("POST /api/v1/bill/create",admin(c.Create))
 m.HandleFunc("POST /api/v1/bill/generate",admin(c.Generate))
 m.HandleFunc("POST /api/v1/bill/payment/{id}",admin(c.Payment))
 m.HandleFunc("POST /api/v1/bill/void/{id}",admin(c.Void))
 m.HandleFunc("POST /api/v1/bill/active-contracts",admin(c.ActiveContracts))
 return middleware.WithCORS(m,origins)
}
