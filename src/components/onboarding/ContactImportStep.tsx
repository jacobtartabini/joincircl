
import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Linkedin, Phone, Plus, Users, Upload, FileText, Loader2, ChevronRight, Info, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { StandardModalHeader } from '@/components/ui/StandardModalHeader';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { generateCsvTemplate, parseAndValidateCsv, CSV_COLUMN_DESCRIPTIONS, REQUIRED_CSV_HEADERS, type CsvValidationResult } from '@/services/modernCsvImportService';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ContactImportStepProps {
  onNext: (data?: any) => void;
  onSkip: () => void;
}

export default function ContactImportStep({ onNext, onSkip }: ContactImportStepProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadedContacts, setUploadedContacts] = useState<number>(0);
  const [validationResult, setValidationResult] = useState<CsvValidationResult | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const importMethods = [
    {
      id: 'csv',
      title: 'Upload CSV File',
      description: 'Import contacts using our streamlined CSV template format',
      icon: Upload,
      iconColor: 'text-green-600',
      comingSoon: false,
    },
    {
      id: 'linkedin',
      title: 'Import from LinkedIn',
      description: 'Connect your LinkedIn to import professional contacts',
      icon: Linkedin,
      iconColor: 'text-[#0077B5]',
      comingSoon: true,
    },
    {
      id: 'contacts',
      title: 'Import from Phone',
      description: 'Import contacts from your phone or device contacts app',
      icon: Phone,
      iconColor: 'text-gray-700',
      comingSoon: true,
    },
    {
      id: 'manual',
      title: 'Add Manually',
      description: 'Start by adding contacts one by one as you meet people',
      icon: Plus,
      iconColor: 'text-blue-600',
      comingSoon: false,
    },
  ];

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a CSV file.',
        variant: 'destructive',
      });
      return;
    }

    setFileName(file.name);
    setSelectedMethod('csv');
    
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

  const handleCsvImport = async () => {
    if (!validationResult?.isValid || !validationResult.contacts.length || !user) {
      toast({
        title: 'Import failed',
        description: 'No valid contacts to import.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    
    try {
      const contactsToInsert = validationResult.contacts.map(contact => ({
        ...contact,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { data: insertedContacts, error } = await supabase
        .from('contacts')
        .insert(contactsToInsert)
        .select();

      if (error) {
        throw error;
      }

      const contactCount = insertedContacts?.length || 0;
      setUploadedContacts(contactCount);
      
      toast({
        title: 'Contacts uploaded successfully!',
        description: `${contactCount} contacts were imported from your CSV file.`,
      });
    } catch (error) {
      console.error('Error importing CSV:', error);
      toast({
        title: 'Import failed',
        description: 'There was an error importing your contacts. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
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

  const handleMethodSelect = (methodId: string) => {
    if (methodId === 'csv') {
      handleFileUpload();
    } else if (methodId === 'manual') {
      setSelectedMethod(methodId);
      onNext({ method: methodId });
    } else {
      setSelectedMethod(methodId);
    }
  };

  const handleContinue = () => {
    onNext({ 
      method: selectedMethod,
      contactsImported: uploadedContacts 
    });
  };

  return (
    <div className="space-y-8">
      <input 
        ref={fileInputRef} 
        type="file" 
        accept=".csv" 
        onChange={handleFileChange} 
        className="hidden" 
      />

      <StandardModalHeader
        icon={Users}
        title="Import Your Contacts"
        subtitle="Start building your network in Circl by importing existing contacts"
      />

      {selectedMethod !== 'csv' ? (
        <div className="space-y-4">
          {importMethods.map((method) => {
            const IconComponent = method.icon;
            const isSelected = selectedMethod === method.id;
            
            return (
              <Card 
                key={method.id}
                className={`glass-card border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
                  isSelected 
                    ? 'border-primary bg-primary/5 shadow-md' 
                    : 'border-white/20 hover:border-white/30'
                } ${method.comingSoon ? 'opacity-60 cursor-not-allowed' : ''}`}
                onClick={() => !method.comingSoon && handleMethodSelect(method.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <IconComponent className={`h-8 w-8 ${method.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{method.title}</h3>
                        {method.comingSoon && (
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-6">
          {/* CSV Guidelines */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">CSV Format Requirements</h3>
                  <p className="text-sm text-blue-800 mb-4">
                    Use our exact template format - no column mapping needed!
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-sm mb-2">Required Headers:</h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {REQUIRED_CSV_HEADERS.slice(0, 6).map((header) => (
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
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => downloadTemplate(false)}>
                  <Download className="w-4 h-4 mr-1" />
                  Download Template
                </Button>
                <span className="text-xs text-muted-foreground">
                  Multiple emails: use semicolon (;) separator
                </span>
              </div>
            </CardContent>
          </Card>

          {/* File Upload Status */}
          {fileName && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Selected: {fileName}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Validation Results */}
          {validationResult && (
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div><strong>Total Rows:</strong> {validationResult.totalRows}</div>
                  <div><strong>Valid:</strong> {validationResult.validRows}</div>
                  <div><strong>Errors:</strong> {validationResult.errors.length}</div>
                </div>

                {validationResult.errors.length > 0 && (
                  <div className="max-h-32 overflow-y-auto bg-red-50 border border-red-200 rounded p-3 mb-4">
                    <h4 className="font-medium text-red-800 mb-2">Errors Found:</h4>
                    {validationResult.errors.slice(0, 5).map((error, index) => (
                      <div key={index} className="text-sm text-red-700 mb-1">
                        Row {error.row}: {error.message}
                      </div>
                    ))}
                  </div>
                )}

                {validationResult.isValid && validationResult.validRows > 0 && (
                  <Button 
                    onClick={handleCsvImport}
                    disabled={uploading}
                    className="w-full"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Importing...
                      </>
                    ) : (
                      `Import ${validationResult.validRows} Contacts`
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {uploadedContacts > 0 && (
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg text-green-800">Success!</h3>
                <p className="text-sm text-green-600 mt-1">
                  {uploadedContacts} contacts imported successfully
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="flex justify-between items-center">
        <Button 
          variant="ghost" 
          onClick={onSkip}
          className="text-muted-foreground hover:text-foreground"
        >
          Skip for now
        </Button>
        
        {uploadedContacts > 0 && (
          <Button 
            onClick={handleContinue}
            className="bg-gradient-to-r from-primary to-primary/80"
          >
            Continue with {uploadedContacts} contacts
          </Button>
        )}
      </div>
    </div>
  );
}
