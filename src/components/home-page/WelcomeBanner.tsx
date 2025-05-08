
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface WelcomeBannerProps {
  onAddContact: () => void;
}

export const WelcomeBanner = ({ onAddContact }: WelcomeBannerProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold">Welcome to Circl</h1>
        <p className="text-muted-foreground">
          Your personal relationship manager
        </p>
      </div>
      <Button size="sm" onClick={onAddContact}>
        <Plus size={16} className="mr-1" /> Add Contact
      </Button>
    </div>
  );
};
