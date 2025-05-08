
import { Contact } from "@/types/contact";

interface ContactFormHandlersParams {
  formData: Partial<Contact>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Contact>>>;
  setBirthday: React.Dispatch<React.SetStateAction<Date | undefined>>;
  setBirthdayYear: React.Dispatch<React.SetStateAction<number | undefined>>;
  setBirthdayMonth: React.Dispatch<React.SetStateAction<number | undefined>>;
  setImageFiles: React.Dispatch<React.SetStateAction<File[]>>;
  setDocumentFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

/**
 * Hook to provide handlers for the contact form
 */
export function useContactFormHandlers({
  formData,
  setFormData,
  setBirthday,
  setBirthdayYear,
  setBirthdayMonth,
  setImageFiles,
  setDocumentFiles,
}: ContactFormHandlersParams) {
  
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

  return {
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
  };
}
