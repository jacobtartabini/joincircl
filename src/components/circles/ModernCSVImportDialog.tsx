
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Upload, Download, FileText, AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  generateCsvTemplate,
  parseAndValidateCsv,
  REQUIRED_CSV_HEADERS,
  CSV_COLUMN_DESCRIPTIONS,
  type CsvValidationResult
} from '@/services/modernCsvImportService';

interface ModernCSVImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess: (count: number) => void;
  refetchContacts: () => void;
}

export function ModernCSVImportDialog({
  open,
  onOpenChange,
  onImportSuccess,
  refetchContacts
}: ModernCSVImportDialogProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [validationResult, setValidationResult] = useState<CsvValidationResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [fileName, setFileName] = useState<string>('');

  const handleFileSelect = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      if (user) {
        const result = parseAndValidateCsv(csvText, user.id);
        setValidationResult(result);
      }
    };
    reader.readAsText(file);
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleImport = async () => {
    if (!validationResult?.isValid || !validationResult.contacts.length) {
      toast.error('No valid contacts to import');
      return;
    }

    setImporting(true);
    
    try {
      const contactsToInsert = validationResult.contacts.map(contact => ({
        ...contact,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from('contacts')
        .insert(contactsToInsert)
        .select();

      if (error) throw error;

      const importedCount = data?.length || 0;
      toast.success(`Successfully imported ${importedCount} contacts!`);
      onImportSuccess(importedCount);
      refetchContacts();
      onOpenChange(false);
      resetState();
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import contacts. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const resetState = () => {
    setValidationResult(null);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = (includeOptional: boolean = false) => {
    const templateContent = generateCsvTemplate(includeOptional);
    const blob = new Blob([templateContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = includeOptional ? 'contacts-template-complete.csv' : 'contacts-template-basic.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Contacts from CSV
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Guidelines Section */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">CSV Format Requirements</h3>
                  <p className="text-sm text-blue-800 mb-4">
                    Your CSV must use our exact template format. No column mapping needed!
                  </p>
                </div>
              </div>

              {/* Required Headers */}
              <div className="mb-4">
                <h4 className="font-medium text-sm mb-2">Required Column Headers (in this order):</h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {REQUIRED_CSV_HEADERS.slice(0, 7).map((header) => (
                    <TooltipProvider key={header}>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="outline" className="text-xs">
                            {header}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{CSV_COLUMN_DESCRIPTIONS[header]}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  + {REQUIRED_CSV_HEADERS.length - 7} more columns (hover badges for descriptions)
                </p>
              </div>

              {/* Key Format Rules */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Multiple Emails:</strong> Use semicolon (;) to separate<br />
                  <code className="text-xs bg-white/60 p-1 rounded">john@personal.com;john@work.com</code>
                </div>
                <div>
                  <strong>Circle Values:</strong> inner, middle, or outer<br />
                  <code className="text-xs bg-white/60 p-1 rounded">middle</code>
                </div>
                <div>
                  <strong>Tags:</strong> Comma-separated values<br />
                  <code className="text-xs bg-white/60 p-1 rounded">friend,colleague,tech</code>
                </div>
                <div>
                  <strong>Dates:</strong> YYYY-MM-DD format<br />
                  <code className="text-xs bg-white/60 p-1 rounded">2024-01-15</code>
                </div>
              </div>

              {/* Download Templates */}
              <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-blue-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadTemplate(false)}
                  className="bg-white/60 hover:bg-white/80"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Basic Template
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadTemplate(true)}
                  className="bg-white/60 hover:bg-white/80"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Complete Template
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Upload Section */}
          <Card>
            <CardContent className="p-6">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragOver
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onClick={handleFileUpload}
              >
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">
                  {fileName ? `Selected: ${fileName}` : 'Upload Your CSV File'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop your CSV file here, or click to browse
                </p>
                <Button variant="outline">
                  Select CSV File
                </Button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
            </CardContent>
          </Card>

          {/* Validation Results */}
          {validationResult && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  {validationResult.isValid ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <h3 className="font-semibold">
                    {validationResult.isValid ? 'Ready to Import!' : 'Validation Errors Found'}
                  </h3>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div>
                    <strong>Total Rows:</strong> {validationResult.totalRows}
                  </div>
                  <div>
                    <strong>Valid Contacts:</strong> {validationResult.validRows}
                  </div>
                  <div>
                    <strong>Errors:</strong> {validationResult.errors.length}
                  </div>
                </div>

                {validationResult.errors.length > 0 && (
                  <div className="max-h-40 overflow-y-auto border rounded p-3 bg-red-50">
                    <h4 className="font-medium text-red-800 mb-2">Errors to Fix:</h4>
                    <div className="space-y-1">
                      {validationResult.errors.slice(0, 10).map((error, index) => (
                        <div key={index} className="text-sm text-red-700">
                          <strong>Row {error.row}:</strong> {error.message}
                          {error.value && (
                            <span className="text-red-600"> (Value: "{error.value}")</span>
                          )}
                        </div>
                      ))}
                      {validationResult.errors.length > 10 && (
                        <div className="text-sm text-red-600 font-medium">
                          ...and {validationResult.errors.length - 10} more errors
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {validationResult.isValid && validationResult.validRows > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-sm text-green-800">
                      ✅ Ready to import {validationResult.validRows} contacts!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={() => {
                onOpenChange(false);
                resetState();
              }}
            >
              Cancel
            </Button>
            
            <div className="flex gap-3">
              {validationResult && !validationResult.isValid && (
                <Button
                  variant="outline"
                  onClick={resetState}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear & Try Again
                </Button>
              )}
              
              {validationResult?.isValid && validationResult.validRows > 0 && (
                <Button
                  onClick={handleImport}
                  disabled={importing}
                  className="bg-gradient-to-r from-primary to-primary/80"
                >
                  {importing ? (
                    <>Importing...</>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Import {validationResult.validRows} Contacts
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
