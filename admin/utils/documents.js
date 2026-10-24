import { buildSimplePdf } from "@/utils/pdf";
import { formatRef } from "@/utils/format";
import { todayISO } from "@/utils/date";

// PDF 里只能用内置字体（Latin），所以这里的标签和值统一用英文。

export const pdfMoney = (value) => "RM " + (Number(value) || 0).toFixed(2);

const billPdfStatus = {
  unpaid: "Unpaid",
  overdue: "Overdue",
  paid: "Paid",
  void: "Void",
  pending_review: "Pending review",
};

const contractPdfStatus = {
  draft: "Draft",
  active: "Active",
  expired: "Expired",
  terminated: "Terminated",
};

export function billRef(id) {
  return formatRef("BL", id);
}

export function contractRef(id) {
  return formatRef("CT", id);
}

export function buildInvoicePdf(bill) {
  const total = Number(bill.amount) + Number(bill.late_fee);
  return buildSimplePdf({
    title: "Invoice",
    subtitle: billRef(bill.id),
    sections: [
      {
        heading: "Bill",
        rows: [
          ["Invoice reference", billRef(bill.id)],
          ["Tenant", bill.tenant_name],
          ["Unit", bill.unit_code],
          ["Property", bill.property_name],
          ["Billing period", bill.billing_period],
          ["Due date", bill.due_date],
          ["Status", billPdfStatus[bill.display_status ?? bill.status] ?? bill.status],
        ],
      },
      {
        heading: "Amount",
        rows: [
          ["Amount", pdfMoney(bill.amount)],
          ["Late fee", pdfMoney(bill.late_fee)],
          ["Total", pdfMoney(total)],
        ],
      },
    ],
    footer: "Generated " + todayISO(),
  });
}

// tenant 是 /tenant/detail 的返回值（用于邮箱），可能为 null。
export function buildContractSummaryPdf(contract, tenant) {
  return buildSimplePdf({
    title: "Lease Agreement Summary",
    subtitle: contractRef(contract.id),
    sections: [
      {
        heading: "Parties",
        rows: [
          ["Tenant name", contract.tenant_name],
          ["Tenant phone", tenant?.phone || contract.tenant_phone],
          ["Tenant email", tenant?.email],
        ],
      },
      {
        heading: "Property and unit",
        rows: [
          ["Property", contract.property_name],
          ["Unit", contract.unit_code],
        ],
      },
      {
        heading: "Term",
        rows: [
          ["Start date", contract.start_date],
          ["End date", contract.end_date],
          ["Billing day", contract.billing_day],
          ["Status", contractPdfStatus[contract.status] ?? contract.status],
        ],
      },
      {
        heading: "Financial",
        rows: [
          ["Monthly rent", pdfMoney(contract.monthly_rent)],
          ["Security deposit", pdfMoney(contract.security_deposit)],
        ],
      },
      { heading: "Notes", rows: [["Notes", contract.notes]] },
    ],
    footer: "Generated " + todayISO(),
  });
}
