
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ContactForm from "@/components/contact/ContactForm";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useContacts } from "@/hooks/use-contacts";
import NetworkRecommendations from "@/components/home/NetworkRecommendations";
import { RecentContacts } from "@/components/home/RecentContacts";
import { ContactStats } from "@/components/home/ContactStats";
import { WelcomeBanner } from "./WelcomeBanner";
import { useWelcomeTutorial } from "./hooks/use-welcome-tutorial";

const HomeContent = () => {
  const { toast } = useToast();
  const { user } = useAuth();
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

  // Handle the welcome tutorial
  useWelcomeTutorial();

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
      <WelcomeBanner onAddContact={() => setIsAddDialogOpen(true)} />

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

export default HomeContent;
