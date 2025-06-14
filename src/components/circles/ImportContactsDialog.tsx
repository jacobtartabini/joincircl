
import React, { useRef, useState } from "react";
import Papa from "papaparse";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, FileUp, CheckCircle, ChevronDown, Trash2, Upload, Info } from "lucide-react";
import { Contact } from "@/types/contact";
import { validateCSVContacts, detectHeaders, getKeyByLabel, parseContactFromRow } from "@/services/csvImportService";
import { CONTACT_FIELD_DEFS, getExample } from "@/services/csvFieldDefs";
import { toast } from "sonner";
import { GlassModal } from "@/components/ui/GlassModal";
import styles from "@/components/ui/glass.module.css";

// Multi-template sample CSVs
const makeSampleCSV = (fields: string[]): string => {
  const rows = [
    fields.join(","),
    fields.map(f => getExample(CONTACT_FIELD_DEFS.find(fd => fd.label === f)?.type as any)).join(","),
    fields.map(f => getExample(CONTACT_FIELD_DEFS.find(fd => fd.label === f)?.type as any)).join(","),
  ];
  return rows.join("\n");
};

const BASIC_FIELDS = ["Name", "Email", "Phone", "Company", "Job Title"];
const COMPREHENSIVE_FIELDS = CONTACT_FIELD_DEFS.filter(f => f.key !== "user_id").map(f => f.label);

interface ImportContactsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess: (addedCount: number) => void;
  refetchContacts: () => void;
}

const Step = {
  Upload: 0,
  Map: 1,
  Confirm: 2
};

