
import { Button } from "@/components/ui/button";
import { ContactCard, ContactProps } from "@/components/ui/contact-card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Search, Linkedin, Phone } from "lucide-react";
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
  {
    id: "4",
    name: "Jamie Brown",
    email: "jamie@example.com",
    circle: "inner",
    lastContact: new Date(2023, 4, 10),
    tags: ["College", "Roommate"],
  },
  {
    id: "5",
    name: "Casey Garcia",
    email: "casey@example.com",
    circle: "middle",
    lastContact: new Date(2023, 4, 5),
    tags: ["Work", "Project X"],
  },
];

const Circles = () => {
  const { toast } = useToast();
  const [contacts] = useState<ContactProps[]>(MOCK_CONTACTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCircle, setActiveCircle] = useState<string | null>(null);

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (activeCircle === null || contact.circle === activeCircle)
  );

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

  const handleImportLinkedIn = () => {
    toast({
      title: "LinkedIn Import",
      description: "Starting LinkedIn import process...",
    });
  };

  const handleImportPhone = () => {
    toast({
      title: "Phone Contacts Import",
      description: "Starting phone contacts import process...",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Your Circles</h1>
          <p className="text-muted-foreground">
            Manage your relationships by circle
          </p>
        </div>
        <Button size="sm">
          + Add Contact
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all" onClick={() => setActiveCircle(null)}>
            All
          </TabsTrigger>
          <TabsTrigger value="inner" onClick={() => setActiveCircle("inner")}>
            Inner Circle
          </TabsTrigger>
          <TabsTrigger value="middle" onClick={() => setActiveCircle("middle")}>
            Middle Circle
          </TabsTrigger>
          <TabsTrigger value="outer" onClick={() => setActiveCircle("outer")}>
            Outer Circle
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-0">
          {/* Content will be displayed for all tabs */}
        </TabsContent>
        <TabsContent value="inner" className="mt-0">
          {/* Content will be displayed for all tabs */}
        </TabsContent>
        <TabsContent value="middle" className="mt-0">
          {/* Content will be displayed for all tabs */}
        </TabsContent>
        <TabsContent value="outer" className="mt-0">
          {/* Content will be displayed for all tabs */}
        </TabsContent>
      </Tabs>

      <div className="flex flex-col md:flex-row gap-4 md:items-center">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <Input
            placeholder="Search contacts..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-shrink-0"
            onClick={handleImportLinkedIn}
          >
            <Linkedin size={16} className="mr-1" /> Import LinkedIn
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-shrink-0"
            onClick={handleImportPhone}
          >
            <Phone size={16} className="mr-1" /> Import Phone
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredContacts.map((contact) => (
          <ContactCard
            key={contact.id}
            contact={contact}
            onAddNote={handleAddNote}
            onViewInsights={handleViewInsights}
            onMarkComplete={handleMarkComplete}
          />
        ))}
        {filteredContacts.length === 0 && (
          <div className="col-span-2 text-center py-8 text-muted-foreground">
            No contacts found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default Circles;
