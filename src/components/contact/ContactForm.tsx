import { useState } from "react";
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
  onCancel
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
    handleSubmit
  } = useContactForm(contact, onSuccess, onCancel);
  return <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid grid-cols-4 mb-6 bg-gray-100 p-1 rounded-full">
            <TabsTrigger value="basic" className="font-medium rounded-full">Basic</TabsTrigger>
            <TabsTrigger value="professional" className="rounded-lg font-medium">Professional</TabsTrigger>
            <TabsTrigger value="education" className="rounded-lg font-medium">Education</TabsTrigger>
            <TabsTrigger value="other" className="rounded-lg font-medium">Other</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <ContactFormBasicTab formData={formData} handleChange={handleChange} handleCircleChange={handleCircleChange} birthday={birthday} handleBirthdayDayChange={handleBirthdayDayChange} />
          </TabsContent>

          <TabsContent value="professional" className="space-y-6">
            <ContactFormProfessionalTab formData={formData} handleChange={handleChange} />
          </TabsContent>

          <TabsContent value="education" className="space-y-6">
            <ContactFormEducationTab formData={formData} handleChange={handleChange} handleNumberChange={handleNumberChange} />
          </TabsContent>

          <TabsContent value="other" className="space-y-6">
            <ContactFormOtherTab formData={formData} handleChange={handleChange} tags={formData.tags || []} onAddTag={handleAddTag} onRemoveTag={handleRemoveTag} imageFiles={imageFiles} onImageUpload={handleImageUpload} onImageRemove={handleRemoveImage} documentFiles={documentFiles} onDocumentUpload={handleDocumentUpload} onDocumentRemove={handleRemoveDocument} />
          </TabsContent>
        </Tabs>
      </form>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="px-6 font-semibold rounded-full">
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-gray-900 hover:bg-gray-800 text-white px-6 font-semibold rounded-full">
          {isSubmitting ? "Saving..." : contact?.id ? "Update Contact" : "Create Contact"}
        </Button>
      </div>
    </div>;
}