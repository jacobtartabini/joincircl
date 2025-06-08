
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface WelcomeBannerProps {
  onAddContact: () => void;
}

export const WelcomeBanner = ({ onAddContact }: WelcomeBannerProps) => {
  const navigate = useNavigate();
  const currentHour = new Date().getHours();
  
  let greeting = "Good morning";
  if (currentHour >= 12 && currentHour < 18) {
    greeting = "Good afternoon";
  } else if (currentHour >= 18) {
    greeting = "Good evening";
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg shadow-sm border border-blue-100">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{greeting}</h1>
          <p className="text-muted-foreground mt-1">
            Welcome to your personal relationship manager. Stay connected with what matters.
          </p>
        </div>
        <div className="flex gap-2 self-start">
          <Button size="sm" onClick={onAddContact} className="shadow-sm">
            <Plus size={16} className="mr-1" /> Add Contact
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/keystones")}
            className="shadow-sm"
          >
            <Plus size={16} className="mr-1" /> Add Keystone
          </Button>
        </div>
      </div>
    </div>
  );
};
