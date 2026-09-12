"use client";
import jsPDF from "jspdf";
import { ReactNode } from "react";
import { useTranslations } from "next-intl";

export type ExportPDFButtonProps = {
  data: Array<{ [k: string]: unknown }>;
  filename: string;
  title?: string;
  subtitle?: string;
  className?: string;
  children?: ReactNode;
};

export default function ExportPDFButton({
  data,
  filename,
  title,
  subtitle = "",
  className = "",
  children,
}: ExportPDFButtonProps) {
  const t = useTranslations("budgetRuntime.exportPdf");
  const resolvedTitle = title || t("defaultTitle");
  const resolvedChildren = children || t("button");
  const handleExport = () => {
    if (!data || data.length === 0) {
      alert(t("empty"));
      return;
    }
    const doc = new jsPDF();
    let y = 15;
    doc.setFontSize(18);
    doc.text(resolvedTitle, 10, y);
    y += 8;
    if (subtitle) {
      doc.setFontSize(12);
      doc.text(subtitle, 10, y);
      y += 8;
    }
    doc.setFontSize(11);
    // Header
    const headers = Object.keys(data[0]);
  doc.setFont("helvetica", "bold");
    headers.forEach((h, i) => {
      doc.text(h, 10 + i * 40, y);
    });
  doc.setFont("helvetica", "normal");
    y += 7;
    // Rows
    data.forEach((row) => {
      headers.forEach((h, i) => {
        let value = row[h];
        if (typeof value === "boolean") value = value ? "✓" : "";
        doc.text(String(value ?? ""), 10 + i * 40, y);
      });
      y += 7;
      if (y > 270) {
        doc.addPage();
        y = 15;
      }
    });
    doc.save(`${filename}.pdf`);
  };
  return (
    <button type="button" className={className} onClick={handleExport}>
      {resolvedChildren}
    </button>
  );
}
