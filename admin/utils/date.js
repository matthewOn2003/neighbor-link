// lib/date.js

// 2026-09-29T15:49:27Z -> 2026-09-29 15:49:27
export function fdl(value) {
  if (!value) return "";
  return String(value).slice(0, 19).replace("T", " ");
}

// 2026-09-29T15:49:27Z -> 2026-09-29
export function fds(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}