
import { Contact } from "@/types/contact";
import { useContactFormState } from "./useContactFormState";
import { useContactFormHandlers } from "./useContactFormHandlers";
import { useContactFormSubmit } from "./useContactFormSubmit";

/**
 * Main hook that combines form state, handlers, and submission logic for contact forms
 */
export function useContactForm(
  contact?: Contact,
  onSuccess?: (updatedContact?: Contact, previousBirthday?: string | null) => void,
  onCancel?: () => void
) {
  const {
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
    setDocumentFiles
  } = useContactFormState(contact);

  const {
    handleChange,
    handleNumberChange,
    handleCircleChange,
    handleAddTag,
    handleRemoveTag,
    handleBirthdayDayChange,
    handleImageUpload,
    handleDocumentUpload,
    handleRemoveImage,
    handleRemoveDocument
  } = useContactFormHandlers({
    formData,
    setFormData,
    setBirthday,
    setBirthdayYear,
    setBirthdayMonth,
    setImageFiles,
    setDocumentFiles
  });

  const { handleSubmit, handleCancel } = useContactFormSubmit({
    contact,
    formData,
    imageFiles,
    documentFiles,
    birthday,
    setIsSubmitting,
    onSuccess,
    onCancel
  });

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
    handleCancel
  };
}
