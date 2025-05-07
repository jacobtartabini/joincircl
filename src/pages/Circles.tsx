
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { contactService } from "@/services/contactService";
import { Contact } from "@/types/contact";
import { ContactCard } from "@/components/ui/contact-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ContactForm from "@/components/contact/ContactForm";
import InteractionForm from "@/components/interaction/InteractionForm";
import { Plus } from "lucide-react";
import ConnectionInsights from "@/components/contact/ConnectionInsights";
import { calculateConnectionStrength } from "@/utils/connectionStrength";

const Circles = () => {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isInteractionDialogOpen, setIsInteractionDialogOpen] = useState(false);
  const [isInsightsDialogOpen, setIsInsightsDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  useEffect(() => {
    fetchContacts();
  }, []);

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

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsEditDialogOpen(true);
  };

  const handleAddInteraction = (contact: Contact) => {
    setSelectedContact(contact);
    setIsInteractionDialogOpen(true);
  };

  const handleViewInsights = (contact: Contact) => {
    setSelectedContact(contact);
    setIsInsightsDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsInteractionDialogOpen(false);
    setSelectedContact(null);
    fetchContacts();
  };

  // Group contacts by circle
  const allContacts = contacts;
  const innerCircleContacts = contacts.filter(c => c.circle === "inner");
  const middleCircleContacts = contacts.filter(c => c.circle === "middle");
  const outerCircleContacts = contacts.filter(c => c.circle === "outer");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Circles</h1>
          <p className="text-muted-foreground">
            Organize your network in concentric circles of connection
          </p>
        </div>
        <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
          <Plus size={16} className="mr-1" /> Add Contact
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="inner">Inner Circle</TabsTrigger>
          <TabsTrigger value="middle">Middle Circle</TabsTrigger>
          <TabsTrigger value="outer">Outer Circle</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : allContacts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allContacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onAddNote={() => handleAddInteraction(contact)}
                  onViewInsights={() => handleViewInsights(contact)}
                  onMarkComplete={() => handleEditContact(contact)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border rounded-md bg-muted/30">
              <p className="text-muted-foreground">No contacts yet.</p>
              <Button 
                variant="link" 
                className="mt-2"
                onClick={() => setIsAddDialogOpen(true)}
              >
                Add your first contact
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="inner" className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : innerCircleContacts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {innerCircleContacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onAddNote={() => handleAddInteraction(contact)}
                  onViewInsights={() => handleViewInsights(contact)}
                  onMarkComplete={() => handleEditContact(contact)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border rounded-md bg-muted/30">
              <p className="text-muted-foreground">No inner circle contacts yet.</p>
              <Button 
                variant="link" 
                className="mt-2"
                onClick={() => setIsAddDialogOpen(true)}
              >
                Add your first contact
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="middle" className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : middleCircleContacts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {middleCircleContacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onAddNote={() => handleAddInteraction(contact)}
                  onViewInsights={() => handleViewInsights(contact)}
                  onMarkComplete={() => handleEditContact(contact)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border rounded-md bg-muted/30">
              <p className="text-muted-foreground">No middle circle contacts yet.</p>
              <Button 
                variant="link" 
                className="mt-2"
                onClick={() => setIsAddDialogOpen(true)}
              >
                Add your first contact
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="outer" className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : outerCircleContacts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {outerCircleContacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onAddNote={() => handleAddInteraction(contact)}
                  onViewInsights={() => handleViewInsights(contact)}
                  onMarkComplete={() => handleEditContact(contact)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border rounded-md bg-muted/30">
              <p className="text-muted-foreground">No outer circle contacts yet.</p>
              <Button 
                variant="link" 
                className="mt-2"
                onClick={() => setIsAddDialogOpen(true)}
              >
                Add your first contact
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
          </DialogHeader>
          <ContactForm
            onSuccess={handleDialogSuccess}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <ContactForm
              contact={selectedContact}
              onSuccess={handleDialogSuccess}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedContact(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isInteractionDialogOpen} onOpenChange={setIsInteractionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedContact ? `Log Interaction with ${selectedContact.name}` : 'Log Interaction'}
            </DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <InteractionForm
              contact={selectedContact}
              onSuccess={handleDialogSuccess}
              onCancel={() => {
                setIsInteractionDialogOpen(false);
                setSelectedContact(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isInsightsDialogOpen} onOpenChange={setIsInsightsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Connection Insights</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <ConnectionInsights 
              strength={
                selectedContact.connection_strength || 
                calculateConnectionStrength(selectedContact)
              } 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Circles;
