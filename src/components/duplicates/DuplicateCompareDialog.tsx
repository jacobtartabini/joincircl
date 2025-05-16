import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContactAvatar } from "@/components/ui/contact-avatar";
import { Badge } from "@/components/ui/badge";
import { Contact } from "@/types/contact";
import { DuplicatePair } from "@/services/duplicateContactService";

interface DuplicateCompareDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  duplicatePair: DuplicatePair | null;
  onMerge: (primaryId: string, secondaryId: string) => Promise<Contact | null>;
}

export const DuplicateCompareDialog = ({
  isOpen,
  onOpenChange,
  duplicatePair,
  onMerge
}: DuplicateCompareDialogProps) => {
  const [isMerging, setIsMerging] = useState(false);
  const [primaryContact, setPrimaryContact] = useState<Contact | null>(null);
  const [secondaryContact, setSecondaryContact] = useState<Contact | null>(null);
  
  // Set the primary and secondary contacts when the dialog opens
  const handleOpenChange = (open: boolean) => {
    if (open && duplicatePair) {
      setPrimaryContact(duplicatePair.contact1);
      setSecondaryContact(duplicatePair.contact2);
    }
    onOpenChange(open);
  };
  
  // Swap primary and secondary contacts
  const handleSwap = () => {
    if (primaryContact && secondaryContact) {
      setPrimaryContact(secondaryContact);
      setSecondaryContact(primaryContact);
    }
  };
  
  const handleMerge = async () => {
    if (!primaryContact || !secondaryContact) return;
    
    try {
      setIsMerging(true);
      const mergedContact = await onMerge(primaryContact.id, secondaryContact.id);
      if (mergedContact) {
        onOpenChange(false);
      }
    } finally {
      setIsMerging(false);
    }
  };
  
  if (!duplicatePair || !primaryContact || !secondaryContact) {
    return null;
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Compare Duplicate Contacts</DialogTitle>
          <DialogDescription>
            Review contact details and choose which contact to keep as primary.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <ContactAvatar 
              name={primaryContact.name} 
              avatarUrl={primaryContact.avatar_url}
              circle={primaryContact.circle} 
              className="h-14 w-14"
            />
            <div>
              <h3 className="font-medium">{primaryContact.name}</h3>
              <p className="text-sm text-muted-foreground">
                Primary Contact
              </p>
            </div>
          </div>
          
          <Button variant="outline" size="sm" onClick={handleSwap}>
            Swap
          </Button>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <h3 className="font-medium">{secondaryContact.name}</h3>
              <p className="text-sm text-muted-foreground">
                Will be merged into primary
              </p>
            </div>
            <ContactAvatar 
              name={secondaryContact.name} 
              avatarUrl={secondaryContact.avatar_url}
              circle={secondaryContact.circle} 
              className="h-14 w-14"
            />
          </div>
        </div>
        
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details">Basic Details</TabsTrigger>
            <TabsTrigger value="work">Work & Education</TabsTrigger>
            <TabsTrigger value="other">Other Information</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="p-2">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-sm text-muted-foreground">
                Field
              </div>
              <div className="text-sm font-medium">
                Primary
              </div>
              <div className="text-sm font-medium">
                Secondary
              </div>
              
              <CompareRow 
                label="Email"
                value1={primaryContact.personal_email}
                value2={secondaryContact.personal_email}
              />
              
              <CompareRow 
                label="Phone"
                value1={primaryContact.mobile_phone}
                value2={secondaryContact.mobile_phone}
              />
              
              <CompareRow 
                label="Location"
                value1={primaryContact.location}
                value2={secondaryContact.location}
              />
              
              <CompareRow 
                label="Circle"
                value1={primaryContact.circle}
                value2={secondaryContact.circle}
                customValue1={<Badge>{primaryContact.circle}</Badge>}
                customValue2={<Badge>{secondaryContact.circle}</Badge>}
              />
              
              <CompareRow 
                label="Last Contact"
                value1={primaryContact.last_contact ? new Date(primaryContact.last_contact).toLocaleDateString() : undefined}
                value2={secondaryContact.last_contact ? new Date(secondaryContact.last_contact).toLocaleDateString() : undefined}
              />
              
              <CompareRow 
                label="Website"
                value1={primaryContact.website}
                value2={secondaryContact.website}
              />
              
              <CompareRow 
                label="Tags"
                value1={primaryContact.tags?.join(', ')}
                value2={secondaryContact.tags?.join(', ')}
                customValue1={
                  <div className="flex flex-wrap gap-1">
                    {primaryContact.tags?.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                }
                customValue2={
                  <div className="flex flex-wrap gap-1">
                    {secondaryContact.tags?.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                }
              />
            </div>
          </TabsContent>
          
          <TabsContent value="work" className="p-2">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-sm text-muted-foreground">
                Field
              </div>
              <div className="text-sm font-medium">
                Primary
              </div>
              <div className="text-sm font-medium">
                Secondary
              </div>
              
              <CompareRow 
                label="Company"
                value1={primaryContact.company_name}
                value2={secondaryContact.company_name}
              />
              
              <CompareRow 
                label="Job Title"
                value1={primaryContact.job_title}
                value2={secondaryContact.job_title}
              />
              
              <CompareRow 
                label="Industry"
                value1={primaryContact.industry}
                value2={secondaryContact.industry}
              />
              
              <CompareRow 
                label="Department"
                value1={primaryContact.department}
                value2={secondaryContact.department}
              />
              
              <CompareRow 
                label="Work Address"
                value1={primaryContact.work_address}
                value2={secondaryContact.work_address}
              />
              
              <CompareRow 
                label="University"
                value1={primaryContact.university}
                value2={secondaryContact.university}
              />
              
              <CompareRow 
                label="Major"
                value1={primaryContact.major}
                value2={secondaryContact.major}
              />
              
              <CompareRow 
                label="Minor"
                value1={primaryContact.minor}
                value2={secondaryContact.minor}
              />
              
              <CompareRow 
                label="Graduation"
                value1={primaryContact.graduation_year?.toString()}
                value2={secondaryContact.graduation_year?.toString()}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="other" className="p-2">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-sm text-muted-foreground">
                Field
              </div>
              <div className="text-sm font-medium">
                Primary
              </div>
              <div className="text-sm font-medium">
                Secondary
              </div>
              
              <CompareRow 
                label="LinkedIn"
                value1={primaryContact.linkedin}
                value2={secondaryContact.linkedin}
              />
              
              <CompareRow 
                label="Twitter"
                value1={primaryContact.twitter}
                value2={secondaryContact.twitter}
              />
              
              <CompareRow 
                label="Facebook"
                value1={primaryContact.facebook}
                value2={secondaryContact.facebook}
              />
              
              <CompareRow 
                label="Instagram"
                value1={primaryContact.instagram}
                value2={secondaryContact.instagram}
              />
              
              <CompareRow 
                label="Birthday"
                value1={primaryContact.birthday}
                value2={secondaryContact.birthday}
              />
              
              <CompareRow 
                label="How We Met"
                value1={primaryContact.how_met}
                value2={secondaryContact.how_met}
              />
              
              <CompareRow 
                label="Hobbies"
                value1={primaryContact.hobbies_interests}
                value2={secondaryContact.hobbies_interests}
              />
              
              <CompareRow 
                label="Notes"
                value1={primaryContact.notes}
                value2={secondaryContact.notes}
                multiline={true}
              />
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            variant="default" 
            onClick={handleMerge}
            disabled={isMerging}
            className="ml-2"
          >
            {isMerging ? "Merging..." : "Merge Contacts"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface CompareRowProps {
  label: string;
  value1?: string;
  value2?: string;
  customValue1?: React.ReactNode;
  customValue2?: React.ReactNode;
  multiline?: boolean;
}

const CompareRow = ({ 
  label, 
  value1, 
  value2,
  customValue1,
  customValue2,
  multiline = false
}: CompareRowProps) => {
  if (!value1 && !value2 && !customValue1 && !customValue2) {
    return null;
  }
  
  const baseClasses = "py-2 truncate";
  const cellClasses = multiline 
    ? `${baseClasses} whitespace-pre-wrap h-auto max-h-32 overflow-y-auto text-sm` 
    : `${baseClasses} text-sm`;
  
  return (
    <>
      <div className="py-2 text-sm text-muted-foreground border-t">{label}</div>
      <div className={`border-t ${cellClasses}`}>
        {customValue1 || value1 || "-"}
      </div>
      <div className={`border-t ${cellClasses}`}>
        {customValue2 || value2 || "-"}
      </div>
    </>
  );
};
