
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, AlertCircle, ChevronRight } from "lucide-react";
import { Contact } from "@/types/contact";
import { ContactAvatar } from "@/components/ui/contact-avatar";
import { cn } from "@/lib/utils";
import { DuplicatePair } from "@/services/duplicateContactService";

interface DuplicateContactCardProps {
  duplicatePair: DuplicatePair;
  onMerge: (primaryId: string, secondaryId: string) => Promise<Contact | null>;
  onCompare: (duplicatePair: DuplicatePair) => void;
}

export const DuplicateContactCard = ({ 
  duplicatePair,
  onMerge,
  onCompare
}: DuplicateContactCardProps) => {
  const { contact1, contact2, score, matchedOn, isHighConfidence } = duplicatePair;
  const [isMerging, setIsMerging] = useState(false);
  
  const confidenceLabel = isHighConfidence 
    ? "High confidence match" 
    : "Potential match";
  
  const confidencePercent = Math.round(score * 100);
  
  const handleMerge = async () => {
    try {
      setIsMerging(true);
      await onMerge(contact1.id, contact2.id);
    } finally {
      setIsMerging(false);
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {isHighConfidence ? (
                <Badge variant="default" className="bg-green-600 mr-2">
                  <Check size={12} className="mr-1" />
                  {confidenceLabel}
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 mr-2">
                  <AlertCircle size={12} className="mr-1" />
                  {confidenceLabel}
                </Badge>
              )}
              <span className="text-sm text-muted-foreground">
                {confidencePercent}% similar
              </span>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="flex items-center space-x-2 flex-1">
              <ContactAvatar 
                name={contact1.name} 
                avatarUrl={contact1.avatar_url}
                circle={contact1.circle} 
                className="h-12 w-12"
              />
              <div>
                <h3 className="font-medium text-sm">{contact1.name}</h3>
                <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                  {contact1.personal_email || contact1.job_title || contact1.company_name || ""}
                </p>
              </div>
            </div>
            
            <ChevronRight size={16} className="text-muted-foreground mx-1" />
            
            <div className="flex items-center space-x-2 flex-1">
              <ContactAvatar 
                name={contact2.name} 
                avatarUrl={contact2.avatar_url}
                circle={contact2.circle}
                className="h-12 w-12"
              />
              <div>
                <h3 className="font-medium text-sm">{contact2.name}</h3>
                <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                  {contact2.personal_email || contact2.job_title || contact2.company_name || ""}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-1">
            {matchedOn.map(match => (
              <Badge key={match} variant="outline" className="text-xs">
                {match}
              </Badge>
            ))}
          </div>
          
          <div className="flex justify-between space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onCompare(duplicatePair)}
            >
              Compare
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              className={cn("flex-1", isHighConfidence ? "bg-green-600 hover:bg-green-700" : "")}
              onClick={handleMerge}
              disabled={isMerging}
            >
              {isMerging ? "Merging..." : "Merge Contacts"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
