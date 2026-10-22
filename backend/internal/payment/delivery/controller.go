package delivery

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	billrepo "backend/internal/bill/repository"
	"backend/internal/payment/repository"
	"backend/internal/payment/usecase"
	"backend/internal/pkg/httpx"
	"backend/internal/pkg/middleware"
	"backend/internal/pkg/response"
	"backend/internal/pkg/storage"
	userdelivery "backend/internal/user/delivery"
)

// proofPresignTTL is how long a payment proof image link stays valid.
const proofPresignTTL = time.Hour

type PaymentController struct {
	uc     *usecase.PaymentUsecase
	secret string
	store  storage.Uploader
}

func NewPaymentController(uc *usecase.PaymentUsecase, tokenSecret string) *PaymentController {
	return &PaymentController{uc: uc, secret: tokenSecret}
}

// WithStorage attaches object storage used to generate proof image links.
func (c *PaymentController) WithStorage(u storage.Uploader) *PaymentController {
	c.store = u
	return c
}

// fillProofURLs replaces file_url with a short-lived presigned link. Without storage the link stays empty,
// because the bucket is private and the stored value is not readable.
func (c *PaymentController) fillProofURLs(rows []repository.ProofListItem) {
	for i := range rows {
		rows[i].FileURL = ""
		if c.store == nil || rows[i].FileKey == "" {
			continue
		}
		link, err := c.store.Presign(rows[i].FileKey, proofPresignTTL)
		if err == nil {
			rows[i].FileURL = link
		}
	}
}

// filterRequest is shared by the proof and payment list endpoints. IDs and amounts are sent as strings,
// matching the other list endpoints; empty means no filter.
type filterRequest struct {
	CurrentPage int    `json:"current_page"`
	PerPage     int    `json:"per_page"`
	Keyword     string `json:"keyword"`
	Status      string `json:"status"`
	PropertyID  string `json:"property_id"`
	BlockID     string `json:"block_id"`
	UnitID      string `json:"unit_id"`
	PaidFrom    string `json:"paid_from"`
	PaidTo      string `json:"paid_to"`
	AmountMin   string `json:"amount_min"`
	AmountMax   string `json:"amount_max"`
}

func parseOptionalFloat(raw string) (*float64, error) {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return nil, nil
	}
	value, err := strconv.ParseFloat(raw, 64)
	if err != nil {
		return nil, err
	}
	return &value, nil
}

// buildFilter converts a request into a repository filter. It returns a message describing the first invalid field.
func buildFilter(req filterRequest) (repository.ProofFilter, string) {
	propertyID, err := httpx.ParseOptionalID(req.PropertyID)
	if err != nil {
		return repository.ProofFilter{}, "invalid property_id"
	}
	blockID, err := httpx.ParseOptionalID(req.BlockID)
	if err != nil {
		return repository.ProofFilter{}, "invalid block_id"
	}
	unitID, err := httpx.ParseOptionalID(req.UnitID)
	if err != nil {
		return repository.ProofFilter{}, "invalid unit_id"
	}
	amountMin, err := parseOptionalFloat(req.AmountMin)
	if err != nil {
		return repository.ProofFilter{}, "invalid amount_min"
	}
	amountMax, err := parseOptionalFloat(req.AmountMax)
	if err != nil {
		return repository.ProofFilter{}, "invalid amount_max"
	}
	return repository.ProofFilter{
		Keyword:    strings.TrimSpace(req.Keyword),
		Status:     strings.TrimSpace(req.Status),
		PropertyID: propertyID,
		BlockID:    blockID,
		UnitID:     unitID,
		PaidFrom:   strings.TrimSpace(req.PaidFrom),
		PaidTo:     strings.TrimSpace(req.PaidTo),
		AmountMin:  amountMin,
		AmountMax:  amountMax,
	}, ""
}

