
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Contact } from "@/types/contact";
import ContactMediaUploader from "./ContactMediaUploader";
import { TagsInput } from "@/components/ui/TagsInput";

interface ContactFormOtherTabProps {
  formData: Partial<Contact>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  imageFiles: File[];
  onImageUpload: (files: File[]) => void;
  onImageRemove: (index: number) => void;
  documentFiles: File[];
  onDocumentUpload: (files: File[]) => void;
  onDocumentRemove: (index: number) => void;
}

export const ContactFormOtherTab = ({
  formData,
  handleChange,
  tags,
  onAddTag,
  onRemoveTag,
  imageFiles,
  onImageUpload,
  onImageRemove,
  documentFiles,
  onDocumentUpload,
  onDocumentRemove
}: ContactFormOtherTabProps) => {
  const handleTagsChange = (newTags: string[]) => {
    // Remove tags that are no longer in the new list
    const currentTags = tags || [];
    currentTags.forEach(tag => {
      if (!newTags.includes(tag)) {
        onRemoveTag(tag);
      }
    });
    
    // Add new tags
    newTags.forEach(tag => {
      if (!currentTags.includes(tag)) {
        onAddTag(tag);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="how_met">How You Met</Label>
        <Textarea 
          id="how_met" 
          name="how_met" 
          value={formData.how_met || ""} 
          onChange={handleChange} 
          rows={3} 
          placeholder="Describe how you met this person..." 
          className="rounded-2xl" 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="hobbies_interests">Hobbies & Interests</Label>
        <Textarea 
          id="hobbies_interests" 
          name="hobbies_interests" 
          value={formData.hobbies_interests || ""} 
          onChange={handleChange} 
          rows={3} 
          placeholder="List hobbies, interests, favorite activities..." 
          className="rounded-2xl" 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea 
          id="notes" 
          name="notes" 
          value={formData.notes || ""} 
          onChange={handleChange} 
          rows={3} 
          placeholder="Add any personal notes about this contact..." 
          className="rounded-2xl" 
        />
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <TagsInput
          tags={tags || []}
          onChange={handleTagsChange}
          contactData={formData}
          maxTags={15}
          placeholder="Add a tag..."
        />
      </div>
      
      <ContactMediaUploader 
        type="image" 
        files={imageFiles} 
        onUpload={onImageUpload} 
        onRemove={onImageRemove} 
        acceptTypes="image/*" 
        label="Images" 
        description="PNG, JPG, WEBP up to 10MB each" 
      />
      
      <ContactMediaUploader 
        type="document" 
        files={documentFiles} 
        onUpload={onDocumentUpload} 
        onRemove={onDocumentRemove} 
        acceptTypes=".pdf,.doc,.docx,.txt" 
        label="Documents" 
        description="PDF, DOC, TXT up to 10MB each" 
      />
    </div>
  );
};
