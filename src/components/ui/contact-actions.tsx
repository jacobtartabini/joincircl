
import { Button } from "@/components/ui/button";
import { Eye, BarChart, MessageSquare } from "lucide-react";
import { Contact } from "@/types/contact";

interface ContactActionsProps {
  onView: () => void;
  onViewInsights?: () => void;
  onAddInteraction?: () => void;
}

export const ContactActions = ({ 
  onView, 
  onViewInsights, 
  onAddInteraction 
}: ContactActionsProps) => {
  return (
    <div className="flex gap-2 mt-3">
      <Button
        variant="outline"
        size="sm"
        className="flex-1"
        onClick={onView}
      >
        <Eye size={16} className="sm:mr-1" /> 
        <span className="hidden sm:inline">View</span>
      </Button>
      {onViewInsights && (
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={onViewInsights}
        >
          <BarChart size={16} className="sm:mr-1" /> 
          <span className="hidden sm:inline">Insights</span>
        </Button>
      )}
      {onAddInteraction && (
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={onAddInteraction}
        >
          <MessageSquare size={16} className="sm:mr-1" /> 
          <span className="hidden sm:inline">Interaction</span>
        </Button>
      )}
    </div>
  );
};
