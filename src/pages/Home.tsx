
import { Button } from "@/components/ui/button";
import { ContactCard, ContactProps } from "@/components/ui/contact-card";
import { StatsCard } from "@/components/ui/stats-card";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

// Mock data for initial UI
const MOCK_CONTACTS: ContactProps[] = [
  {
    id: "1",
    name: "Alex Johnson",
    email: "alex@example.com",
    circle: "inner",
    lastContact: new Date(2023, 4, 15),
    tags: ["Family", "Birthday June 12"],
  },
  {
    id: "2",
    name: "Morgan Smith",
    email: "morgan@example.com",
    circle: "middle",
    lastContact: new Date(2023, 4, 1),
    tags: ["Work", "Design Team"],
  },
  {
    id: "3",
    name: "Taylor Wilson",
    email: "taylor@example.com",
    circle: "outer",
    lastContact: new Date(2023, 3, 20),
    tags: ["Conference", "Marketing"],
  },
];

const Home = () => {
  const { toast } = useToast();
  const [contacts] = useState<ContactProps[]>(MOCK_CONTACTS);

  const innerCircleCount = contacts.filter(
    (contact) => contact.circle === "inner"
  ).length;
  const middleCircleCount = contacts.filter(
    (contact) => contact.circle === "middle"
  ).length;
  const outerCircleCount = contacts.filter(
    (contact) => contact.circle === "outer"
  ).length;

  const handleAddNote = (contact: ContactProps) => {
    toast({
      title: "Add Note",
      description: `Adding a note for ${contact.name}`,
    });
  };

  const handleViewInsights = (contact: ContactProps) => {
    toast({
      title: "View Insights",
      description: `Viewing insights for ${contact.name}`,
    });
  };

  const handleMarkComplete = (contact: ContactProps) => {
    toast({
      title: "Marked Complete",
      description: `Contact with ${contact.name} marked as complete`,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome to Circl</h1>
          <p className="text-muted-foreground">
            Your personal relationship manager
          </p>
        </div>
        <Button size="sm">
          + Add Contact
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Total Contacts"
          value={contacts.length}
          description="All your connections"
        />
        <StatsCard
          title="Circle Distribution"
          value={`${innerCircleCount}/${middleCircleCount}/${outerCircleCount}`}
          description="Inner/Middle/Outer"
        />
        <StatsCard
          title="Follow-ups Due"
          value="2"
          description="Based on contact frequency"
          trend={{ value: 25, isPositive: false }}
        />
      </div>

      <div>
        <h2 className="text-xl font-medium mb-4">Recent Contacts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onAddNote={handleAddNote}
              onViewInsights={handleViewInsights}
              onMarkComplete={handleMarkComplete}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
