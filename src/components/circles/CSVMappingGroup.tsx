
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
    <div className="mb-2 rounded-xl border bg-white/70 shadow-sm">
      <button
        type="button"
        className="w-full flex items-center px-3 py-2 focus:outline-none cursor-pointer"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls={`csv-group-${group}`}
      >
        {open ? <ChevronDown className="w-4 h-4 mr-2" /> : <ChevronRight className="w-4 h-4 mr-2" />}
        <span className="text-xs uppercase tracking-wide font-semibold text-blue-500">{group} Fields</span>
      </button>
      {open && (
        <div id={`csv-group-${group}`} className="px-3 pb-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fields.map(field =>
              <div key={field.label} className="flex flex-col">
                <span className="text-sm font-medium mb-1 flex items-center">
                  {field.label}
                  {field.required && <span className="ml-1 text-red-500">*</span>}
                </span>
                <select
                  className="rounded border border-gray-200 px-2 py-1 text-sm bg-white bg-opacity-90 focus:ring-2 focus:ring-blue-300"
                  value={headerMap[field.label] || ""}
                  onChange={e => updateMapping(field.label, e.target.value)}
                >
                  <option value="">Unmapped</option>
                  {uploadedHeaders.map(h =>
                    <option key={h} value={h}>{h}</option>
                  )}
                </select>
                <span className="text-xs text-gray-400 mt-0.5">e.g. <span className="italic">{getExample(field.type)}</span></span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
