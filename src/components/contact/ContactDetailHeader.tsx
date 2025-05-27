
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Edit, Trash, ArrowLeft } from "lucide-react";

interface ContactDetailHeaderProps {
  onEditClick: () => void;
  onDeleteClick: () => void;
}

export default function ContactDetailHeader({ 
  onEditClick, 
  onDeleteClick 
}: ContactDetailHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <Link 
        to="/circles" 
        className="flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-colors font-medium"
      >
        <ArrowLeft size={20} />
        Back to Contacts
      </Link>
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onEditClick}
          className="border-gray-200 hover:bg-gray-50 font-semibold shadow-sm"
        >
          <Edit size={16} className="mr-2" />
          Edit Contact
        </Button>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={onDeleteClick}
          className="font-semibold shadow-sm"
        >
          <Trash size={16} className="mr-2" />
          Delete Contact
        </Button>
      </div>
    </div>
  );
}
