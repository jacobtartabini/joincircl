
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Contact, Interaction, ContactMedia } from "@/types/contact";
import { Keystone } from "@/types/keystone";
import { contactService } from "@/services/contacts";
import { keystoneService } from "@/services/keystoneService";
import { contactMediaService } from "@/services/contactMediaService";
import { useToast } from "@/hooks/use-toast";

export function useContactDetail(contactId: string | undefined) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contact, setContact] = useState<Contact | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [keystones, setKeystones] = useState<Keystone[]>([]);
  const [contactMedia, setContactMedia] = useState<ContactMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadContactData() {
      if (!contactId) {
        setLoading(false);
        setError(true);
        return;
      }
      
      setLoading(true);
      setError(false);
      
      try {
        const contactData = await contactService.getContact(contactId);
        const interactionsData = await contactService.getInteractionsByContactId(contactId);
        const keystonesData = await keystoneService.getKeystonesByContactId(contactId);
        
        let mediaData: ContactMedia[] = [];
        try {
          mediaData = await contactMediaService.getContactMedia(contactId);
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
        setError(true);
        toast({
          title: "Error",
          description: "Could not load contact data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
    
    loadContactData();
  }, [contactId, navigate, toast]);

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
    if (!contactId) return;
    
    try {
      const refreshedContact = await contactService.getContact(contactId);
      setContact(refreshedContact);
      
      // Check if birthday was added or changed
      if (updatedContact.birthday && (!previousBirthday || updatedContact.birthday !== previousBirthday)) {
        // Check if there's already a birthday keystone for this contact
        const existingBirthdayKeystone = keystones.find(
          k => k.category === "Birthday" && k.contact_id === contact?.id
        );
        
        if (!existingBirthdayKeystone) {
          await createBirthdayKeystone(updatedContact);
        } else if (previousBirthday && updatedContact.birthday !== previousBirthday) {
          await updateBirthdayKeystone(updatedContact, existingBirthdayKeystone);
        }
      }
    } catch (error) {
      console.error("Error refreshing contact:", error);
    }
  };

  const createBirthdayKeystone = async (updatedContact: Contact) => {
    try {
      const birthdayDate = new Date(updatedContact.birthday!);
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
      if (contactId) {
        const updatedKeystones = await keystoneService.getKeystonesByContactId(contactId);
        setKeystones(updatedKeystones);
      }
      
      toast({
        title: "Birthday reminder created",
        description: `A yearly reminder for ${updatedContact.name}'s birthday has been added.`
      });
    } catch (error) {
      console.error("Error creating birthday keystone:", error);
    }
  };

  const updateBirthdayKeystone = async (updatedContact: Contact, existingKeystone: Keystone) => {
    try {
      const birthdayDate = new Date(updatedContact.birthday!);
      const existingDate = new Date(existingKeystone.date);
      
      // Keep same month/day but update to current year
      birthdayDate.setFullYear(existingDate.getFullYear());
      
      await keystoneService.updateKeystone(existingKeystone.id, {
        title: `${updatedContact.name}'s Birthday`,
        date: birthdayDate.toISOString()
      });
      
      // Refresh keystones
      if (contactId) {
        const updatedKeystones = await keystoneService.getKeystonesByContactId(contactId);
        setKeystones(updatedKeystones);
      }
    } catch (error) {
      console.error("Error updating birthday keystone:", error);
    }
  };

  const handleKeystoneAdded = async () => {
    if (!contactId) return;
    try {
      const updatedKeystones = await keystoneService.getKeystonesByContactId(contactId);
      setKeystones(updatedKeystones);
    } catch (error) {
      console.error("Error refreshing keystones:", error);
    }
  };

  const handleInteractionAdded = async () => {
    if (!contactId) return;
    try {
      const updatedContact = await contactService.getContact(contactId);
      const updatedInteractions = await contactService.getInteractionsByContactId(contactId);
      setContact(updatedContact);
      setInteractions(updatedInteractions);
    } catch (error) {
      console.error("Error refreshing interactions:", error);
    }
  };

  return {
    contact,
    interactions,
    keystones,
    contactMedia,
    loading,
    error,
    handleDelete,
    handleContactUpdate,
    handleKeystoneAdded,
    handleInteractionAdded
  };
}
