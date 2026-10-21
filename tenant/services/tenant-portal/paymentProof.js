import { defineApi } from "../defineApi";
import { ApiError } from "../request";

export const paymentProofList = defineApi({ path: "/tenant-portal/payment-proof/list" });

/** 提交付款凭证（multipart）。成功返回新建凭证，失败抛 ApiError。 */
export async function createPaymentProof({ bill_id, amount, paid_at, reference, file }) {
  const form = new FormData();
  form.append("bill_id", String(bill_id));
  form.append("amount", String(amount));
  form.append("paid_at", paid_at);
  form.append("reference", reference ?? "");
  form.append("file", file);
  const res = await fetch("/api/tenant-portal/payment-proof/create", {
    method: "POST",
    credentials: "include",
    body: form,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError({
      status: res.status,
      code: data?.error?.code ?? "UNKNOWN",
      message: data?.error?.message ?? `HTTP ${res.status}`,
    });
  }
  return data?.data ?? null;
}
