
import { CheckCircle } from "lucide-react";

interface MergeSuccessToastProps {
  contactName: string;
}

export const MergeSuccessToast = ({ contactName }: MergeSuccessToastProps) => {
  return (
    <div className="flex items-start space-x-2">
      <CheckCircle className="h-5 w-5 text-green-500" />
      <div>
        <h4 className="font-medium">Contacts merged</h4>
        <p className="text-sm text-muted-foreground">
          Successfully merged contacts into {contactName}. All interactions and data have been combined.
        </p>
      </div>
    </div>
  );
};
