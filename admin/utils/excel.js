import * as XLSX from "xlsx";
import { apiRequest } from "@/utils/apiRequest";

// 导出用：把 rows 按 columns 生成 xlsx 并触发下载。
// columns: [{ label, get: (row) => value }]
export function downloadRowsAsXlsx(filename, columns, rows) {
  const header = columns.map((column) => column.label);
  const body = rows.map((row) => columns.map((column) => column.get(row) ?? ""));
  const sheet = XLSX.utils.aoa_to_sheet([header, ...body]);
  sheet["!cols"] = header.map((label, index) => ({
    wch: Math.max(label.length + 2, ...body.map((line) => String(line[index] ?? "").length + 2), 10),
  }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Data");
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

// 导入模板：表头 + 一行示例值。
export function downloadSampleXlsx(filename, columns) {
  const header = columns.map((column) => column.label);
  const sample = columns.map((column) => column.sample ?? "");
  const sheet = XLSX.utils.aoa_to_sheet([header, sample]);
  sheet["!cols"] = header.map((label) => ({ wch: Math.max(label.length + 4, 14) }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Template");
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

// 读取 xlsx/csv 第一张表，返回 { headers, rows }，rows 为按表头对象化后的数组。
export async function readSpreadsheet(file) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: false });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false, defval: "", raw: false });
  const [headers = [], ...lines] = matrix;
  const normalizedHeaders = headers.map((header) => String(header ?? "").trim());
  const rows = lines
    .filter((line) => line.some((cell) => String(cell ?? "").trim() !== ""))
    .map((line) =>
      Object.fromEntries(normalizedHeaders.map((header, index) => [header, String(line[index] ?? "").trim()])),
    );
  return { headers: normalizedHeaders, rows };
}

// 分页拉取所有匹配记录（后端 per_page 最大 100），用于导出。
export async function fetchAllRows(api, params, pageSize = 100) {
  const all = [];
  let page = 1;
  // 上限保护，防止异常接口导致死循环
  for (let guard = 0; guard < 1000; guard += 1) {
    const data = await apiRequest(api, { ...params, current_page: page, per_page: pageSize });
    const list = data?.list ?? [];
    const total = data?.pagination?.total ?? 0;
    all.push(...list);
    if (list.length === 0 || all.length >= total) break;
    page += 1;
  }
  return all;
}
