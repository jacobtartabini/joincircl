
import { useState } from "react";
import { Contact } from "@/types/contact";
import { useToast } from "@/hooks/use-toast";
import { contactService } from "@/services/contactService";
import { contactMediaService } from "@/services/contactMediaService";
import { keystoneService } from "@/services/keystoneService";

export function useContactForm(
  contact?: Contact,
  onSuccess?: (updatedContact?: Contact, previousBirthday?: string | null) => void,
  onCancel?: () => void
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<Contact>>(
    contact || {
      name: "",
      personal_email: "",
      mobile_phone: "",
      circle: "outer",
      notes: "",
      tags: [],
      website: "",
      location: "",
      linkedin: "https://www.linkedin.com/in/",
      facebook: "https://www.facebook.com/",
      twitter: "https://www.twitter.com/",
      instagram: "https://www.instagram.com/",
      company_name: "",
      job_title: "",
      industry: "",
      department: "",
      work_address: "",
      university: "",
      major: "",
      minor: "",
      how_met: "",
      hobbies_interests: "",
    }
  );
  
  const [birthday, setBirthday] = useState<Date | undefined>(
    formData.birthday ? new Date(formData.birthday) : undefined
  );
  const [birthdayYear, setBirthdayYear] = useState<number | undefined>(
    birthday ? birthday.getFullYear() : undefined
  );
  const [birthdayMonth, setBirthdayMonth] = useState<number | undefined>(
    birthday ? birthday.getMonth() : undefined
  );
  
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  
  const { toast } = useToast();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const numberValue = value === "" ? undefined : parseInt(value);
    setFormData((prev) => ({ ...prev, [name]: numberValue }));
  };

  const handleCircleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      circle: value as "inner" | "middle" | "outer",
    }));
  };

  const handleAddTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: [...(prev.tags || []), tag],
    }));
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tag) || [],
    }));
  };

  const handleBirthdayDayChange = (date: Date | undefined) => {
    setBirthday(date);
    
    if (date) {
      setBirthdayYear(date.getFullYear());
      setBirthdayMonth(date.getMonth());
      
      setFormData(prev => ({
        ...prev,
        birthday: date.toISOString()
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        birthday: undefined
      }));
    }
  };

  const handleImageUpload = (files: File[]) => {
    setImageFiles((prev) => [...prev, ...files]);
  };

  const handleDocumentUpload = (files: File[]) => {
    setDocumentFiles((prev) => [...prev, ...files]);
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveDocument = (index: number) => {
    setDocumentFiles((prev) => prev.filter((_, i) => i !== index));
  };

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
    formData,
    isSubmitting,
    birthday,
    imageFiles,
    documentFiles,
    handleChange,
    handleNumberChange,
    handleCircleChange,
    handleAddTag,
    handleRemoveTag,
    handleBirthdayDayChange,
    handleImageUpload,
    handleDocumentUpload,
    handleRemoveImage,
    handleRemoveDocument,
    handleSubmit,
    handleCancel: onCancel
  };
}
