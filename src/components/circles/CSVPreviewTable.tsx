
import React from "react";
import { CONTACT_FIELD_DEFS } from "@/services/csvFieldDefs";
import { parseMultipleEmails } from "@/services/emailParser";

interface CSVPreviewTableProps {
  previewRows: any[];
  fileData: any[];
  headerMap: { [target: string]: string };
  maxCols?: number;
}

export function CSVPreviewTable({ previewRows, fileData, headerMap, maxCols = 6 }: CSVPreviewTableProps) {
  // Show only mapped fields
  const allMapped = CONTACT_FIELD_DEFS.filter(f => f.key !== "user_id" && headerMap[f.label]);
  const shownFields = allMapped.slice(0, maxCols);
  const hiddenFields = allMapped.slice(maxCols);

  if (shownFields.length === 0) {
    return (
      <div className="glass-card border border-white/30 rounded-xl p-12 text-center">
        <div className="text-muted-foreground">
          No mapped fields to preview. Please map at least one column above.
        </div>
      </div>
    );
  }

  const renderCellContent = (row: any, field: any) => {
    const rawValue = row[headerMap[field.label]];
    
    if (!rawValue) {
      return <span className="text-muted-foreground italic">—</span>;
    }

    // Special handling for emails field to show parsed results
    if (field.type === "emails") {
      const parsedEmails = parseMultipleEmails(rawValue);
      if (parsedEmails.length > 1) {
        return (
          <div className="space-y-1">
            {parsedEmails.slice(0, 2).map((parsed, idx) => (
              <div key={idx} className="text-xs">
                <span className="truncate">{parsed.email}</span>
                {parsed.type !== 'other' && (
                  <span className="ml-1 text-muted-foreground">({parsed.type})</span>
                )}
              </div>
            ))}
            {parsedEmails.length > 2 && (
              <div className="text-xs text-muted-foreground">
                +{parsedEmails.length - 2} more
              </div>
            )}
          </div>
        );
      } else if (parsedEmails.length === 1) {
        return (
          <div className="text-sm">
            <span className="truncate">{parsedEmails[0].email}</span>
            {parsedEmails[0].type !== 'other' && (
              <span className="ml-1 text-xs text-muted-foreground">({parsedEmails[0].type})</span>
            )}
          </div>
        );
      }
    }

    return <span className="truncate">{rawValue}</span>;
  };

  return (
    <div className="glass-card border border-white/30 rounded-xl overflow-hidden">
      <div className="overflow-x-auto max-h-80">
        <table className="w-full" aria-label="CSV preview table">
          <thead className="bg-white/20 backdrop-blur-sm sticky top-0 z-10">
            <tr>
              {shownFields.map(({ label, type }) => (
                <th key={label} className="px-4 py-3 text-left text-sm font-semibold text-foreground border-b border-white/20">
                  <div className="flex flex-col">
                    <span>{label}</span>
                    {type === 'emails' && (
                      <span className="text-xs font-normal text-muted-foreground">
                        (parsed)
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {hiddenFields.length > 0 && (
                <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground border-b border-white/20">
                  +{hiddenFields.length} more
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {previewRows.map((row, i) => (
              <tr key={i} className="hover:bg-white/10 transition-colors border-b border-white/10 last:border-0">
                {shownFields.map(field => (
                  <td key={field.label} className="px-4 py-3 text-sm text-foreground max-w-[200px]">
                    {renderCellContent(row, field)}
                  </td>
                ))}
                {hiddenFields.length > 0 && (
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    <span className="text-xs">…</span>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {hiddenFields.length > 0 && (
        <div className="bg-white/10 px-4 py-2 border-t border-white/20">
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">{hiddenFields.length} additional columns:</span>{" "}
            {hiddenFields.map(f => f.label).join(", ")}
          </div>
        </div>
      )}
    </div>
  );
}
