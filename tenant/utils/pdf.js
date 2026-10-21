import { jsPDF } from "jspdf";

// 生成一个简单的文档：标题 + 若干分组，每组是 [label, value] 列表。
// 内置字体只支持 ASCII/拉丁字符；中文内容需要后续嵌入字体。
export function buildSimplePdf({ title, subtitle, sections = [], footer }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;
  let y = margin;

  const ensureSpace = (needed) => {
    if (y + needed > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(String(title ?? ""), margin, y);
  y += 8;

  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(110, 120, 115);
    doc.text(String(subtitle), margin, y);
    doc.setTextColor(0, 0, 0);
    y += 6;
  }

  y += 4;
  doc.setDrawColor(200, 210, 205);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  for (const section of sections) {
    ensureSpace(14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(String(section.heading ?? ""), margin, y);
    y += 6;

    for (const [label, value] of section.rows ?? []) {
      ensureSpace(7);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(String(label), margin, y);
      doc.setFont("helvetica", "normal");
      const text = value === null || value === undefined || value === "" ? "-" : String(value);
      const lines = doc.splitTextToSize(text, pageWidth - margin * 2 - 60);
      doc.text(lines, margin + 60, y);
      y += Math.max(6, lines.length * 5);
    }
    y += 4;
  }

  if (footer) {
    ensureSpace(10);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(110, 120, 115);
    doc.text(String(footer), margin, doc.internal.pageSize.getHeight() - 10);
  }

  return doc;
}
