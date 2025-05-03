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
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Home = () => {
  const { toast } = useToast();
  const { user, profile, hasSeenTutorial, setHasSeenTutorial } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [followUpStats, setFollowUpStats] = useState({
    due: 0,
    trend: { value: 0, isPositive: true },
  });

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setIsLoading(true);
        const data = await contactService.getContacts();
        setContacts(data);
        calculateFollowUpStats(data);
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
    
    // Save that the user has seen the tutorial
    if (!hasSeenTutorial && user) {
      const updateUserTutorialStatus = async () => {
        try {
          await supabase
            .from('profiles')
            .update({ has_seen_tutorial: true })
            .eq('id', user.id);
          setHasSeenTutorial(true);
        } catch (error) {
          console.error("Error updating tutorial status:", error);
        }
      };
      
      updateUserTutorialStatus();
    }
  }, [toast, user, hasSeenTutorial, setHasSeenTutorial]);
  
  const calculateFollowUpStats = (contactsData: Contact[]) => {
    // Calculate number of follow-ups due
    const followUpsDue = contactsData.filter(contact => {
      if (!contact.last_contact) return true; // If never contacted, a follow-up is due
      
      const lastContactDate = new Date(contact.last_contact);
      const today = new Date();
      const daysSinceLastContact = Math.floor((today.getTime() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Determine follow-up frequency based on circle
      let followUpFrequency = 30; // Default (outer circle)
      if (contact.circle === "inner") followUpFrequency = 7;
      else if (contact.circle === "middle") followUpFrequency = 14;
      
      return daysSinceLastContact >= followUpFrequency;
    }).length;
    
    // Calculate trend (comparing to previous week)
    // This is a simplified calculation - in a real app you'd compare to historical data
    const previousFollowUps = contactsData.length > 0 ? Math.round(contactsData.length * 0.15) : 0;
    const changePercent = previousFollowUps > 0 
      ? Math.round(((followUpsDue - previousFollowUps) / previousFollowUps) * 100)
      : 0;
    
    setFollowUpStats({
      due: followUpsDue,
      trend: {
        value: Math.abs(changePercent),
        isPositive: changePercent <= 0,
      }
    });
  };

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
      title: "View Contact",
      description: `Viewing contact details for ${contact.name}`,
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
          value={String(followUpStats.due)}
          description="Based on contact frequency"
          trend={followUpStats.due > 0 ? followUpStats.trend : undefined}
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
