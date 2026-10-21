// Display helpers shared by the portal screens. Values always come from the API.

/** 2026-10-19 or 2026-10-19 10:30:00 -> "Oct 19, 2026" (English) or "2026年10月19日" (Chinese). */
export function formatDate(value, locale) {
  if (!value) return "";
  const raw = String(value).replace(" ", "T");
  const date = new Date(raw.length === 10 ? `${raw}T00:00:00+08:00` : raw);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: locale === "zh" ? "long" : "short",
    day: "numeric",
    timeZone: "Asia/Kuala_Lumpur",
  });
}

/** 2026-10-19 10:30:00 -> "Oct 19, 2026 · 10:30" */
export function formatDateTime(value, locale) {
  if (!value) return "";
  const date = new Date(String(value).replace(" ", "T").replace(/Z?$/, "+08:00"));
  if (Number.isNaN(date.getTime())) return String(value);
  const day = formatDate(value.slice(0, 10), locale);
  const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kuala_Lumpur" }).format(date);
  return `${day} · ${time}`;
}

export function formatBytes(bytes) {
  const n = Number(bytes) || 0;
  if (n <= 0) return "";
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

/** Billing period "2026-10" -> "10" (the month box on bill cards). */
export function monthOf(period) {
  return String(period ?? "").split("-")[1] ?? "";
}

/** Today's date in Malaysia as YYYY-MM-DD, for the paid-date default. */
export function todayKL() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kuala_Lumpur", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

/** English ordinal for a day of month: 1st, 2nd, 3rd, 22nd. */
export function ordinal(day) {
  const n = Number(day);
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}
