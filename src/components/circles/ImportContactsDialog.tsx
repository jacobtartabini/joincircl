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
import { CSVMappingGroup } from "./CSVMappingGroup";
import { CSVPreviewTable } from "./CSVPreviewTable";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();
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
    if (!fileData.length || !user) {
      setValidationErr("No data to import or user not authenticated.");
      return;
    }

    // Build contact objects based on mapping
    const contacts: Partial<Contact>[] = fileData.map((row) =>
      parseContactFromRow(row, headerMap)
    );

    // Client-side validation - NO REQUIRED FIELDS for CSV import
    const { validContacts, errors } = validateCSVContacts(contacts, CONTACT_FIELD_DEFS);

    if (errors.length > 0) {
      setValidationErr(
        `Please fix format errors before import:\n` +
        errors.map((err) => `Row ${err.row}: ${err.reason}`).join("\n")
      );
      return;
    }
    
    setLoading(true);
    setValidationErr(null);
    setImportResult(null);

    try {
      // Filter contacts to ensure at least some data exists (but don't require name)
      const contactsToInsert = validContacts
        .filter(contact => 
          // At least one field must have content
          Object.values(contact).some(value => 
            value !== null && value !== undefined && 
            (typeof value === 'string' ? value.trim() !== '' : true)
          )
        )
        .map(contact => ({
          name: contact.name || 'Imported Contact', // Provide default name if missing
          user_id: user.id,
          circle: (contact.circle as "inner" | "middle" | "outer") || 'outer',
          personal_email: contact.personal_email || null,
          mobile_phone: contact.mobile_phone || null,
          location: contact.location || null,
          website: contact.website || null,
          linkedin: contact.linkedin || null,
          facebook: contact.facebook || null,
          twitter: contact.twitter || null,
          instagram: contact.instagram || null,
          company_name: contact.company_name || null,
          job_title: contact.job_title || null,
          industry: contact.industry || null,
          department: contact.department || null,
          work_address: contact.work_address || null,
          university: contact.university || null,
          major: contact.major || null,
          minor: contact.minor || null,
          graduation_year: contact.graduation_year || null,
          birthday: contact.birthday || null,
          how_met: contact.how_met || null,
          hobbies_interests: contact.hobbies_interests || null,
          notes: contact.notes || null,
          tags: contact.tags || null,
          avatar_url: contact.avatar_url || null,
          career_priority: contact.career_priority || false,
          career_tags: contact.career_tags || null,
          referral_potential: contact.referral_potential || null,
          career_event_id: contact.career_event_id || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

      if (contactsToInsert.length === 0) {
        throw new Error('No valid contacts found in CSV file');
      }

      const { data: insertedContacts, error } = await supabase
        .from('contacts')
        .insert(contactsToInsert)
        .select();

      if (error) {
        throw error;
      }

      const result = {
        successCount: insertedContacts?.length || 0,
        failed: []
      };
      
      setImportResult(result);
      toast.success(`${result.successCount} contacts imported`);
      if (result.successCount > 0) {
        refetchContacts();
        onImportSuccess(result.successCount);
      }
      setStep(2);
    } catch (error) {
      console.error('Import error:', error);
      setValidationErr("Failed to import contacts. Please try again.");
      setImportResult(null);
    }
    setLoading(false);
  }

  // --- Upload Section
  function FileUploadSection() {
    return (
      <div>
        <div
          className={`glass-card-enhanced border-2 border-dashed ${dragging ? 'border-primary/60 bg-primary/5' : 'border-white/30'} flex flex-col items-center py-12 gap-4 transition-all cursor-pointer hover:border-primary/40 hover:bg-white/20`}
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
          <FileUp className="w-12 h-12 text-primary mb-2" />
          <span className="font-semibold text-lg text-foreground">Drop your CSV file here or <span className="underline text-primary">browse</span></span>
          <span className="text-sm text-muted-foreground">Max 5,000 contacts • CSV only • No fields required</span>
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
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Button variant="secondary" size="sm" className="glass-button" onClick={() => {
            const blob = new Blob([makeSampleCSV(BASIC_FIELDS)], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "sample-basic-contacts.csv";
            a.click();
            URL.revokeObjectURL(url);
          }}>
            <Upload className="w-4 h-4 mr-2" />
            Download Basic Sample
          </Button>
          <Button variant="secondary" size="sm" className="glass-button" onClick={() => {
            const blob = new Blob([makeSampleCSV(COMPREHENSIVE_FIELDS)], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "sample-complete-contacts.csv";
            a.click();
            URL.revokeObjectURL(url);
          }}>
            <Upload className="w-4 h-4 mr-2" />
            Download Complete Sample
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="w-4 h-4" />
            All fields are optional - map what you have!
          </div>
        </div>
        {validationErr &&
          <div className="glass-card mt-6 border-red-200/50 bg-red-50/20 p-4">
            <div className="text-red-700 text-sm">{validationErr}</div>
          </div>
        }
      </div>
    );
  }

  // --- Mapping Section
  function ColumnMappingSection() {
    const uploadedHeaders = fileData.length > 0 && Object.keys(fileData[0]);
    const groups = Array.from(new Set(CONTACT_FIELD_DEFS.map(f => f.group)));

    // State: expand/collapse all groups
    const [allOpen, setAllOpen] = useState<string | null>(null);

    return (
      <div>
        <div className="glass-card-enhanced mb-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-foreground">Map Your CSV Columns</h3>
            <div className="glass-card px-3 py-1.5">
              <span className="text-sm text-muted-foreground">{fileName}</span>
            </div>
          </div>
          
          <div className="mb-4 p-3 glass-card bg-blue-50/20 border-blue-200/50 rounded-lg">
            <p className="text-sm text-blue-700">
              <Info className="w-4 h-4 inline mr-2" />
              All fields are optional! Map only the columns you want to import. Contacts without names will be labeled as "Imported Contact".
            </p>
          </div>
          
          {/* Expand/collapse controls */}
          <div className="flex items-center gap-4 mb-4">
            <button
              type="button"
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              onClick={() => setAllOpen("all")}
            >
              Expand all
            </button>
            <button
              type="button"
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              onClick={() => setAllOpen("none")}
            >
              Collapse all
            </button>
          </div>
          
          {/* Collapsible Mapping Groups */}
          <div className="space-y-3">
            {groups.map(group =>
              <CSVMappingGroup
                key={group}
                group={group}
                headerMap={headerMap}
                uploadedHeaders={uploadedHeaders || []}
                updateMapping={updateMapping}
                defaultOpen={allOpen === "all" || (allOpen === null && group === "Basic")}
              />
            )}
          </div>
        </div>
        
        <div className="glass-card-enhanced p-6">
          <h4 className="font-semibold text-base mb-4 text-foreground">
            Preview ({previewRows.length} of {fileData.length} rows)
          </h4>
          <CSVPreviewTable previewRows={previewRows} fileData={fileData} headerMap={headerMap} />
        </div>
        
        {validationErr &&
          <div className="glass-card mt-6 border-red-200/50 bg-red-50/20 p-4">
            <div className="text-red-700 text-sm whitespace-pre-line">{validationErr}</div>
          </div>
        }
      </div>
    );
  }

  // --- Confirm/Results Section
  function ConfirmImportSection() {
    return (
      <div>
        {importResult ? (
          <div className="glass-card-enhanced border-green-200/50 bg-green-50/20 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-lg text-green-800">Import Complete!</h3>
                <p className="text-green-700">{importResult.successCount} contacts imported successfully</p>
              </div>
            </div>
            {importResult.failed?.length > 0 && (
              <details className="mt-4">
                <summary className="cursor-pointer font-medium text-red-700 mb-2">
                  {importResult.failed.length} failed to import (click to expand)
                </summary>
                <div className="glass-card bg-red-50/20 border-red-200/50 p-3 rounded-lg">
                  <ul className="text-sm text-red-600 space-y-1">
                    {importResult.failed.map((fail: any, i: number) => (
                      <li key={i}>Row {fail.row}: {fail.reason}</li>
                    ))}
                  </ul>
                </div>
              </details>
            )}
          </div>
        ) : (
          <div className="glass-card-enhanced p-6 mb-6">
            <h3 className="font-semibold text-lg text-foreground mb-2">Ready to Import</h3>
            <p className="text-muted-foreground mb-4">
              {fileData.length} contacts will be imported to your Circl. All fields are optional.
            </p>
            <Button
              onClick={handleImport}
              disabled={loading}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white px-8"
            >
              {loading ? "Importing..." : `Import ${fileData.length} Contacts`}
            </Button>
          </div>
        )}
        
        {validationErr &&
          <div className="glass-card border-red-200/50 bg-red-50/20 p-4 mb-6">
            <div className="text-red-700 text-sm whitespace-pre-line">{validationErr}</div>
          </div>
        }
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
  const stepTitles = ["Upload CSV", "Map Columns", "Import Contacts"];

  // Stepper display with glassmorphic design
  function Stepper() {
    return (
      <div className="flex items-center justify-center gap-2 mb-8">
        {stepTitles.map((title, idx) => (
          <React.Fragment key={title}>
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                  idx < step ? "bg-primary text-white shadow-lg" :
                  idx === step ? "bg-primary/20 text-primary border-2 border-primary/40" :
                  "glass-card text-muted-foreground"
                }`}
              >
                {idx < step ? <CheckCircle className="w-5 h-5" /> : idx + 1}
              </div>
              <span className={`text-xs font-medium ${idx <= step ? 'text-foreground' : 'text-muted-foreground'}`}>
                {title}
              </span>
            </div>
            {idx < stepTitles.length - 1 && (
              <div className={`h-px w-8 mx-2 mt-[-20px] ${idx < step ? 'bg-primary' : 'bg-border'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  return (
    <GlassModal
      open={open}
      onOpenChange={o => { onOpenChange(o); if (!o) resetAll(); }}
      title="Import Contacts from CSV"
      maxWidth="w-full max-w-4xl"
    >
      <div className="min-h-[500px] max-h-[80vh] overflow-hidden flex flex-col">
        <Stepper />
        
        <div className="flex-1 overflow-auto">
          {currentStepContent}
        </div>
        
        {/* Navigation buttons */}
        <div className="flex gap-3 mt-6 pt-6 border-t border-white/20">
          {step > 0 && step < 2 && (
            <Button 
              variant="outline" 
              onClick={() => setStep(step - 1)}
              className="glass-button"
            >
              Back
            </Button>
          )}
          
          {step === 1 && (
            <Button 
              onClick={() => setStep(2)}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white"
            >
              Continue to Import
            </Button>
          )}
          
          <Button
            variant="ghost"
            className="ml-auto glass-button"
            onClick={() => { onOpenChange(false); resetAll(); }}
          >
            {importResult ? 'Done' : 'Cancel'}
          </Button>
        </div>
      </div>
    </GlassModal>
  );
}