func (c *PaymentController) ProofList(w http.ResponseWriter, r *http.Request) {
	var req filterRequest
	if json.NewDecoder(r.Body).Decode(&req) != nil {
		httpx.WriteInvalidInput(w, "invalid request body")
		return
	}
	switch req.Status {
	case "", "pending", "approved", "rejected":
	default:
		httpx.WriteInvalidInput(w, "invalid status")
		return
	}
	filter, msg := buildFilter(req)
	if msg != "" {
		httpx.WriteInvalidInput(w, msg)
		return
	}
	if err := usecase.ValidateFilter(filter); err != nil {
		httpx.WriteInvalidInput(w, "check paid_from, paid_to and amount range")
		return
	}
	page, perPage := httpx.NormalizePagination(req.CurrentPage, req.PerPage)
	rows, total, err := c.uc.ListProofs(filter, page, perPage)
	if err != nil {
		httpx.WriteInternalError(w, "failed to list payment proofs")
		return
	}
	c.fillProofURLs(rows)
	httpx.WriteOK(w, response.NewListData(rows, page, perPage, total))
}

func (c *PaymentController) PaymentList(w http.ResponseWriter, r *http.Request) {
	var req filterRequest
	if json.NewDecoder(r.Body).Decode(&req) != nil {
		httpx.WriteInvalidInput(w, "invalid request body")
		return
	}
	filter, msg := buildFilter(req)
	if msg != "" {
		httpx.WriteInvalidInput(w, msg)
		return
	}
	if err := usecase.ValidateFilter(filter); err != nil {
		httpx.WriteInvalidInput(w, "check paid_from, paid_to and amount range")
		return
	}
	page, perPage := httpx.NormalizePagination(req.CurrentPage, req.PerPage)
	rows, total, err := c.uc.ListPayments(filter, page, perPage)
	if err != nil {
		httpx.WriteInternalError(w, "failed to list payments")
		return
	}
	httpx.WriteOK(w, response.NewListData(rows, page, perPage, total))
}

// reviewer returns the username of the signed-in admin, or "admin" if the token cannot be read.
func (c *PaymentController) reviewer(r *http.Request) string {
	cookie, err := r.Cookie(middleware.AuthCookieName)
	if err != nil {
		return "admin"
	}
	username, _, ok := userdelivery.VerifyToken(cookie.Value, c.secret)
	if !ok || username == "" {
		return "admin"
	}
	return username
}

func writeProofError(w http.ResponseWriter, err error, action string) {
	switch {
	case errors.Is(err, repository.ErrProofNotFound):
		httpx.WriteNotFound(w, "payment proof not found")
	case errors.Is(err, repository.ErrProofNotPending):
		httpx.WriteConflict(w, "only pending payment proofs can be reviewed")
	case errors.Is(err, billrepo.ErrNotFound):
		httpx.WriteNotFound(w, "bill not found")
	case errors.Is(err, billrepo.ErrAlreadyVoided):
		httpx.WriteConflict(w, "void bills cannot receive payments")
	case errors.Is(err, billrepo.ErrInvalidBill):
		httpx.WriteInvalidInput(w, "proof amount exceeds the outstanding balance")
	case errors.Is(err, usecase.ErrInvalidInput):
		httpx.WriteInvalidInput(w, "reject reason is required")
	default:
		httpx.WriteInternalError(w, "failed to "+action+" payment proof")
	}
}

func (c *PaymentController) Approve(w http.ResponseWriter, r *http.Request) {
	id, err := httpx.ParseIDParam(r)
	if err != nil {
		httpx.WriteInvalidInput(w, "invalid id")
		return
	}
	proof, err := c.uc.Approve(id, c.reviewer(r))
	if err != nil {
		writeProofError(w, err, "approve")
		return
	}
	httpx.WriteOK(w, proof)
}

type rejectRequest struct {
	Reason string `json:"reason"`
}

func (c *PaymentController) Reject(w http.ResponseWriter, r *http.Request) {
	id, err := httpx.ParseIDParam(r)
	if err != nil {
		httpx.WriteInvalidInput(w, "invalid id")
		return
	}
	var req rejectRequest
	if json.NewDecoder(r.Body).Decode(&req) != nil {
		httpx.WriteInvalidInput(w, "invalid request body")
		return
	}
	proof, err := c.uc.Reject(id, c.reviewer(r), req.Reason)
	if err != nil {
		writeProofError(w, err, "reject")
		return
	}
	httpx.WriteOK(w, proof)
}
