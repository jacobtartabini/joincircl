import { useRef, useState } from "react";
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
  const swipeRef = useRef<HTMLDivElement>(null);
  const [startY, setStartY] = useState<number | null>(null);
  const [deltaY, setDeltaY] = useState(0);

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

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === null) return;
    const moveY = e.touches[0].clientY;
    const distance = moveY - startY;

    if (distance > 0) {
      setDeltaY(distance);
      if (swipeRef.current) {
        swipeRef.current.style.transform = `translateY(${distance}px)`;
      }
    }
  };

  const handleTouchEnd = () => {
    if (deltaY > 100) {
      onCancel();
    } else {
      if (swipeRef.current) {
        swipeRef.current.style.transition = "transform 0.3s ease";
        swipeRef.current.style.transform = "translateY(0)";
        setTimeout(() => {
          if (swipeRef.current) swipeRef.current.style.transition = "";
        }, 300);
      }
    }
    setStartY(null);
    setDeltaY(0);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex justify-center items-end sm:items-center"
      onClick={handleBackdropClick}
    >
      <div
        ref={swipeRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-lg shadow-lg max-h-[90vh] overflow-y-auto transition-transform"
      >
        <div className="w-full flex justify-center py-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-4 pb-4">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid grid-cols-4 mb-4 bg-gray-100 rounded-lg overflow-hidden">
              <TabsTrigger
                value="basic"
                className="text-center py-2 text-sm sm:text-base data-[state=active]:bg-white data-[state=active]:text-black"
              >
                Basic
              </TabsTrigger>
              <TabsTrigger
                value="professional"
                className="text-center py-2 text-sm sm:text-base data-[state=active]:bg-white data-[state=active]:text-black"
              >
                Professional
              </TabsTrigger>
              <TabsTrigger
                value="education"
                className="text-center py-2 text-sm sm:text-base data-[state=active]:bg-white data-[state=active]:text-black"
              >
                Education
              </TabsTrigger>
              <TabsTrigger
                value="other"
                className="text-center py-2 text-sm sm:text-base data-[state=active]:bg-white data-[state=active]:text-black"
              >
                Other
              </TabsTrigger>
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
              <ContactFormProfessionalTab formData={formData} handleChange={handleChange} />
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
                onDocumentRemove={handleRemoveDocument}
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 sticky bottom-0 bg-white pb-2">
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
      </div>
    </div>
  );
}
