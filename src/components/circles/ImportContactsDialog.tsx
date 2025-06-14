
import React, { useRef, useState } from "react";
import Papa from "papaparse";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Contact } from "@/types/contact";
import { validateCSVContacts, detectHeaders } from "@/services/csvImportService";
import { toast } from "sonner";
import { FileUp, ChevronDown } from "lucide-react";

interface ImportContactsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess: (addedCount: number) => void;
  refetchContacts: () => void;
}

interface ImportResult {
  successCount: number;
  failed: { row: number; reason: string }[];
}

const SAMPLE_CSV = `Name,Email,Phone,Company,Job Title
Jane Doe,jane@email.com,111-222-3333,ACME Inc,Engineer
John Smith,john@email.com,222-333-4444,Company B,Director
`;

const CSV_HEADERS = [
  { label: "Name", required: true, keys: ["name", "full name"] },
  { label: "Email", required: true, keys: ["email", "e-mail"] },
  { label: "Phone", required: false, keys: ["phone", "mobile", "mobile_phone"] },
  { label: "Company", required: false, keys: ["company", "company_name"] },
  { label: "Job Title", required: false, keys: ["job_title", "title"] },
];

export default function ImportContactsDialog({
  open,
  onOpenChange,
  onImportSuccess,
  refetchContacts,
}: ImportContactsDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileData, setFileData] = useState<any[]>([]);
  const [headerMap, setHeaderMap] = useState<{ [target: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [validationErr, setValidationErr] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  // File upload handler
  const handleFile = (file: File) => {
    setFileName(file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const { data, errors, meta } = results;
        if (errors && errors.length > 0) {
          setValidationErr("Unable to parse CSV. Check your file structure.");
          setFileData([]);
          setPreviewRows([]);
          setHeaderMap({});
          return;
        }
        // Remove blank rows (all fields empty)
        const filtered = data.filter((row: any) =>
          Object.values(row).some((v) => v && `${v}`.trim() !== "")
        );
        setFileData(filtered);
        setPreviewRows(filtered.slice(0, 8));
        // Auto header map
        setHeaderMap(detectHeaders(meta.fields || []));
        setValidationErr(null);
        setImportResult(null);
      },
    });
  };

  // Handle file input click (for accessibility)
  const openFile = () => inputRef.current?.click();

  // Handle mapping change
  const updateMapping = (target: string, source: string) => {
    setHeaderMap((curr) => ({ ...curr, [target]: source }));
  };

  // Download sample CSV
  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample-contacts.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import handler
  const handleImport = async () => {
    if (!fileData.length) {
      setValidationErr("No data to import.");
      return;
    }
    // Build contacts objects
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
        const result: ImportResult = await resp.json();
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
  };

  // Header mapping select options
  const uploadedHeaders = fileData.length > 0 && Object.keys(fileData[0]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Contacts from CSV</DialogTitle>
        </DialogHeader>
        {/* File Upload */}
        {!fileData.length && (
          <div className="text-center p-8 border-2 border-dashed rounded-lg cursor-pointer hover:bg-blue-50 transition-colors" onClick={openFile}
            onDrop={e => {
              e.preventDefault(); e.stopPropagation();
              if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
            }}
            onDragOver={e => e.preventDefault()}
            aria-label="Drag and drop CSV file here, or click to browse"
          >
            <FileUp className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="text-md font-medium">Drag & drop a CSV file, or <span className="underline text-blue-600 cursor-pointer">browse</span></p>
            <p className="text-xs text-muted-foreground mt-1">CSV only • Max 5,000 contacts</p>
            <Input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={e => {
                if (e.target.files?.[0]) handleFile(e.target.files[0]);
              }}
            />
          </div>
        )}
        {/* Sample CSV Download and Remap */}
        {fileData.length > 0 && (
          <div>
            <div className="flex flex-wrap gap-2 items-center mb-2">
              <Button variant="secondary" size="sm" onClick={downloadSample}>
                Download Sample CSV
              </Button>
              {fileName && <Badge variant="secondary">{fileName}</Badge>}
              <Button variant="outline" size="sm" onClick={() => { setFileData([]); setHeaderMap({}); }}>
                Change File
              </Button>
            </div>
            <div className="border rounded-lg mb-3 overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-blue-50">
                  <tr>
                    {CSV_HEADERS.map(({ label }) => (
                      <th key={label} className="p-2 font-semibold border-b border-gray-200">
                        {/* Header Map Select */}
                        <div className="flex items-center gap-1">
                          <span>{label}</span>
                          <select
                            value={headerMap[label] || ""}
                            onChange={e => updateMapping(label, e.target.value)}
                            className="ml-1 px-1 py-0.5 border rounded bg-white text-xs"
                          >
                            <option value="">Unmapped</option>
                            {uploadedHeaders && uploadedHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                          </select>
                          {CSV_HEADERS.find(h => h.label === label)?.required && (
                            <span className="ml-1 text-red-500">*</span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, i) => (
                    <tr key={i} className="border-b last:border-0">
                      {CSV_HEADERS.map(({ label }) => (
                        <td key={label} className="p-2 truncate max-w-xs">
                          {row[headerMap[label]] || ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {validationErr && (
              <div className="text-red-700 bg-red-50 border border-red-200 rounded-md p-3 mb-2 whitespace-pre-line text-xs">
                {validationErr}
              </div>
            )}
            {importResult && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-2 text-xs">
                <strong>{importResult.successCount} contacts added.</strong>
                {importResult.failed?.length > 0 && (
                  <div>
                    {importResult.failed.length} failed:
                    <ul className="list-disc ml-4">
                      {importResult.failed.map((fail, i) => (
                        <li key={i}>Row {fail.row}: {fail.reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button
                onClick={handleImport}
                disabled={loading || !fileData.length}
                className="bg-[#30a2ed] text-white rounded-full"
              >
                {loading ? "Importing..." : "Import Contacts"}
              </Button>
              <DialogClose asChild>
                <Button variant="ghost" type="button">Close</Button>
              </DialogClose>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
