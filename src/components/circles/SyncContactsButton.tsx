
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Upload, ChevronDown } from "lucide-react";
import { ModernCSVImportDialog } from "./ModernCSVImportDialog";

interface SyncContactsButtonProps {
  onContactsImported: () => void;
}

export function SyncContactsButton({ onContactsImported }: SyncContactsButtonProps) {
  const [showCSVImport, setShowCSVImport] = useState(false);

  const handleImportSuccess = (count: number) => {
    onContactsImported();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-12 px-4 flex items-center gap-2 rounded-full border-gray-200 hover:bg-gray-50 transition-all duration-200"
          >
            <Upload className="h-4 w-4" />
            Import
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowCSVImport(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import from CSV
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ModernCSVImportDialog
        open={showCSVImport}
        onOpenChange={setShowCSVImport}
        onImportSuccess={handleImportSuccess}
        refetchContacts={onContactsImported}
      />
    </>
  );
}
