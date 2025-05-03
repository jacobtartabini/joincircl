
import { Button } from "@/components/ui/button";
import { ContactCard } from "@/components/ui/contact-card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Search, Linkedin, Phone, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { Contact } from "@/types/contact";
import { contactService } from "@/services/contactService";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ContactForm from "@/components/contact/ContactForm";

const Circles = () => {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCircle, setActiveCircle] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchContacts() {
      setLoading(true);
      try {
        const data = await contactService.getContacts();
        setContacts(data);
      } catch (error) {
        console.error("Error fetching contacts:", error);
        toast({
          title: "Error",
          description: "Failed to load contacts. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchContacts();
  }, [toast]);

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (activeCircle === null || contact.circle === activeCircle)
  );

  const handleAddNote = (contact: Contact) => {
    toast({
      title: "Add Note",
      description: `Adding a note for ${contact.name}`,
    });
  };

  const handleViewInsights = (contact: Contact) => {
    toast({
      title: "View Insights",
      description: `Viewing insights for ${contact.name}`,
    });
  };

  const handleMarkComplete = (contact: Contact) => {
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

  const handleCreateContact = async () => {
    setIsAddDialogOpen(true);
  };

  const handleContactAdded = async () => {
    try {
      const data = await contactService.getContacts();
      setContacts(data);
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Contact added successfully.",
      });
    } catch (error) {
      console.error("Error refreshing contacts:", error);
    }
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
        <Button size="sm" onClick={handleCreateContact}>
          <Plus size={16} className="mr-1" /> Add Contact
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

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
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
              {searchTerm
                ? "No contacts found matching your search."
                : "No contacts in this circle yet. Add your first contact!"}
            </div>
          )}
        </div>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
          </DialogHeader>
          <ContactForm 
            onSuccess={handleContactAdded}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Circles;
