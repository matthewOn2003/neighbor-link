package usecase

import (
 "regexp"
 "strings"
 "time"

 "backend/internal/bill/repository"
 "backend/internal/pkg/httpx"
)

var periodPattern=regexp.MustCompile(`^\d{4}-(0[1-9]|1[0-2])$`)
var datePattern=regexp.MustCompile(`^\d{4}-\d{2}-\d{2}$`)
type BillUsecase struct{repo *repository.SQLiteRepository}
func NewBillUsecase(r *repository.SQLiteRepository)*BillUsecase{return &BillUsecase{repo:r}}
func (u *BillUsecase) List(f repository.BillFilter,p,n int)([]repository.BillListItem,int64,repository.BillSummary,error){p,n=httpx.NormalizePagination(p,n);return u.repo.List(f,p,n)}
func (u *BillUsecase) Detail(id uint)(*repository.BillListItem,error){return u.repo.Detail(id)}
func (u *BillUsecase) ActiveContracts()([]map[string]any,error){return u.repo.ActiveContracts()}
func (u *BillUsecase) Create(b *repository.Bill)error{
 if b.ContractID==0||!periodPattern.MatchString(b.BillingPeriod){return repository.ErrInvalidBill}
 if b.DueDate!=""{if !datePattern.MatchString(b.DueDate){return repository.ErrInvalidBill};if _,err:=time.Parse("2006-01-02",b.DueDate);err!=nil{return repository.ErrInvalidBill}}
 if b.Amount<0||b.LateFee<0{return repository.ErrInvalidBill}
 b.BillingPeriod=strings.TrimSpace(b.BillingPeriod)
 return u.repo.Create(b)
}
func (u *BillUsecase) RecordPayment(id uint,amount float64,method,reference,paidAt string)error{
 if amount<=0{return repository.ErrInvalidBill}
 if method!="cash"&&method!="bank_transfer"&&method!="online"&&method!="other"{return repository.ErrInvalidBill}
 if paidAt!=""{if _,err:=time.Parse("2006-01-02",paidAt);err!=nil{return repository.ErrInvalidBill}}
 return u.repo.RecordPayment(id,amount,method,strings.TrimSpace(reference),paidAt)
}
func (u *BillUsecase) Void(id uint)error{return u.repo.Void(id)}

func (u *BillUsecase) Generate(period string) (int64, error) {
 if !periodPattern.MatchString(period) { return 0, repository.ErrInvalidBill }
 return u.repo.Generate(period)
}
