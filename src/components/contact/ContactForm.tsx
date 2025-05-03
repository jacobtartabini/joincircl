
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Contact } from "@/types/contact";
import { contactService } from "@/services/contactService";
import { useToast } from "@/hooks/use-toast";

interface ContactFormProps {
  contact?: Contact;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ContactForm({
  contact,
  onSuccess,
  onCancel,
}: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<Contact>>(
    contact || {
      name: "",
      email: "",
      phone: "",
      circle: "outer",
      notes: "",
      tags: [],
    }
  );
  const [tagInput, setTagInput] = useState("");
  const { toast } = useToast();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCircleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      circle: value as "inner" | "middle" | "outer",
    }));
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      tags: [...(prev.tags || []), tagInput.trim()],
    }));
    setTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tag) || [],
    }));
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
      if (contact?.id) {
        await contactService.updateContact(contact.id, formData);
        toast({
          title: "Contact updated",
          description: "The contact has been successfully updated.",
        });
      } else {
        await contactService.createContact(formData as Omit<Contact, "id" | "user_id" | "created_at" | "updated_at">);
        toast({
          title: "Contact created",
          description: "The new contact has been successfully created.",
        });
      }
      onSuccess();
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email || ""}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone || ""}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="circle">Circle</Label>
        <Select
          value={formData.circle}
          onValueChange={handleCircleChange}
        >
          <SelectTrigger id="circle">
            <SelectValue placeholder="Select circle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="inner">Inner Circle</SelectItem>
            <SelectItem value="middle">Middle Circle</SelectItem>
            <SelectItem value="outer">Outer Circle</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes || ""}
          onChange={handleChange}
          rows={3}
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
                handleAddTag();
              }
            }}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={handleAddTag}
          >
            Add
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          {formData.tags?.map((tag) => (
            <div
              key={tag}
              className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
            >
              {tag}
              <button
                type="button"
                className="ml-1 text-blue-800 hover:text-blue-900"
                onClick={() => handleRemoveTag(tag)}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
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
