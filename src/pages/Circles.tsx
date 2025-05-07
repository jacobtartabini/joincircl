
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { contactService } from "@/services/contactService";
import { Contact } from "@/types/contact";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ContactForm from "@/components/contact/ContactForm";
import { ContactCard } from "@/components/ui/contact-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InteractionForm from "@/components/interaction/InteractionForm";
import ConnectionInsights from "@/components/contact/ConnectionInsights";
import { Link } from "react-router-dom";
import { calculateConnectionStrength } from "@/utils/connectionStrength";

const Circles = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isInteractionDialogOpen, setIsInteractionDialogOpen] = useState(false);
  const [isInsightsDialogOpen, setIsInsightsDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = contacts.filter(
        (contact) =>
          contact.name.toLowerCase().includes(query) ||
          contact.company_name?.toLowerCase().includes(query) ||
          contact.job_title?.toLowerCase().includes(query) ||
          contact.location?.toLowerCase().includes(query) ||
          contact.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts(contacts);
    }
  }, [searchQuery, contacts]);

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      const data = await contactService.getContacts();
      setContacts(data);
      setFilteredContacts(data);
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

  const handleAddSuccess = () => {
    setIsAddDialogOpen(false);
    fetchContacts();
    toast({
      title: "Success",
      description: "Contact added successfully.",
    });
  };

  const handleInteractionSuccess = () => {
    setIsInteractionDialogOpen(false);
    setSelectedContact(null);
    fetchContacts();
    toast({
      title: "Success",
      description: "Interaction logged successfully.",
    });
  };

  const handleAddInteraction = (contact: Contact) => {
    setSelectedContact(contact);
    setIsInteractionDialogOpen(true);
  };

  const handleViewInsights = (contact: Contact) => {
    setSelectedContact(contact);
    setIsInsightsDialogOpen(true);
  };

  const innerCircleContacts = filteredContacts.filter(
    (contact) => contact.circle === "inner"
  );
  const middleCircleContacts = filteredContacts.filter(
    (contact) => contact.circle === "middle"
  );
  const outerCircleContacts = filteredContacts.filter(
    (contact) => contact.circle === "outer"
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Circles</h1>
          <p className="text-muted-foreground">
            Manage your contacts in three circles of connection
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus size={16} className="mr-1" /> Add Contact
        </Button>
      </div>

      <div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search contacts..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
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
          ) : filteredContacts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onAddInteraction={handleAddInteraction}
                  onViewInsights={handleViewInsights}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border rounded-md bg-muted/30">
              <h3 className="font-medium mb-2">No contacts found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "No contacts match your search criteria"
                  : "Start by adding your first contact"}
              </p>
              {!searchQuery && (
                <Link 
                  to="#" 
                  className="text-blue-600 hover:underline text-sm font-medium"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  Add your first contact
                </Link>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="inner" className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : innerCircleContacts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {innerCircleContacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onAddInteraction={handleAddInteraction}
                  onViewInsights={handleViewInsights}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border rounded-md bg-muted/30">
              <h3 className="font-medium mb-2">No inner circle contacts found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "No contacts match your search criteria"
                  : "Add contacts to your inner circle for those you connect with frequently"}
              </p>
              {!searchQuery && (
                <Link 
                  to="#" 
                  className="text-blue-600 hover:underline text-sm font-medium"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  Add your first contact
                </Link>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="middle" className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : middleCircleContacts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {middleCircleContacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onAddInteraction={handleAddInteraction}
                  onViewInsights={handleViewInsights}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border rounded-md bg-muted/30">
              <h3 className="font-medium mb-2">No middle circle contacts found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "No contacts match your search criteria"
                  : "Add contacts to your middle circle for regular connections"}
              </p>
              {!searchQuery && (
                <Link 
                  to="#" 
                  className="text-blue-600 hover:underline text-sm font-medium"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  Add your first contact
                </Link>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="outer" className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : outerCircleContacts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {outerCircleContacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onAddInteraction={handleAddInteraction}
                  onViewInsights={handleViewInsights}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border rounded-md bg-muted/30">
              <h3 className="font-medium mb-2">No outer circle contacts found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "No contacts match your search criteria"
                  : "Add contacts to your outer circle for occasional connections"}
              </p>
              {!searchQuery && (
                <Link 
                  to="#" 
                  className="text-blue-600 hover:underline text-sm font-medium"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  Add your first contact
                </Link>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Contact</DialogTitle>
          </DialogHeader>
          <ContactForm
            onSuccess={handleAddSuccess}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isInteractionDialogOpen} onOpenChange={setIsInteractionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Interaction</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <InteractionForm
              contact={selectedContact}
              onSuccess={handleInteractionSuccess}
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
            <div className="pt-4">
              <ConnectionInsights strength={calculateConnectionStrength(selectedContact)} />
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={() => {
                    setIsInsightsDialogOpen(false);
                    setSelectedContact(null);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Circles;
