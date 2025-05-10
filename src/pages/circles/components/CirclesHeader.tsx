
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface CirclesHeaderProps {
  onAddContact: () => void;
}

export function CirclesHeader({ onAddContact }: CirclesHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <div className={`flex ${isMobile ? 'flex-col gap-4' : 'justify-between items-center'}`}>
      <div>
        <h1 className={`text-2xl md:text-3xl font-bold ${isMobile ? 'mb-1' : ''}`}>Circles</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Organize your network in concentric circles of connection
        </p>
      </div>
      {!isMobile && (
        <Button size="sm" onClick={onAddContact}>
          <Plus size={16} className="mr-1" /> Add Contact
        </Button>
      )}
    </div>
  );
}
