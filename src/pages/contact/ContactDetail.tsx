
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Contact, Interaction, ContactMedia } from "@/types/contact";
import { Keystone } from "@/types/keystone";
import { contactService } from "@/services/contactService";
import { keystoneService } from "@/services/keystoneService";
import { contactMediaService } from "@/services/contactMediaService";
import { useToast } from "@/hooks/use-toast";
import ConnectionInsights from "@/components/contact/ConnectionInsights";
import { calculateConnectionStrength } from "@/utils/connectionStrength";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ContactForm from "@/components/contact/ContactForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Edit, Trash } from "lucide-react";
import ContactInfo from "@/components/contact/ContactInfo";
import ContactKeystones from "@/components/contact/ContactKeystones";
import ContactInteractions from "@/components/contact/ContactInteractions";
import ContactMediaSection from "@/components/contact/ContactMediaSection";

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contact, setContact] = useState<Contact | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [keystones, setKeystones] = useState<Keystone[]>([]);
  const [contactMedia, setContactMedia] = useState<ContactMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  useEffect(() => {
    async function loadContactData() {
      if (!id) return;
      setLoading(true);
      try {
        const contactData = await contactService.getContact(id);
        const interactionsData = await contactService.getInteractionsByContactId(id);
        const keystonesData = await keystoneService.getKeystonesByContactId(id);
        let mediaData: ContactMedia[] = [];
        try {
          mediaData = await contactMediaService.getContactMedia(id);
        } catch (error) {
          console.error("Error loading contact media:", error);
          // Don't fail the entire page load if media loading fails
        }
        setContact(contactData);
        setInteractions(interactionsData);
        setKeystones(keystonesData);
        setContactMedia(mediaData);
      } catch (error) {
        console.error("Error loading contact data:", error);
        toast({
          title: "Error",
          description: "Could not load contact data. Please try again.",
          variant: "destructive"
        });
        navigate("/circles");
      } finally {
        setLoading(false);
      }
    }
    loadContactData();
  }, [id, navigate, toast]);
  
  const handleDelete = async () => {
    if (!contact?.id) return;
    try {
      await contactService.deleteContact(contact.id);
      toast({
        title: "Contact deleted",
        description: "The contact has been successfully deleted."
      });
      navigate("/circles");
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast({
        title: "Error",
        description: "Failed to delete contact. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleContactUpdate = async (updatedContact: Contact, previousBirthday?: string | null) => {
    if (!id) return;
    try {
      const refreshedContact = await contactService.getContact(id);
      setContact(refreshedContact);
      setIsEditDialogOpen(false);
      
      // Check if birthday was added or changed
      if (updatedContact.birthday && (!previousBirthday || updatedContact.birthday !== previousBirthday)) {
        // Check if there's already a birthday keystone for this contact
        const existingBirthdayKeystone = keystones.find(
          k => k.category === "Birthday" && k.contact_id === contact?.id
        );
        
        if (!existingBirthdayKeystone) {
          try {
            const birthdayDate = new Date(updatedContact.birthday);
            const currentYear = new Date().getFullYear();
            birthdayDate.setFullYear(currentYear);
            
            // If birthday has already passed this year, set for next year
            if (birthdayDate < new Date()) {
              birthdayDate.setFullYear(currentYear + 1);
            }
            
            await keystoneService.createKeystone({
              title: `${updatedContact.name}'s Birthday`,
              date: birthdayDate.toISOString(),
              contact_id: updatedContact.id,
              category: "Birthday",
              is_recurring: true,
              recurrence_frequency: "Yearly"
            });
            
            // Refresh keystones
            const updatedKeystones = await keystoneService.getKeystonesByContactId(id);
            setKeystones(updatedKeystones);
            
            toast({
              title: "Birthday reminder created",
              description: `A yearly reminder for ${updatedContact.name}'s birthday has been added.`
            });
          } catch (error) {
            console.error("Error creating birthday keystone:", error);
          }
        } else {
          // Update existing birthday keystone if date changed
          if (previousBirthday && updatedContact.birthday !== previousBirthday) {
            try {
              const birthdayDate = new Date(updatedContact.birthday);
              const existingDate = new Date(existingBirthdayKeystone.date);
              
              // Keep same month/day but update to current year
              birthdayDate.setFullYear(existingDate.getFullYear());
              
              await keystoneService.updateKeystone(existingBirthdayKeystone.id, {
                title: `${updatedContact.name}'s Birthday`,
                date: birthdayDate.toISOString()
              });
              
              // Refresh keystones
              const updatedKeystones = await keystoneService.getKeystonesByContactId(id);
              setKeystones(updatedKeystones);
            } catch (error) {
              console.error("Error updating birthday keystone:", error);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error refreshing contact:", error);
    }
  };
  
  const handleKeystoneAdded = async () => {
    if (!id) return;
    try {
      const updatedKeystones = await keystoneService.getKeystonesByContactId(id);
      setKeystones(updatedKeystones);
    } catch (error) {
      console.error("Error refreshing keystones:", error);
    }
  };
  
  const handleInteractionAdded = async () => {
    if (!id) return;
    try {
      const updatedContact = await contactService.getContact(id);
      const updatedInteractions = await contactService.getInteractionsByContactId(id);
      setContact(updatedContact);
      setInteractions(updatedInteractions);
    } catch (error) {
      console.error("Error refreshing interactions:", error);
    }
  };
  
  const connectionStrength = contact ? calculateConnectionStrength(contact, interactions) : null;
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading contact details...</p>
        </div>
      </div>
    );
  }
  
  if (!contact) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">Contact not found</h2>
        <p className="mb-6">The contact you're looking for doesn't exist or you don't have access to it.</p>
        <Link to="/circles">
          <Button>Back to Contacts</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <Link to="/circles" className="text-sm text-blue-600 hover:underline flex items-center">
          ← Back to Contacts
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
            <Edit size={16} className="mr-1" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash size={16} className="mr-1" />
            Delete
          </Button>
        </div>
      </div>
      
      {/* Main content grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column (2/3 width) */}
        <div className="md:col-span-2 space-y-6">
          {/* Contact Info Card */}
          <ContactInfo contact={contact} />
          
          {/* Media section - conditionally rendered in the Info card */}
          {(contactMedia.length > 0) && (
            <div className="mt-6">
              <h3 className="font-semibold text-sm text-muted-foreground mb-4">FILES & MEDIA</h3>
              <ContactMediaSection media={contactMedia} />
            </div>
          )}
          
          {/* Keystones */}
          <ContactKeystones 
            keystones={keystones} 
            contact={contact} 
            onKeystoneAdded={handleKeystoneAdded} 
          />
          
          {/* Interactions */}
          <ContactInteractions 
            interactions={interactions} 
            contact={contact} 
            onInteractionAdded={handleInteractionAdded} 
          />
        </div>
        
        {/* Right column (1/3 width) */}
        <div>
          {/* Connection Insights */}
          {connectionStrength && <ConnectionInsights strength={connectionStrength} />}
        </div>
      </div>
      
      {/* Edit Contact Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
          </DialogHeader>
          {contact && (
            <ContactForm
              contact={contact}
              onSuccess={(updatedContact, prevBirthday) => {
                void handleContactUpdate(updatedContact, prevBirthday);
              }}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Contact Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              contact "{contact.name}" and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
