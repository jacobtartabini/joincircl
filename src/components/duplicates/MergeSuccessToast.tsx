
import React from "react";
import { Check } from "lucide-react";

export interface MergeSuccessToastProps {
  contactName: string;
}

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
