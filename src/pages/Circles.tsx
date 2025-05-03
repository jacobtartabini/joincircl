
import { Button } from "@/components/ui/button";
import { ContactCard } from "@/components/ui/contact-card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Search, Linkedin, Phone, Plus, FileText, BarChart } from "lucide-react";
import { useState, useEffect } from "react";
import { Contact, Interaction } from "@/types/contact";
import { contactService } from "@/services/contactService";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ContactForm from "@/components/contact/ContactForm";
import { useNavigate } from "react-router-dom";
import { ConnectionStrength } from "@/types/contact";
import { calculateConnectionStrength } from "@/utils/connectionStrength";

const Circles = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCircle, setActiveCircle] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLinkedInImportDialogOpen, setIsLinkedInImportDialogOpen] = useState(false);
  const [isPhoneImportDialogOpen, setIsPhoneImportDialogOpen] = useState(false);
  const [isAddNoteDialogOpen, setIsAddNoteDialogOpen] = useState(false);
  const [isInsightsDialogOpen, setIsInsightsDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [interactions, setInteractions] = useState<Record<string, Interaction[]>>({});
  const [connectionStrengths, setConnectionStrengths] = useState<Record<string, ConnectionStrength>>({});
  const [noteText, setNoteText] = useState("");
  
  useEffect(() => {
    async function fetchContacts() {
      setLoading(true);
      try {
        const data = await contactService.getContacts();
        setContacts(data);
        
        // Fetch interactions for all contacts
        const interactionsData: Record<string, Interaction[]> = {};
        const strengthsData: Record<string, ConnectionStrength> = {};
        
        for (const contact of data) {
          const contactInteractions = await contactService.getInteractionsByContactId(contact.id);
          interactionsData[contact.id] = contactInteractions;
          
          // Calculate connection strength for each contact
          strengthsData[contact.id] = calculateConnectionStrength(contact, contactInteractions);
        }
        
        setInteractions(interactionsData);
        setConnectionStrengths(strengthsData);
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
    setSelectedContact(contact);
    setNoteText("");
    setIsAddNoteDialogOpen(true);
  };

  const handleViewInsights = (contact: Contact) => {
    setSelectedContact(contact);
    setIsInsightsDialogOpen(true);
  };

  const handleMarkComplete = (contact: Contact) => {
    // Navigate to contact details page
    navigate(`/contacts/${contact.id}`);
  };

  const handleImportLinkedIn = () => {
    setIsLinkedInImportDialogOpen(true);
  };

  const handleImportPhone = () => {
    setIsPhoneImportDialogOpen(true);
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
  
  const handleSaveNote = async () => {
    if (!selectedContact || !noteText.trim()) return;
    
    try {
      // Add the interaction
      await contactService.addInteraction({
        contact_id: selectedContact.id,
        type: "Note",
        notes: noteText,
        date: new Date().toISOString()
      });
      
      // Update the last_contact date
      await contactService.updateContact(selectedContact.id, {
        last_contact: new Date().toISOString()
      });
      
      // Refresh interactions for this contact
      const refreshedInteractions = await contactService.getInteractionsByContactId(selectedContact.id);
      setInteractions({
        ...interactions,
        [selectedContact.id]: refreshedInteractions
      });
      
      // Close dialog
      setIsAddNoteDialogOpen(false);
      toast({
        title: "Success",
        description: "Note added successfully.",
      });
    } catch (error) {
      console.error("Error adding note:", error);
      toast({
        title: "Error",
        description: "Failed to add note. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const importLinkedInMockData = async () => {
    try {
      const mockLinkedInContacts = [
        { name: "Jane Doe", email: "jane.doe@example.com", circle: "middle" as const, tags: ["LinkedIn", "Tech"] },
        { name: "John Smith", email: "john.smith@example.com", circle: "outer" as const, tags: ["LinkedIn", "Marketing"] },
        { name: "Alice Johnson", email: "alice.j@example.com", circle: "outer" as const, tags: ["LinkedIn", "HR"] }
      ];
      
      toast({
        title: "Importing contacts",
        description: "Please wait while we import your LinkedIn contacts...",
      });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      for (const mockContact of mockLinkedInContacts) {
        await contactService.createContact(mockContact);
      }
      
      const updatedContacts = await contactService.getContacts();
      setContacts(updatedContacts);
      
      setIsLinkedInImportDialogOpen(false);
      toast({
        title: "Success",
        description: `Imported ${mockLinkedInContacts.length} contacts from LinkedIn.`,
      });
    } catch (error) {
      console.error("Error importing LinkedIn contacts:", error);
      toast({
        title: "Error",
        description: "Failed to import LinkedIn contacts. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const importPhoneMockData = async () => {
    try {
      const mockPhoneContacts = [
        { name: "Michael Brown", phone: "555-123-4567", circle: "middle" as const, tags: ["Phone Contact"] },
        { name: "Sarah Wilson", phone: "555-987-6543", circle: "outer" as const, tags: ["Phone Contact"] },
        { name: "David Lee", phone: "555-567-8901", circle: "outer" as const, tags: ["Phone Contact"] }
      ];
      
      toast({
        title: "Importing contacts",
        description: "Please wait while we import your phone contacts...",
      });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      for (const mockContact of mockPhoneContacts) {
        await contactService.createContact(mockContact);
      }
      
      const updatedContacts = await contactService.getContacts();
      setContacts(updatedContacts);
      
      setIsPhoneImportDialogOpen(false);
      toast({
        title: "Success",
        description: `Imported ${mockPhoneContacts.length} contacts from phone.`,
      });
    } catch (error) {
      console.error("Error importing phone contacts:", error);
      toast({
        title: "Error",
        description: "Failed to import phone contacts. Please try again.",
        variant: "destructive",
      });
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
              onAddNote={() => handleAddNote(contact)}
              onViewInsights={() => handleViewInsights(contact)}
              onMarkComplete={() => handleMarkComplete(contact)}
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

      {/* Add Contact Dialog */}
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

      {/* LinkedIn Import Dialog */}
      <Dialog open={isLinkedInImportDialogOpen} onOpenChange={setIsLinkedInImportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Import LinkedIn Contacts</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p>Connect your LinkedIn account to import your connections.</p>
            <p className="text-sm text-muted-foreground">
              This will import your LinkedIn connections as contacts in your Circl app.
            </p>

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsLinkedInImportDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={importLinkedInMockData}>
                Connect to LinkedIn
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Phone Import Dialog */}
      <Dialog open={isPhoneImportDialogOpen} onOpenChange={setIsPhoneImportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Import Phone Contacts</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p>Allow access to your phone contacts to import them.</p>
            <p className="text-sm text-muted-foreground">
              This will import your phone contacts into your Circl app. You'll be able to select which contacts to import.
            </p>

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsPhoneImportDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={importPhoneMockData}>
                Allow Access
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={isAddNoteDialogOpen} onOpenChange={setIsAddNoteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {selectedContact && (
              <p className="text-sm">
                Adding a note for <span className="font-medium">{selectedContact.name}</span>
              </p>
            )}
            
            <div className="space-y-2">
              <label htmlFor="note" className="text-sm font-medium">Note</label>
              <textarea
                id="note"
                className="w-full p-2 border rounded-md min-h-[100px]"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="What would you like to note about this contact?"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsAddNoteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveNote}>
                Save Note
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Insights Dialog */}
      <Dialog open={isInsightsDialogOpen} onOpenChange={setIsInsightsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Connection Insights</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {selectedContact && connectionStrengths[selectedContact.id] && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Connection Strength</span>
                  <div className="flex items-center">
                    <span className={`text-sm font-medium ${
                      connectionStrengths[selectedContact.id].level === "strong" 
                        ? "text-green-600" 
                        : connectionStrengths[selectedContact.id].level === "moderate"
                          ? "text-amber-600"
                          : "text-red-600"
                    }`}>
                      {connectionStrengths[selectedContact.id].level.charAt(0).toUpperCase() + 
                        connectionStrengths[selectedContact.id].level.slice(1)}
                    </span>
                    <div className="ml-2 w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          connectionStrengths[selectedContact.id].level === "strong" 
                            ? "bg-green-600" 
                            : connectionStrengths[selectedContact.id].level === "moderate"
                              ? "bg-amber-600"
                              : "bg-red-600"
                        }`}
                        style={{ width: `${(connectionStrengths[selectedContact.id].score / 100) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-3 bg-muted/30">
                  <h4 className="text-sm font-medium mb-2">Suggestions to strengthen connection:</h4>
                  <ul className="text-sm space-y-1 list-disc pl-5">
                    {connectionStrengths[selectedContact.id].suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Recent Interactions</h4>
                  {interactions[selectedContact.id]?.length > 0 ? (
                    <div className="space-y-2">
                      {interactions[selectedContact.id]?.slice(0, 3).map(interaction => (
                        <div key={interaction.id} className="text-sm border-b pb-1">
                          <div className="flex justify-between">
                            <span className="font-medium">{interaction.type}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(interaction.date).toLocaleDateString()}
                            </span>
                          </div>
                          {interaction.notes && <p className="mt-1 text-xs">{interaction.notes}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No recent interactions</p>
                  )}
                </div>
              </>
            )}
            
            <div className="flex justify-end gap-2">
              <Button onClick={() => setIsInsightsDialogOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Circles;
