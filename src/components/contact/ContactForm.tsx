
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Contact } from "@/types/contact";
import { useContactForm } from "@/hooks/useContactForm";
import { ContactFormBasicTab } from "./form/ContactFormBasicTab";
import { ContactFormProfessionalTab } from "./form/ContactFormProfessionalTab";
import { ContactFormEducationTab } from "./form/ContactFormEducationTab";
import { ContactFormOtherTab } from "./form/ContactFormOtherTab";
import { StandardModalHeader } from "@/components/ui/StandardModalHeader";
import { User } from "lucide-react";

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

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <StandardModalHeader
        icon={User}
        title={contact ? 'Edit Contact' : 'Create New Contact'}
        subtitle="Manage your contact information"
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4 bg-white/20 dark:bg-white/10 p-1 rounded-full backdrop-blur-sm border border-white/30 dark:border-white/20">
            <TabsTrigger value="basic" className="font-medium rounded-full data-[state=active]:bg-white/60 data-[state=active]:text-foreground">Basic</TabsTrigger>
            <TabsTrigger value="professional" className="font-medium rounded-full data-[state=active]:bg-white/60 data-[state=active]:text-foreground">Professional</TabsTrigger>
            <TabsTrigger value="education" className="font-medium rounded-full data-[state=active]:bg-white/60 data-[state=active]:text-foreground">Education</TabsTrigger>
            <TabsTrigger value="other" className="font-medium rounded-full data-[state=active]:bg-white/60 data-[state=active]:text-foreground">Other</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <ContactFormBasicTab 
              formData={formData} 
              handleChange={handleChange} 
              handleCircleChange={handleCircleChange} 
              birthday={birthday} 
              handleBirthdayDayChange={handleBirthdayDayChange} 
            />
          </TabsContent>

          <TabsContent value="professional" className="space-y-4">
            <ContactFormProfessionalTab 
              formData={formData} 
              handleChange={handleChange} 
            />
          </TabsContent>

          <TabsContent value="education" className="space-y-4">
            <ContactFormEducationTab 
              formData={formData} 
              handleChange={handleChange} 
              handleNumberChange={handleNumberChange} 
            />
          </TabsContent>

          <TabsContent value="other" className="space-y-4">
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
              onDocumentRemove={handleRemoveDocument} 
            />
          </TabsContent>
        </Tabs>
      </form>

      <div className="flex gap-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          disabled={isSubmitting} 
          className="flex-1 rounded-full bg-white/20 border-white/40 backdrop-blur-sm hover:bg-white/30"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting} 
          className="flex-1 rounded-full bg-primary hover:bg-primary/90 text-white border-0"
        >
          {isSubmitting ? "Saving..." : contact?.id ? "Update Contact" : "Create Contact"}
        </Button>
      </div>
    </div>
  );
}
