import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Contact } from "@/types/contact";
import { useContactForm } from "@/hooks/useContactForm";
import { ContactFormBasicTab } from "./form/ContactFormBasicTab";
import { ContactFormProfessionalTab } from "./form/ContactFormProfessionalTab";
import { ContactFormEducationTab } from "./form/ContactFormEducationTab";
import { ContactFormOtherTab } from "./form/ContactFormOtherTab";

interface ContactFormProps {
  contact?: Contact;
  onSuccess: (updatedContact?: Contact, prevBirthday?: string | null) => void;
  onCancel: () => void;
}

export default function ContactForm({
  contact,
  onSuccess,
  onCancel,
}: ContactFormProps) {
  const {
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
  } = useContactForm(contact, onSuccess, onCancel);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">

      {/* Visual drag handle (centered, below screen top) */}
      <div className="flex justify-center pt-4">
        <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
      </div>

      {/* Optional heading */}
      <h2 className="text-lg font-semibold text-center mt-2 mb-2">
        {contact?.id ? "Edit Contact" : "Add Contact"}
      </h2>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <ContactFormBasicTab
            formData={formData}
            handleChange={handleChange}
            handleCircleChange={handleCircleChange}
            birthday={birthday}
            handleBirthdayDayChange={handleBirthdayDayChange}
          />
        </TabsContent>

        <TabsContent value="professional">
          <ContactFormProfessionalTab
            formData={formData}
            handleChange={handleChange}
          />
        </TabsContent>

        <TabsContent value="education">
          <ContactFormEducationTab
            formData={formData}
            handleChange={handleChange}
            handleNumberChange={handleNumberChange}
          />
        </TabsContent>

        <TabsContent value="other">
          <ContactFormOtherTab
            formData={formData}
            handleChange={handleChange}
            tags={formData.tags || []}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            imageFiles={imageFiles}
            onImageUpload={handleImageUpload}
            onImageRemove={handleRemoveImage}
            documentFiles={documentFiles}
            onDocumentUpload={handleDocumentUpload}
            onDocumentRemove={handleDocumentRemove}
          />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4 sticky bottom-0 bg-background pb-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : contact?.id
            ? "Update Contact"
            : "Create Contact"}
        </Button>
      </div>
    </form>
  );
}
