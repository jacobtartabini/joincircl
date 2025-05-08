
import { Button } from "@/components/ui/button";
import { Linkedin, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CircleImportButtonsProps {
  onImportSuccess: () => void;
}

export default function CircleImportButtons({ onImportSuccess }: CircleImportButtonsProps) {
  const { toast } = useToast();

  const handleLinkedInImport = () => {
    // In a real implementation, this would connect to LinkedIn API
    toast({
      title: "LinkedIn Import",
      description: "LinkedIn import feature initiated",
    });

    // Simulate successful import
    setTimeout(() => {
      toast({
        title: "Import Complete",
        description: "Successfully imported LinkedIn connections",
      });
      onImportSuccess();
    }, 1500);
  };

  const handleContactsImport = () => {
    // In a real implementation, this would access contacts API
    toast({
      title: "Contacts Import",
      description: "Contacts import feature initiated",
    });

    // Simulate successful import
    setTimeout(() => {
      toast({
        title: "Import Complete",
        description: "Successfully imported 15 contacts",
      });
      onImportSuccess();
    }, 1500);
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleLinkedInImport}
        className="flex items-center gap-1"
      >
        <Linkedin size={16} />
        Import LinkedIn
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleContactsImport}
        className="flex items-center gap-1"
      >
        <Phone size={16} />
        Import Contacts
      </Button>
    </div>
  );
}