export default function ImportContactsDialog({
  open, onOpenChange, onImportSuccess, refetchContacts
}: ImportContactsDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileData, setFileData] = useState<any[]>([]);
  const [headerMap, setHeaderMap] = useState<{ [target: string]: string }>({});
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importResult, setImportResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [validationErr, setValidationErr] = useState<string | null>(null);

  function resetAll() {
    setFileName(null);
    setFileData([]);
    setHeaderMap({});
    setPreviewRows([]);
    setImportErrors([]);
    setImportResult(null);
    setLoading(false);
    setValidationErr(null);
    setStep(0);
  }

  // --- Step 1: File upload
  function handleFile(file: File) {
    setFileName(file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const { data, errors, meta } = results;
        if (errors && errors.length > 0) {
          setValidationErr("Unable to parse CSV. Check your file structure.");
          resetAll();
          return;
        }
        const filtered = data.filter((row: any) =>
          Object.values(row).some((v) => v && `${v}`.trim() !== "")
        );
        setFileData(filtered);
        setPreviewRows(filtered.slice(0, 8));
        setHeaderMap(detectHeaders(meta.fields || []));
        setValidationErr(null);
        setImportResult(null);
        setStep(1);
      },
    });
  }

  // --- Step 2: Mapping
  function updateMapping(target: string, source: string) {
    setHeaderMap((curr) => ({ ...curr, [target]: source }));
  }

  // --- Step 3: Import
  async function handleImport() {
    if (!fileData.length) {
      setValidationErr("No data to import.");
      return;
    }

    // Build contact objects based on mapping
    const contacts: Partial<Contact>[] = fileData.map((row) =>
      parseContactFromRow(row, headerMap)
    );

    // Client-side validation using dynamic headers (all fields)
    const { validContacts, errors } = validateCSVContacts(contacts, CONTACT_FIELD_DEFS);

    if (errors.length > 0) {
      setValidationErr(
        `Please fix errors before import:\n` +
        errors.map((err) => `Row ${err.row}: ${err.reason}`).join("\n")
      );
      return;
    }
    setLoading(true);
    setValidationErr(null);
    setImportResult(null);

    try {
      const resp = await fetch("/api/contacts/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts: validContacts }),
      });
      if (resp.ok) {
        const result = await resp.json();
        setImportResult(result);
        toast.success(`${result.successCount} contacts added`);
        if (result.successCount > 0) {
          refetchContacts();
          onImportSuccess(result.successCount);
        }
      } else {
        const err = await resp.json();
        setValidationErr(err.message || "Failed to import contacts.");
        setImportResult(null);
      }
    } catch (e) {
      setValidationErr("Network error or server unavailable.");
      setImportResult(null);
    }
    setLoading(false);
  }

  // --- Upload Section
  function FileUploadSection() {
    return (
      <div>
        <div
          className={`${styles["glass-upload"]} ${dragging ? styles.dragging : ""} flex flex-col items-center py-8 gap-3 transition cursor-pointer`}
          tabIndex={0}
          role="button"
          onClick={() => inputRef.current?.click()}
          onKeyDown={e => e.key === "Enter" && inputRef.current?.click()}
          onDrop={e => {
            e.preventDefault();
            e.stopPropagation();
            setDragging(false);
            if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
          }}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          aria-label="Drag and drop CSV file here, or click to browse"
        >
          <FileUp className="w-10 h-10 text-blue-500 mb-2" />
          <span className="font-semibold text-md">Drag & drop a CSV file here or <span className="underline text-blue-500">browse</span></span>
          <span className="text-xs text-gray-500 mb-1">Max 5,000 contacts • CSV only</span>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={e => {
              if (e.target.files?.[0]) handleFile(e.target.files[0]);
            }}
          />
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => {
            const blob = new Blob([makeSampleCSV(BASIC_FIELDS)], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "sample-basic-contacts.csv";
            a.click();
            URL.revokeObjectURL(url);
          }}>
            <Upload className="w-4 h-4 mr-1" />
            Download Basic Sample CSV
          </Button>
          <Button variant="secondary" size="sm" onClick={() => {
            const blob = new Blob([makeSampleCSV(COMPREHENSIVE_FIELDS)], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "sample-complete-contacts.csv";
            a.click();
            URL.revokeObjectURL(url);
          }}>
            <Upload className="w-4 h-4 mr-1" />
            Download Complete CSV
          </Button>
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="w-4 h-4" /> Use "Complete" for advanced/array fields!
          </span>
        </div>
        {validationErr &&
          <div className="text-red-700 mt-6 bg-red-50 border border-red-200 rounded-md p-3 text-xs">{validationErr}</div>
        }
      </div>
    );
  }

  // --- Mapping Section
  function ColumnMappingSection() {
    const uploadedHeaders = fileData.length > 0 && Object.keys(fileData[0]);
    const groups = Array.from(new Set(CONTACT_FIELD_DEFS.map(f => f.group)));

    return (
      <div>
        <div className={`${styles["glass-mapping"]} mb-6`}>
          <div className="font-semibold text-lg mb-2 flex items-center">
            Map your CSV columns
            <span className="ml-auto text-xs text-gray-500">{fileName}</span>
          </div>
          {/* Grouped mapping grid */}
          {groups.map(group => (
            <div key={group} className="mb-4">
              <div className="text-xs uppercase tracking-wide font-semibold text-blue-400 mb-2">{group} Fields</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {CONTACT_FIELD_DEFS.filter(f => f.group === group && f.key !== "user_id").map(field =>
                  <div key={field.label} className="flex flex-col">
                    <span className="text-sm font-medium mb-1 flex items-center">
                      {field.label}
                      {field.required && <span className="ml-1 text-red-500">*</span>}
                      <span className="ml-1 text-gray-400 text-xs">({field.key})</span>
                    </span>
                    <select
                      className="rounded-lg border border-gray-200 px-2 py-2 bg-white bg-opacity-70 focus:ring-2 focus:ring-blue-300"
                      value={headerMap[field.label] || ""}
                      onChange={e => updateMapping(field.label, e.target.value)}
                    >
                      <option value="">Unmapped</option>
                      {uploadedHeaders && uploadedHeaders.map((h: string) =>
                        <option key={h} value={h}>{h}</option>
                      )}
                    </select>
                    <span className="text-xs text-gray-400 mt-1">e.g. <span className="italic">{getExample(field.type)}</span></span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div>
          <span className="font-medium text-md">Preview ({previewRows.length} of {fileData.length} rows)</span>
          <div className="overflow-x-auto rounded-lg border bg-white bg-opacity-70 mt-2 max-h-[260px]">
            <table className="w-full text-xs">
              <thead className="bg-blue-50 sticky top-0 z-0">
                <tr>
                  {CONTACT_FIELD_DEFS.filter(f => f.key !== "user_id").map(({ label }) =>
                    <th key={label} className="p-2 font-semibold">{label}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, i) =>
                  <tr key={i} className="border-b last:border-0">
                    {CONTACT_FIELD_DEFS.filter(f => f.key !== "user_id").map((field) =>
                      <td key={field.label} className="p-2 truncate max-w-xs">
                        {row[headerMap[field.label]] || ""}
                      </td>
                    )}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {validationErr &&
          <div className="text-red-700 mt-5 bg-red-50 border border-red-200 rounded-md p-3 text-xs whitespace-pre-line">{validationErr}</div>
        }
      </div>
    );
  }

  // --- Confirm/Results Section
  function ConfirmImportSection() {
    return (
      <div>
        {importResult ?
          <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200">
            <div className="font-medium text-green-700 text-sm flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" /> {importResult.successCount} contacts imported.
            </div>
            {importResult.failed?.length > 0 && (
              <details className="mt-2 text-xs bg-red-50 border border-red-200 rounded px-3 py-2">
                <summary className="cursor-pointer font-medium mb-2">{importResult.failed.length} failed to import (expand)</summary>
                <ul>
                  {importResult.failed.map((fail: any, i: number) => (
                    <li key={i}>Row {fail.row}: {fail.reason}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
          : null
        }
        {validationErr &&
          <div className="text-red-700 mb-4 bg-red-50 border border-red-200 rounded-md p-3 text-xs whitespace-pre-line">
            {validationErr}
          </div>
        }
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Step Back/Edit Mapping */}
          <Button variant="outline" onClick={() => setStep(1)}>
            Back
          </Button>
          {/* Step Forward */}
          <Button
            className={styles["glass-btn"]}
            onClick={handleImport}
            disabled={loading}
          >
            {loading ? "Importing..." : "Import Contacts"}
          </Button>
          <Button
            variant="ghost"
            className="ml-auto text-muted-foreground"
            onClick={() => { onOpenChange(false); resetAll(); }}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  // --- Main wizard content
  const currentStepContent = [
    <FileUploadSection key="u" />,
    <ColumnMappingSection key="m" />,
    <ConfirmImportSection key="c" />
  ][step];

  // Title for each step
  const stepTitles = ["Upload CSV", "Map Columns & Preview", "Import & Results"];

  // Stepper display
  function Stepper() {
    const steps = stepTitles;
    return (
      <div className="flex items-center justify-center gap-5 mb-8">
        {stepTitles.map((title, idx) => (
          <React.Fragment key={title}>
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold ${
                  idx <= step ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-600"
                }`}
              >
                {idx + 1}
              </div>
              <span className="text-xs font-medium">{title}</span>
            </div>
            {idx < stepTitles.length - 1 && <ChevronRight className="w-5 h-5 text-gray-300" />}
          </React.Fragment>
        ))}
      </div>
    );
  }

  // Responsive dialog content wrapper
  // - On small screens: max-w-full, modal nearly full-screen, content scrolls
  // - On desktop: max-w-4xl, modal fits content, content has max-h
  return (
    <GlassModal
      open={open}
      onOpenChange={o => { onOpenChange(o); if (!o) resetAll(); }}
      title="Import Contacts from CSV"
      // Responsively control width
      maxWidth="w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl"
    >
      {/* Responsive modal body: use flex-col and responsive padding, ensure content scrolls not modal */}
      <div
        className="
          flex flex-col
          min-h-[60vh] max-h-[90vh]
          sm:min-h-[32rem] sm:max-h-[44rem]
          w-full
          overflow-hidden
          p-2 sm:p-4 md:p-6
        "
        style={{
          // fallback for legacy browsers
          minHeight: "60vh",
          maxHeight: "90vh",
        }}
      >
        <Stepper />
        {/* Responsive content section */}
        <div className="flex-1 min-h-0 max-h-full overflow-auto rounded-lg">
          {currentStepContent}
        </div>
        <div className="flex gap-4 mt-8 flex-wrap">
          {step > 0 && step < 2 &&
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          }
          {step === 1 &&
            <Button className={styles["glass-btn"]} onClick={() => setStep(2)}>
              Continue
            </Button>
          }
          {step < 1 &&
            <Button
              variant="ghost"
              className="ml-auto text-muted-foreground"
              onClick={() => { onOpenChange(false); resetAll(); }}
            >Close</Button>
          }
        </div>
      </div>
    </GlassModal>
  );
}

// File can be further split if grows too large.
