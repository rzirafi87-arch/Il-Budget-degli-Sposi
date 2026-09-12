"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

interface GenericRecord { [key: string]: unknown }

type ExportButtonProps<T extends GenericRecord = GenericRecord> = {
  data: T[];
  filename: string;
  type: "csv" | "json";
  className?: string;
  children?: ReactNode;
};

export default function ExportButton<T extends GenericRecord = GenericRecord>({
  data,
  filename,
  type,
  className = "",
  children,
}: ExportButtonProps<T>) {
  const t = useTranslations("runtimeUi.shared");
  const handleExport = () => {
    if (type === "csv") {
      exportToCSV();
    } else {
      exportToJSON();
    }
  };

  const exportToCSV = () => {
    if (data.length === 0) {
      alert(t("noExportData"));
      return;
    }

    // Ottieni le intestazioni dalle chiavi del primo oggetto
    const headers = Object.keys(data[0]);

    // Crea le righe CSV
    const csvRows = [
      headers.join(","), // Intestazione
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            // Escape virgole e virgolette
            if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value ?? "";
          })
          .join(",")
      ),
    ];

    const csvContent = csvRows.join("\n");
    downloadFile(csvContent, `${filename}.csv`, "text/csv");
  };

  const exportToJSON = () => {
    if (data.length === 0) {
      alert(t("noExportData"));
      return;
    }

    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, `${filename}.json`, "application/json");
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className={`btn-secondary ${className}`}
      disabled={data.length === 0}
    >
      {children || t("export")}
    </button>
  );
}
