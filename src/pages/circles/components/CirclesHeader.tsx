
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CircleImportButtons from "@/components/circles/CircleImportButtons";
import { DuplicateDetectionButton } from "@/components/circles/DuplicateDetectionButton";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

interface CirclesHeaderProps {
  onAddContact: () => void;
}

const CirclesHeader = ({ onAddContact }: CirclesHeaderProps) => {
  const isOnline = useOnlineStatus();
  
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Contacts</h1>
        <p className="text-muted-foreground text-sm">
          Manage your network of personal and professional connections
        </p>
      </div>
      
      <div className="flex space-x-2">
        {/* Always show duplicate detection button */}
        <DuplicateDetectionButton />
        
        <div className="hidden md:block">
          <CircleImportButtons onImportSuccess={() => {}} />
        </div>
        
        <Button
          variant="default"
          size="sm"
          onClick={onAddContact}
          disabled={!isOnline}
          className="rounded-md"
        >
          <Plus size={16} className="mr-2" /> 
          Add Contact
        </Button>
      </div>
    </div>
  );
};

export default CirclesHeader;
