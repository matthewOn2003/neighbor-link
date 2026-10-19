package usecase
import("time";"backend/internal/contract/repository";"backend/internal/pkg/httpx")
type ContractUsecase struct{repo *repository.SQLiteRepository}
func NewContractUsecase(r *repository.SQLiteRepository)*ContractUsecase{return &ContractUsecase{repo:r}}
func(u *ContractUsecase)List(f repository.ContractFilter,p,n int)([]repository.ContractListItem,int64,error){p,n=httpx.NormalizePagination(p,n);return u.repo.List(f,p,n)}
func(u *ContractUsecase)Detail(id uint)(*repository.ContractListItem,error){return u.repo.Detail(id)}
func(u *ContractUsecase)Save(c *repository.Contract)error{
 s,e:=time.Parse("2006-01-02",c.StartDate);if e!=nil{return repository.ErrInvalidContract};end,e:=time.Parse("2006-01-02",c.EndDate);if e!=nil||!end.After(s){return repository.ErrInvalidContract}
 if c.TenantID==0||c.MonthlyRent<0||c.SecurityDeposit<0||c.BillingDay<1||c.BillingDay>28{return repository.ErrInvalidContract}
 switch c.Status{case"draft","active","expired","terminated":default:return repository.ErrInvalidContract};return u.repo.Save(c)
}
