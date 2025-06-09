import React from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";

export interface MergeSuccessToastProps {
  contactName: string;
}

// Convert this to a function that triggers the toast instead of a component
export const showMergeSuccessToast = (contactName: string) => {
  toast.success("Contact merged successfully", {
    description: `${contactName || "Contact"} has been merged`,
    icon: <Check size={16} className="text-green-600" />,
  });
};

// Keep the component for backward compatibility
export const MergeSuccessToast: React.FC<MergeSuccessToastProps> = ({ contactName }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-green-500 rounded-full p-1 flex-shrink-0">
        <Check size={14} className="text-white" />
      </div>
      <span>
        <strong>{contactName || "Contact"}</strong> merged successfully
      </span>
    </div>
  );
};
