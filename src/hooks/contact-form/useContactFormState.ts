
import { useState } from "react";
import { Contact } from "@/types/contact";

/**
 * Hook to manage the form state for a contact
 */
export function useContactFormState(contact?: Contact) {
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
  
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  return {
    formData,
    setFormData,
    isSubmitting,
    setIsSubmitting,
    birthday,
    setBirthday,
    birthdayYear,
    setBirthdayYear,
    birthdayMonth,
    setBirthdayMonth,
    imageFiles,
    setImageFiles,
    documentFiles,
    setDocumentFiles,
  };
}
