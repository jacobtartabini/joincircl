
import { Button } from "@/components/ui/button";
import { ContactCard } from "@/components/ui/contact-card";
import { StatsCard } from "@/components/ui/stats-card";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Contact } from "@/types/contact";
import { contactService } from "@/services/contactService";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ContactForm from "@/components/contact/ContactForm";
import { Plus } from "lucide-react";

const Home = () => {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setIsLoading(true);
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
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, [toast]);

  // Get the most recent contacts (limited to 4)
  const recentContacts = [...contacts]
    .sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 4);

  const innerCircleCount = contacts.filter(
    (contact) => contact.circle === "inner"
  ).length;
  const middleCircleCount = contacts.filter(
    (contact) => contact.circle === "middle"
  ).length;
  const outerCircleCount = contacts.filter(
    (contact) => contact.circle === "outer"
  ).length;

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
          <h1 className="text-3xl font-bold">Welcome to Circl</h1>
          <p className="text-muted-foreground">
            Your personal relationship manager
          </p>
        </div>
        <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
          <Plus size={16} className="mr-1" /> Add Contact
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
          value={String(contacts.length > 0 ? Math.min(2, contacts.length) : 0)}
          description="Based on contact frequency"
          trend={{ value: 25, isPositive: false }}
        />
      </div>

      <div>
        <h2 className="text-xl font-medium mb-4">Recent Contacts</h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : recentContacts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentContacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onAddNote={handleAddNote}
                onViewInsights={handleViewInsights}
                onMarkComplete={handleMarkComplete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border rounded-md bg-muted/30">
            <p className="text-muted-foreground">No contacts added yet.</p>
            <Button 
              variant="link" 
              className="mt-2"
              onClick={() => setIsAddDialogOpen(true)}
            >
              Add your first contact
            </Button>
          </div>
        )}
      </div>

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

export default Home;
