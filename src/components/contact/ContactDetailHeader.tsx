
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";

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
      <Link to="/circles" className="text-sm text-blue-600 hover:underline flex items-center">
        ← Back to Contacts
      </Link>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onEditClick}>
          <Edit size={16} className="mr-1" />
          Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={onDeleteClick}>
          <Trash size={16} className="mr-1" />
          Delete
        </Button>
      </div>
    </div>
  );
}
