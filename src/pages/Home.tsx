
import { Button } from "@/components/ui/button";
import { ContactCard } from "@/components/ui/contact-card";
import { StatsCard } from "@/components/ui/stats-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { contactService } from "@/services/contactService";
import { Contact } from "@/types/contact";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InteractionForm } from "@/components/interaction/InteractionForm";
import { ConnectionInsights } from "@/components/contact/ConnectionInsights";
import { NetworkRecommendations } from "@/components/home/NetworkRecommendations";
import { useAuth } from "@/contexts/AuthContext";
import { UserOnboarding } from "@/components/UserOnboarding";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icons } from "@/components/ui/circle-badge";
import { BadgeCheck, BarChart3, RefreshCw, UserCheck, UserPlus } from "lucide-react";

const tabBadges = {
  upcoming: { icon: RefreshCw, color: "text-amber-500" },
  recent: { icon: UserCheck, color: "text-green-500" },
  new: { icon: UserPlus, color: "text-blue-500" },
  due: { icon: BadgeCheck, color: "text-red-500" },
};

const Home = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const { user, hasSeenTutorial, setHasSeenTutorial } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadContacts = async () => {
      setIsLoading(true);
      try {
        const contactsData = await contactService.getContacts();
        setContacts(contactsData);
      } catch (error) {
        console.error("Error loading contacts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContacts();
  }, []);

  const recentContacts = contacts
    .filter((contact) => contact.last_contact)
    .sort((a, b) => {
      return (
        new Date(b.last_contact!).getTime() - new Date(a.last_contact!).getTime()
      );
    })
    .slice(0, 6);

  const newContacts = contacts
    .sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    })
    .slice(0, 6);

  const getContactsDueForFollowUp = () => {
    // Simple logic for demo: contacts without recent interaction
    return contacts
      .filter((contact) => !contact.last_contact || isOlderThanDays(contact.last_contact, 30))
      .slice(0, 6);
  };

  const getUpcomingInteractions = () => {
    // Simple logic for demo: contacts with strong connections that haven't been contacted recently
    return contacts
      .filter((contact) => contact.connection_strength?.level === "strong")
      .filter((contact) => !contact.last_contact || isOlderThanDays(contact.last_contact, 14))
      .slice(0, 6);
  };

  const isOlderThanDays = (dateString: string, days: number): boolean => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays >= days;
  };

  const handleAddNote = (contact: Contact) => {
    setSelectedContact(contact);
    setShowInteractionModal(true);
  };

  const handleViewInsights = (contact: Contact) => {
    setSelectedContact(contact);
    setShowInsightsModal(true);
  };
  
  const handleViewContact = (contact: Contact) => {
    navigate(`/contacts/${contact.id}`);
  };

  const closeInteractionModal = () => {
    setShowInteractionModal(false);
    setSelectedContact(null);
  };

  const closeInsightsModal = () => {
    setShowInsightsModal(false);
    setSelectedContact(null);
  };

  const onInteractionAdded = async () => {
    // Refresh contacts data after adding an interaction
    try {
      const updatedContacts = await contactService.getContacts();
      setContacts(updatedContacts);
    } catch (error) {
      console.error("Error refreshing contacts:", error);
    }
    closeInteractionModal();
  };

  if (!hasSeenTutorial && user) {
    return <UserOnboarding onComplete={() => setHasSeenTutorial(true)} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your network and pending interactions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Total Contacts"
          value={contacts.length}
          description="People in your network"
          icon={Icons.contacts}
        />
        <StatsCard
          title="Due for Follow-up"
          value={getContactsDueForFollowUp().length}
          description="Need your attention"
          icon={Icons.clock}
          iconColor="text-amber-500"
        />
        <StatsCard
          title="Recent Interactions"
          value={
            contacts.filter(
              (c) => c.last_contact && !isOlderThanDays(c.last_contact, 7)
            ).length
          }
          description="In the past week"
          icon={Icons.chart}
          iconColor="text-blue-500"
        />
      </div>

      <NetworkRecommendations />

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid grid-cols-4">
          {Object.entries(tabBadges).map(([key, { icon: Icon, color }]) => (
            <TabsTrigger value={key} key={key} className="flex items-center gap-2">
              <Icon size={16} className={color} />
              <span className="capitalize">{key}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="upcoming" className="mt-4">
          <h2 className="text-xl font-semibold mb-4">Upcoming Follow-ups</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getUpcomingInteractions().length > 0 ? (
              getUpcomingInteractions().map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onAddInteraction={() => handleAddNote(contact)}
                  onViewInsights={() => handleViewInsights(contact)}
                  onMarkComplete={() => handleViewContact(contact)}
                />
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <p className="text-muted-foreground">No upcoming follow-ups</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="mt-4">
          <h2 className="text-xl font-semibold mb-4">Recently Contacted</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentContacts.length > 0 ? (
              recentContacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onAddInteraction={() => handleAddNote(contact)}
                  onViewInsights={() => handleViewInsights(contact)}
                  onMarkComplete={() => handleViewContact(contact)}
                />
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <p className="text-muted-foreground">No recent contacts</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="new" className="mt-4">
          <h2 className="text-xl font-semibold mb-4">New Contacts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {newContacts.length > 0 ? (
              newContacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onAddInteraction={() => handleAddNote(contact)}
                  onViewInsights={() => handleViewInsights(contact)}
                  onMarkComplete={() => handleViewContact(contact)}
                />
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <p className="text-muted-foreground">No new contacts</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="due" className="mt-4">
          <h2 className="text-xl font-semibold mb-4">Due for Follow-up</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getContactsDueForFollowUp().length > 0 ? (
              getContactsDueForFollowUp().map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onAddInteraction={() => handleAddNote(contact)}
                  onViewInsights={() => handleViewInsights(contact)}
                  onMarkComplete={() => handleViewContact(contact)}
                />
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <p className="text-muted-foreground">No follow-ups due</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showInteractionModal} onOpenChange={closeInteractionModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Interaction</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <InteractionForm
              contactId={selectedContact.id}
              onSuccess={onInteractionAdded}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showInsightsModal} onOpenChange={closeInsightsModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connection Insights</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <ConnectionInsights contactId={selectedContact.id} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
