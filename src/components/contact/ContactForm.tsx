

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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
      personal_email: "",
      mobile_phone: "",
      circle: "outer",
      notes: "",
      tags: [],
      website: "",
      location: "",
      linkedin: "",
      facebook: "",
      company_name: "",
      job_title: "",
      industry: "",
      department: "",
      work_address: "",
      university: "",
      major: "",
      minor: "",
      how_met: "",
    }
  );
  const [tagInput, setTagInput] = useState("");
  const [birthday, setBirthday] = useState<Date | undefined>(
    formData.birthday ? new Date(formData.birthday) : undefined
  );
  const { toast } = useToast();

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

  const handleBirthdayChange = (date?: Date) => {
    setBirthday(date);
    setFormData(prev => ({
      ...prev,
      birthday: date ? date.toISOString() : undefined
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
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
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
            <Label htmlFor="personal_email">Personal Email</Label>
            <Input
              id="personal_email"
              name="personal_email"
              type="email"
              value={formData.personal_email || ""}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile_phone">Mobile Phone</Label>
            <Input
              id="mobile_phone"
              name="mobile_phone"
              value={formData.mobile_phone || ""}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              type="url"
              placeholder="https://"
              value={formData.website || ""}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthday">Birthday</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !birthday && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {birthday ? format(birthday, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={birthday}
                  onSelect={handleBirthdayChange}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              placeholder="City, Country"
              value={formData.location || ""}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                name="linkedin"
                placeholder="LinkedIn profile URL"
                value={formData.linkedin || ""}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                name="facebook"
                placeholder="Facebook profile URL"
                value={formData.facebook || ""}
                onChange={handleChange}
              />
            </div>
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
        </TabsContent>
        
        <TabsContent value="professional" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              name="company_name"
              value={formData.company_name || ""}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="job_title">Job Title</Label>
            <Input
              id="job_title"
              name="job_title"
              value={formData.job_title || ""}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              name="industry"
              value={formData.industry || ""}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              name="department"
              value={formData.department || ""}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="work_address">Work Address</Label>
            <Textarea
              id="work_address"
              name="work_address"
              value={formData.work_address || ""}
              onChange={handleChange}
              rows={3}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="education" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="university">University</Label>
            <Input
              id="university"
              name="university"
              value={formData.university || ""}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="major">Major</Label>
              <Input
                id="major"
                name="major"
                value={formData.major || ""}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minor">Minor</Label>
              <Input
                id="minor"
                name="minor"
                value={formData.minor || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="graduation_year">Graduation Year</Label>
            <Input
              id="graduation_year"
              name="graduation_year"
              type="number"
              min="1900"
              max="2100"
              value={formData.graduation_year || ""}
              onChange={handleNumberChange}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="other" className="space-y-4">
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
