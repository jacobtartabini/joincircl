
import React, { useRef, useState } from "react";
import Papa from "papaparse";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, FileUp, CheckCircle, ChevronDown, Trash2, Upload } from "lucide-react";
import { Contact } from "@/types/contact";
import { validateCSVContacts, detectHeaders } from "@/services/csvImportService";
import { toast } from "sonner";
import { GlassModal } from "@/components/ui/GlassModal";
import styles from "@/components/ui/glass.module.css";

const SAMPLE_CSV = `Name,Email,Phone,Company,Job Title
Jane Doe,jane@email.com,111-222-3333,ACME Inc,Engineer
John Smith,john@email.com,222-333-4444,Company B,Director
`;
const CSV_HEADERS = [
  { label: "Name", required: true, keys: ["name", "full name"] },
  { label: "Email", required: true, keys: ["email", "e-mail"] },
  { label: "Phone", required: false, keys: ["phone", "mobile", "mobile_phone"] },
  { label: "Company", required: false, keys: ["company", "company_name"] },
  { label: "Job Title", required: false, keys: ["job_title", "title"] }
];

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
        // Remove blank rows
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
    const contacts: Partial<Contact>[] = fileData.map((row) => {
      const get = (target: string) => row[headerMap[target]]?.toString()?.trim() ?? "";
      return {
        name: get("Name"),
        personal_email: get("Email"),
        mobile_phone: get("Phone"),
        company_name: get("Company"),
        job_title: get("Job Title"),
      };
    });
    // Client-side validation
    const { validContacts, errors } = validateCSVContacts(contacts, CSV_HEADERS);
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
        <div className="mt-5 flex items-center gap-4">
          <Button variant="secondary" size="sm" onClick={() => {
            const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "sample-contacts.csv";
            a.click();
            URL.revokeObjectURL(url);
          }}>
            <Upload className="w-4 h-4 mr-1" />
            Download Sample CSV
          </Button>
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
    return (
      <>
        <div className={`${styles["glass-mapping"]} mb-6`}>
          <div className="font-semibold text-lg mb-2 flex items-center">
            Map your CSV columns
            <span className="ml-auto text-xs text-gray-500">{fileName}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {CSV_HEADERS.map(field =>
              <div key={field.label} className="flex flex-col">
                <span className="text-sm font-medium mb-1 flex items-center">
                  {field.label}
                  {field.required && <span className="ml-1 text-red-500">*</span>}
                </span>
                <select
                  className="rounded-lg border border-gray-200 px-2 py-2 bg-white bg-opacity-70 focus:ring-2 focus:ring-blue-300"
                  value={headerMap[field.label] || ""}
                  onChange={e => updateMapping(field.label, e.target.value)}
                >
                  <option value="">Unmapped</option>
                  {uploadedHeaders && uploadedHeaders.map(h =>
                    <option key={h} value={h}>{h}</option>
                  )}
                </select>
              </div>
            )}
          </div>
        </div>
        <div>
          <span className="font-medium text-md">Preview ({previewRows.length} of {fileData.length} rows)</span>
          <div className="overflow-x-auto rounded-lg border bg-white bg-opacity-70 mt-2 max-h-[260px]">
            <table className="w-full text-xs">
              <thead className="bg-blue-50 sticky top-0 z-0">
                <tr>
                  {CSV_HEADERS.map(({ label }) =>
                    <th key={label} className="p-2 font-semibold">{label}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, i) =>
                  <tr key={i} className="border-b last:border-0">
                    {CSV_HEADERS.map(({ label }) =>
                      <td key={label} className="p-2 truncate max-w-xs">
                        {row[headerMap[label]] || ""}
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
      </>
    );
  }

  // --- Confirm/Results Section
  function ConfirmImportSection() {
    return (
      <>
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
      </>
    );
  }

  // --- Main wizard content
  const currentStepContent = [
    <FileUploadSection key="u"/>,
    <ColumnMappingSection key="m"/>,
    <ConfirmImportSection key="c"/>
  ][step];

  // Title for each step
  const stepTitles = ["Upload CSV", "Map Columns & Preview", "Import & Results"];

  // Stepper display
  function Stepper() {
    const steps = stepTitles;
    return (
      <div className="flex items-center justify-center gap-5 mb-8">
        {steps.map((title, idx) => (
          <React.Fragment key={title}>
            <div className={`flex items-center gap-2`}>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold ${idx <= step ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-600"}`}
              >{idx + 1}</div>
              <span className="text-xs font-medium">{title}</span>
            </div>
            {idx < steps.length - 1 && <ChevronRight className="w-5 h-5 text-gray-300" />}
          </React.Fragment>
        ))}
      </div>
    );
  }

  // Dialog with glassmorphism and responsive layout
  return (
    <GlassModal
      open={open}
      onOpenChange={o => { onOpenChange(o); if (!o) resetAll(); }}
      title="Import Contacts from CSV"
      maxWidth="max-w-4xl"
    >
      <div className="min-h-[350px] max-h-[75vh] sm:max-h-[620px] overflow-y-auto">
        <Stepper />
        <div>
          {currentStepContent}
        </div>
        <div className="flex gap-4 mt-8">
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
