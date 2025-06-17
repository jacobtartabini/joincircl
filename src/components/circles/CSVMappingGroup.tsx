
import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { CONTACT_FIELD_DEFS, getExample } from "@/services/csvFieldDefs";

interface CSVMappingGroupProps {
  group: string;
  headerMap: { [target: string]: string };
  uploadedHeaders: string[];
  updateMapping: (target: string, source: string) => void;
  defaultOpen?: boolean;
}

export function CSVMappingGroup({
  group,
  headerMap,
  uploadedHeaders,
  updateMapping,
  defaultOpen = false
}: CSVMappingGroupProps) {
  const [open, setOpen] = useState(defaultOpen);
  const fields = CONTACT_FIELD_DEFS.filter(f => f.group === group && f.key !== "user_id");
  if (!fields.length) return null;

  return (
    <div className="glass-card border border-white/30 rounded-xl overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center px-4 py-3 hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-t-xl"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls={`csv-group-${group}`}
      >
        {open ? <ChevronDown className="w-4 h-4 mr-3" /> : <ChevronRight className="w-4 h-4 mr-3" />}
        <span className="text-sm uppercase tracking-wide font-semibold text-primary">{group} Fields</span>
        <div className="ml-auto text-xs text-muted-foreground">
          {fields.filter(f => headerMap[f.label]).length} / {fields.length} mapped
        </div>
      </button>
      
      {open && (
        <div id={`csv-group-${group}`} className="px-4 pb-4 border-t border-white/20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            {fields.map(field => (
              <div key={field.label} className="space-y-2">
                <label className="flex items-center text-sm font-medium text-foreground">
                  {field.label}
                  {field.required && <span className="ml-1 text-red-500">*</span>}
                </label>
                
                <select
                  className="w-full glass-input text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary/60"
                  value={headerMap[field.label] || ""}
                  onChange={e => updateMapping(field.label, e.target.value)}
                >
                  <option value="">Select column...</option>
                  {uploadedHeaders.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                
                <div className="text-xs text-muted-foreground">
                  Example: <span className="italic font-medium">{getExample(field.type)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
