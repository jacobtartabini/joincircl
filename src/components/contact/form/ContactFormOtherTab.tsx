
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Contact } from "@/types/contact";
import ContactMediaUploader from "./ContactMediaUploader";

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
  const [tagInput, setTagInput] = useState("");

  const handleAddTagClick = () => {
    if (!tagInput.trim()) return;
    onAddTag(tagInput.trim());
    setTagInput("");
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
        />
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add tag"
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTagClick();
              }
            }}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={handleAddTagClick}
          >
            Add
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          {tags?.map((tag) => (
            <div
              key={tag}
              className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
            >
              {tag}
              <button
                type="button"
                className="ml-1 text-blue-800 hover:text-blue-900"
                onClick={() => onRemoveTag(tag)}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
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
