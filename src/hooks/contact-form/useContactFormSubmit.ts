
import { Contact } from "@/types/contact";
import { useToast } from "@/hooks/use-toast";
import { contactService } from "@/services/contacts";
import { contactMediaService } from "@/services/contactMediaService";
import { keystoneService } from "@/services/keystoneService";

interface ContactFormSubmitParams {
  contact?: Contact;
  formData: Partial<Contact>;
  imageFiles: File[];
  documentFiles: File[];
  birthday?: Date;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  onSuccess?: (updatedContact?: Contact, previousBirthday?: string | null) => void;
  onCancel?: () => void;
}

/**
 * Hook to handle the form submission for a contact
 */
export function useContactFormSubmit({
  contact,
  formData,
  imageFiles,
  documentFiles,
  birthday,
  setIsSubmitting,
  onSuccess,
  onCancel
}: ContactFormSubmitParams) {
  const { toast } = useToast();

  const createBirthdayKeystone = async (contactId: string, birthdate: Date) => {
    const birthdayMonth = birthdate.getMonth() + 1;
    const birthdayDay = birthdate.getDate();
    const currentYear = new Date().getFullYear();
    
    try {
      // Create a recurring birthday keystone
      await keystoneService.createKeystone({
        title: `${formData.name}'s Birthday`,
        date: new Date(currentYear, birthdate.getMonth(), birthdate.getDate()).toISOString(),
        category: "Birthday",
        contact_id: contactId,
        is_recurring: true,
        recurrence_frequency: "Yearly"
      });
    } catch (error) {
      console.error("Error creating birthday keystone:", error);
      // Don't fail the whole submission if keystone creation fails
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast({
        title: "Name is required",
        description: "Please enter a name for this contact.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let contactId;
      let updatedContact;
      const previousBirthday = contact?.birthday;
      
      if (contact?.id) {
        // Update existing contact
        updatedContact = await contactService.updateContact(contact.id, formData);
        contactId = updatedContact.id;
        toast({
          title: "Contact updated",
          description: "The contact has been successfully updated.",
        });
      } else {
        // Create new contact
        updatedContact = await contactService.createContact(formData as Omit<Contact, "id" | "user_id" | "created_at" | "updated_at">);
        contactId = updatedContact.id;
        toast({
          title: "Contact created",
          description: "The new contact has been successfully created.",
        });
      }
      
      // If we have a birthday set, create a birthday keystone
      if (birthday) {
        await createBirthdayKeystone(contactId, birthday);
      }
      
      // Upload any files
      const uploadPromises = [
        ...imageFiles.map(file => contactMediaService.uploadContactMedia(contactId, file, true)),
        ...documentFiles.map(file => contactMediaService.uploadContactMedia(contactId, file, false))
      ];
      
      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
        toast({
          title: "Files uploaded",
          description: `Successfully uploaded ${uploadPromises.length} file(s).`,
        });
      }
      
      if (onSuccess) {
        onSuccess(updatedContact, previousBirthday);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    handleCancel: onCancel
  };
}
