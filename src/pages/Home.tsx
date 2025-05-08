
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ContactForm from "@/components/contact/ContactForm";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import NetworkRecommendations from "@/components/home/NetworkRecommendations";
import { useContacts } from "@/hooks/use-contacts";
import { RecentContacts } from "@/components/home/RecentContacts";
import { ContactStats } from "@/components/home/ContactStats";

const Home = () => {
  const { toast } = useToast();
  const { user, hasSeenTutorial, setHasSeenTutorial } = useAuth();
  const { 
    contacts, 
    isLoading, 
    followUpStats, 
    getContactDistribution, 
    getRecentContacts, 
    fetchContacts 
  } = useContacts();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Get the most recent contacts (limited to 4)
  const recentContacts = getRecentContacts(4);
  const distribution = getContactDistribution();

  useEffect(() => {
    // Save that the user has seen the tutorial
    if (!hasSeenTutorial && user) {
      const updateUserTutorialStatus = async () => {
        try {
          // Safely update the profile with the has_seen_tutorial property
          const { error } = await supabase
            .from('profiles')
            .update({ has_seen_tutorial: true })
            .eq('id', user.id);
            
          if (!error) {
            setHasSeenTutorial(true);
          } else {
            console.error("Error updating tutorial status:", error);
          }
        } catch (error) {
          console.error("Error updating tutorial status:", error);
        }
      };
      
      updateUserTutorialStatus();
    }
  }, [user, hasSeenTutorial, setHasSeenTutorial]);

  const handleContactAdded = async () => {
    try {
      await fetchContacts();
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

      <ContactStats 
        totalContacts={contacts.length}
        distribution={distribution}
        followUpStats={followUpStats}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentContacts 
            contacts={recentContacts}
            isLoading={isLoading}
            onContactChange={fetchContacts}
            onAddContact={() => setIsAddDialogOpen(true)}
          />
        </div>

        <div>
          <NetworkRecommendations />
        </div>
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
