
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function HomePageHeader() {
  const navigate = useNavigate();

  const handleAddContact = () => {
    navigate("/contacts/new");
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your professional network
        </p>
      </div>
      <Button onClick={handleAddContact} className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Add Contact
      </Button>
    </div>
  );
}
