
import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Linkedin, Phone, Plus, Users, Upload, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContactImportStepProps {
  onNext: (data?: any) => void;
  onSkip: () => void;
}

export default function ContactImportStep({ onNext, onSkip }: ContactImportStepProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadedContacts, setUploadedContacts] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const importMethods = [
    {
      id: 'csv',
      title: 'Upload CSV File',
      description: 'Import contacts from a CSV file with name, email, and phone columns',
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

    setUploading(true);
    try {
      // Simulate CSV parsing and upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock success
      const mockContactCount = Math.floor(Math.random() * 50) + 10;
      setUploadedContacts(mockContactCount);
      setSelectedMethod('csv');
      
      toast({
        title: 'Contacts uploaded successfully!',
        description: `${mockContactCount} contacts were imported from your CSV file.`,
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'There was an error uploading your contacts. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleMethodSelect = (methodId: string) => {
    if (methodId === 'csv') {
      handleFileUpload();
    } else if (methodId === 'manual') {
      setSelectedMethod(methodId);
      // Continue immediately for manual method
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
    <div className="max-w-2xl mx-auto">
      <input 
        ref={fileInputRef} 
        type="file" 
        accept=".csv" 
        onChange={handleFileChange} 
        className="hidden" 
      />

      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Users className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">Import Your Contacts</h1>
        <p className="text-lg text-muted-foreground">Start building your network in Circl by importing existing contacts</p>
      </div>

      <div className="space-y-4 mb-8">
        {importMethods.map((method) => {
          const IconComponent = method.icon;
          const isSelected = selectedMethod === method.id;
          
          return (
            <Card 
              key={method.id}
              className={`border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50/50 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300'
              } ${method.comingSoon ? 'opacity-60 cursor-not-allowed' : ''}`}
              onClick={() => !method.comingSoon && handleMethodSelect(method.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {uploading && method.id === 'csv' ? (
                      <div className="w-12 h-12 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                      </div>
                    ) : (
                      <IconComponent className={`h-8 w-8 ${method.iconColor}`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{method.title}</h3>
                      {method.comingSoon && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          Coming Soon
                        </span>
                      )}
                      {isSelected && uploadedContacts > 0 && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          {uploadedContacts} contacts imported
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </div>
                  {isSelected && !uploading && (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* CSV Upload Instructions */}
      {selectedMethod === 'csv' && uploadedContacts === 0 && !uploading && (
        <Card className="border-blue-200 bg-blue-50/50 mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2">CSV Format Requirements</h4>
                <p className="text-sm text-blue-700 mb-2">
                  Your CSV file should have these columns: Name, Email, Phone (optional)
                </p>
                <div className="text-xs font-mono bg-white p-2 rounded border">
                  Name,Email,Phone<br/>
                  John Doe,john@example.com,+1234567890<br/>
                  Jane Smith,jane@example.com,+0987654321
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-center">
        <Button 
          variant="ghost" 
          onClick={onSkip}
          className="text-muted-foreground hover:text-foreground"
        >
          Skip for now
        </Button>
        
        <div className="flex items-center gap-4">
          {selectedMethod && uploadedContacts > 0 && (
            <Button 
              onClick={handleContinue}
              className="bg-blue-600 hover:bg-blue-700 px-6 rounded-full"
            >
              Continue with {uploadedContacts} contacts
            </Button>
          )}
          
          <div className="text-sm text-muted-foreground text-right">
            You can always import contacts later<br />
            from the Contacts page
          </div>
        </div>
      </div>
    </div>
  );
}
