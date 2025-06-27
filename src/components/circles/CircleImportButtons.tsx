
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Import } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PopoverContent, PopoverTrigger, Popover } from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";

interface CircleImportButtonsProps {
  onImportSuccess: () => void;
  className?: string;
}

const CircleImportButtons = ({ onImportSuccess, className = "" }: CircleImportButtonsProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const handleImportClick = () => {
    toast({
      title: "Import",
      description: "Import feature coming soon",
    });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`h-12 px-4 flex items-center gap-2 rounded-full border-gray-200 hover:bg-gray-50 transition-all duration-200 ${className}`}
        >
          <Import className="h-4 w-4" />
          <span className="text-sm font-medium">Import</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-56 p-3" 
        align={isMobile ? "center" : "end"}
        sideOffset={isMobile ? 8 : 4}
      >
        <div className="grid gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full rounded-full"
            onClick={handleImportClick}
          >
            Import from Google
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full rounded-full"
            onClick={handleImportClick}
          >
            Import from CSV
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CircleImportButtons;
