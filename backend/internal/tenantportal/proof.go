package tenantportal

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math"
	"net/http"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	paymentrepo "backend/internal/payment/repository"
	"backend/internal/pkg/httpx"
	"backend/internal/pkg/response"
	"backend/internal/pkg/storage"
)

// proofPresignTTL is how long a payment proof image link stays valid.
const proofPresignTTL = time.Hour

const maxReferenceLength = 100

var proofExtensions = map[string]string{
	"image/jpeg": ".jpg",
	"image/png":  ".png",
	"image/webp": ".webp",
}

// presignProof sets FileURL to a short-lived link, or clears it when storage is unavailable.
func (c *Controller) presignProof(p *paymentrepo.PaymentProof) {
	p.FileURL = ""
	if c.store == nil || p.FileKey == "" {
		return
	}
	if link, err := c.store.Presign(p.FileKey, proofPresignTTL); err == nil {
		p.FileURL = link
	}
}

func writeProofError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, paymentrepo.ErrBillNotFound):
		httpx.WriteNotFound(w, "bill not found")
	case errors.Is(err, paymentrepo.ErrBillNotPayable):
		httpx.WriteConflict(w, "bill is already settled or void")
	case errors.Is(err, paymentrepo.ErrInvalidAmount):
		httpx.WriteInvalidInput(w, "amount must be above zero and no more than the outstanding balance")
	case errors.Is(err, paymentrepo.ErrProofAlreadyOpen):
		httpx.WriteConflict(w, "a payment proof for this bill is already awaiting review")
	default:
		httpx.WriteInternalError(w, "failed to save payment proof")
	}
}

// ProofCreate accepts a multipart submission (bill_id, amount, paid_at, reference, file) for one of the
// tenant's own bills. Validation runs before the upload, and again inside the insert transaction.
func (c *Controller) ProofCreate(w http.ResponseWriter, r *http.Request) {
	tenantID, err := c.currentTenantID(r)
	if err != nil {
		httpx.WriteNotFound(w, "no tenant profile is linked to this account")
		return
	}
	if c.store == nil {
		httpx.WriteServiceUnavailable(w, "file storage is not configured")
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, storage.MaxObjectSize+(1<<20))
	if err := r.ParseMultipartForm(storage.MaxObjectSize); err != nil {
		httpx.WriteInvalidInput(w, "invalid form or file too large")
		return
	}

	billID, err := strconv.ParseUint(strings.TrimSpace(r.FormValue("bill_id")), 10, 64)
	if err != nil || billID == 0 {
		httpx.WriteInvalidInput(w, "bill_id is required")
		return
	}
	amount, err := strconv.ParseFloat(strings.TrimSpace(r.FormValue("amount")), 64)
	if err != nil || math.IsNaN(amount) || math.IsInf(amount, 0) {
		httpx.WriteInvalidInput(w, "amount must be a number")
		return
	}
	paidAt := strings.TrimSpace(r.FormValue("paid_at"))
	if _, err := time.Parse("2006-01-02", paidAt); err != nil {
		httpx.WriteInvalidInput(w, "paid_at must be YYYY-MM-DD")
		return
	}
	reference := strings.TrimSpace(r.FormValue("reference"))
	if utf8.RuneCountInString(reference) > maxReferenceLength {
		httpx.WriteInvalidInput(w, "reference is too long")
		return
	}

	file, _, err := r.FormFile("file")
	if err != nil {
		httpx.WriteInvalidInput(w, "file is required")
		return
	}
	defer file.Close()
	data, err := io.ReadAll(io.LimitReader(file, storage.MaxObjectSize+1))
	if err != nil {
		httpx.WriteInvalidInput(w, "failed to read file")
		return
	}
	if len(data) > storage.MaxObjectSize {
		httpx.WriteInvalidInput(w, "file exceeds 10 MiB")
		return
	}
	contentType := http.DetectContentType(data)
	ext, ok := proofExtensions[contentType]
	if !ok {
		httpx.WriteInvalidInput(w, "only JPEG, PNG and WebP images are accepted")
		return
	}

	if err := c.payments.ValidateTenantProof(tenantID, uint(billID), amount); err != nil {
		writeProofError(w, err)
		return
	}

	key := fmt.Sprintf("payment-proofs/%d/%d%s", tenantID, time.Now().UnixNano(), ext)
	fileURL, err := c.store.Put(r.Context(), key, contentType, bytes.NewReader(data))
	if errors.Is(err, storage.ErrNotConfigured) {
		httpx.WriteServiceUnavailable(w, "file storage is not configured")
		return
	}
	if err != nil {
		httpx.WriteInternalError(w, "failed to upload file")
		return
	}

	proof := &paymentrepo.PaymentProof{
		BillID:    uint(billID),
		TenantID:  tenantID,
		Amount:    amount,
		PaidAt:    paidAt,
		Reference: reference,
		FileKey:   key,
		FileURL:   fileURL,
		Status:    "pending",
	}
	if err := c.payments.CreateTenantProof(proof); err != nil {
		writeProofError(w, err)
		return
	}
	c.presignProof(proof)
	httpx.WriteOK(w, proof)
}

// ProofList returns the tenant's own payment proofs, newest first, with fresh image links.
func (c *Controller) ProofList(w http.ResponseWriter, r *http.Request) {
	tenantID, err := c.currentTenantID(r)
	if err != nil {
		httpx.WriteNotFound(w, "no tenant profile is linked to this account")
		return
	}
	var req tenantListRequest
	if json.NewDecoder(r.Body).Decode(&req) != nil {
		httpx.WriteInvalidInput(w, "invalid request body")
		return
	}
	rows, err := c.payments.ListTenantProofs(tenantID)
	if err != nil {
		httpx.WriteInternalError(w, "failed to load payment proofs")
		return
	}
	status := strings.TrimSpace(req.Status)
	filtered := make([]paymentrepo.PaymentProof, 0)
	for _, p := range rows {
		if status != "" && p.Status != status {
			continue
		}
		filtered = append(filtered, p)
	}
	page, perPage := httpx.NormalizePagination(req.CurrentPage, req.PerPage)
	pageRows := paginate(filtered, page, perPage)
	for i := range pageRows {
		c.presignProof(&pageRows[i])
	}
	httpx.WriteOK(w, response.NewListData(pageRows, page, perPage, int64(len(filtered))))
}
