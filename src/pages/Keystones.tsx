
import { Button } from "@/components/ui/button";
import { KeystoneCard, KeystoneProps } from "@/components/ui/keystone-card";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { addDays, startOfMonth } from "date-fns";

// Mock data for initial UI
const generateMockKeystones = (): KeystoneProps[] => {
  const today = new Date();
  const startDate = startOfMonth(today);
  
  return [
    {
      id: "1",
      title: "Birthday Celebration",
      date: addDays(startDate, 5),
      category: "Birthday",
      contactId: "1",
      contactName: "Alex Johnson",
    },
    {
      id: "2",
      title: "Quarterly Coffee Chat",
      date: addDays(startDate, 12),
      category: "Catch-up",
      contactId: "2",
      contactName: "Morgan Smith",
    },
    {
      id: "3",
      title: "Project Milestone",
      date: addDays(startDate, 18),
      category: "Work",
      contactId: "3",
      contactName: "Taylor Wilson",
    },
    {
      id: "4",
      title: "Anniversary Dinner",
      date: addDays(startDate, 22),
      category: "Anniversary",
      contactId: "4",
      contactName: "Jamie Brown",
    },
  ];
};

const Keystones = () => {
  const { toast } = useToast();
  const [keystones] = useState<KeystoneProps[]>(generateMockKeystones());

  const handleKeystoneClick = (keystone: KeystoneProps) => {
    toast({
      title: "Keystone Details",
      description: `Viewing details for ${keystone.title}`,
    });
  };

  const handleAddKeystone = () => {
    toast({
      title: "Add Keystone",
      description: "Opening the add keystone form",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Keystones</h1>
          <p className="text-muted-foreground">
            Important events and milestones
          </p>
        </div>
        <Button size="sm" onClick={handleAddKeystone}>
          + Add Keystone
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {keystones.map((keystone) => (
          <KeystoneCard
            key={keystone.id}
            keystone={keystone}
            onClick={handleKeystoneClick}
          />
        ))}
      </div>
    </div>
  );
};

export default Keystones;
