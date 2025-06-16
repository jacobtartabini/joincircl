
import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Linkedin, Phone, Plus, Users, Upload, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { StandardModalHeader } from '@/components/ui/StandardModalHeader';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Papa from 'papaparse';
import { detectHeaders, validateCSVContacts, parseContactFromRow } from '@/services/csvImportService';

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
  const { user } = useAuth();

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
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          try {
            if (results.errors.length > 0) {
              throw new Error('CSV parsing failed');
            }

            const data = results.data;
            if (!data || data.length === 0) {
              throw new Error('No data found in CSV file');
            }

            // Detect headers and map them
            const fields = Object.keys(data[0] as any);
            const headerMap = detectHeaders(fields);
            
            // Parse contacts from CSV data
            const parsedContacts = data
              .map(row => parseContactFromRow(row, headerMap))
              .filter(contact => contact.name || contact.personal_email);

            if (parsedContacts.length === 0) {
              throw new Error('No valid contacts found in CSV file');
            }

            // Validate contacts
            const { validContacts, errors } = validateCSVContacts(parsedContacts, [
              { label: 'Name', required: false, key: 'name', type: 'text' },
              { label: 'Email', required: false, key: 'personal_email', type: 'email' }
            ]);

            if (errors.length > 0) {
              console.warn('CSV validation errors:', errors);
            }

            // Filter contacts to ensure required fields and proper typing
            const contactsToInsert = validContacts
              .filter(contact => contact.name && contact.name.trim()) // Ensure name is present
              .map(contact => ({
                name: contact.name!,
                user_id: user?.id!,
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
              throw new Error('No contacts with valid names found in CSV file');
            }

            const { data: insertedContacts, error } = await supabase
              .from('contacts')
              .insert(contactsToInsert)
              .select();

            if (error) {
              throw error;
            }

            const contactCount = insertedContacts?.length || 0;
            setUploadedContacts(contactCount);
            setSelectedMethod('csv');
            
            toast({
              title: 'Contacts uploaded successfully!',
              description: `${contactCount} contacts were imported from your CSV file.`,
            });
          } catch (error) {
            console.error('Error processing CSV:', error);
            toast({
              title: 'Upload failed',
              description: 'There was an error processing your CSV file. Please check the format and try again.',
              variant: 'destructive',
            });
          } finally {
            setUploading(false);
          }
        },
        error: (error) => {
          console.error('CSV parsing error:', error);
          toast({
            title: 'Upload failed',
            description: 'There was an error reading your CSV file. Please try again.',
            variant: 'destructive',
          });
          setUploading(false);
        }
      });
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'There was an error uploading your contacts. Please try again.',
        variant: 'destructive',
      });
      setUploading(false);
    }
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

      {/* Consistent Page Header */}
      <StandardModalHeader
        icon={Users}
        title="Import Your Contacts"
        subtitle="Start building your network in Circl by importing existing contacts"
      />

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
                    {uploading && method.id === 'csv' ? (
                      <div className="w-12 h-12 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                      </div>
                    ) : (
                      <IconComponent className={`h-8 w-8 ${method.iconColor}`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{method.title}</h3>
                      {method.comingSoon && (
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
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
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
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
        <Card className="glass-card border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-foreground mb-2">CSV Format Requirements</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Your CSV file should have these columns: Name, Email, Phone (optional)
                </p>
                <div className="text-xs font-mono bg-background/60 p-3 rounded border border-white/20">
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
          className="text-muted-foreground hover:text-foreground glass-button"
        >
          Skip for now
        </Button>
        
        <div className="flex items-center gap-4">
          {selectedMethod && uploadedContacts > 0 && (
            <Button 
              onClick={handleContinue}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white px-6 rounded-xl shadow-lg"
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
