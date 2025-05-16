
import { Button } from "@/components/ui/button";
import { Plus, Merge } from "lucide-react";
import CircleImportButtons from "@/components/circles/CircleImportButtons";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { Link } from "react-router-dom";

interface CirclesHeaderProps {
  onAddContact: () => void;
  hasDuplicates?: boolean;
}

const CirclesHeader = ({ onAddContact, hasDuplicates = false }: CirclesHeaderProps) => {
  const isOnline = useOnlineStatus();
  
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold">Contacts</h1>
        <p className="text-muted-foreground mt-1">
          Manage your network of personal and professional connections
        </p>
      </div>
      
      <div className="flex space-x-2">
        {hasDuplicates && (
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex"
            asChild
          >
            <Link to="/duplicates">
              <Merge size={16} className="mr-2" /> 
              Review Duplicates
            </Link>
          </Button>
        )}
        
        <div className="hidden md:block">
          <CircleImportButtons onImportSuccess={() => {}} />
        </div>
        
        <Button
          variant="default"
          size="sm"
          onClick={onAddContact}
          disabled={!isOnline}
        >
          <Plus size={16} className="mr-2" /> 
          New Contact
        </Button>
      </div>
    </div>
  );
};

export default CirclesHeader;
