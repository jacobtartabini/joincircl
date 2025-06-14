
import React from "react";
import { CONTACT_FIELD_DEFS } from "@/services/csvFieldDefs";

interface CSVPreviewTableProps {
  previewRows: any[];
  fileData: any[];
  headerMap: { [target: string]: string };
  maxCols?: number;
}

export function CSVPreviewTable({ previewRows, fileData, headerMap, maxCols = 5 }: CSVPreviewTableProps) {
  // Show only mapped fields
  const allMapped = CONTACT_FIELD_DEFS.filter(f => f.key !== "user_id" && headerMap[f.label]);
  const shownFields = allMapped.slice(0, maxCols);
  const hiddenFields = allMapped.slice(maxCols);

  return (
    <div className="relative overflow-x-auto rounded-lg border bg-white/80 mt-2 max-h-[220px]">
      <table className="w-full text-xs" aria-label="CSV preview table">
        <thead className="bg-blue-50 sticky top-0 z-0">
          <tr>
            {shownFields.map(({ label }) =>
              <th key={label} className="p-2 font-semibold">{label}</th>
            )}
            {hiddenFields.length > 0 && <th className="p-2 font-semibold text-gray-400">…</th>}
          </tr>
        </thead>
        <tbody>
          {previewRows.map((row, i) =>
            <tr key={i} className="border-b last:border-0">
              {shownFields.map(field =>
                <td key={field.label} className="p-2 truncate max-w-[160px]">{row[headerMap[field.label]] || ""}</td>
              )}
              {hiddenFields.length > 0 &&
                <td className="p-2 text-gray-400 align-middle">…</td>}
            </tr>
          )}
        </tbody>
      </table>
      {hiddenFields.length > 0 &&
        <div className="absolute right-0 top-1 bg-white/90 rounded px-2 py-0.5 text-xs text-gray-500 z-10 border">
          +{hiddenFields.length} more columns
        </div>}
      {shownFields.length === 0 &&
        <div className="p-8 text-center text-gray-400">No mapped fields to preview</div>
      }
    </div>
  );
}
