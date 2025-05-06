import { useState, useRef } from "react";
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
import { CalendarIcon, X, Upload, FileImage, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { contactMediaService } from "@/services/contactMediaService";
import { keystoneService } from "@/services/keystoneService";

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
      linkedin: "https://www.linkedin.com/in/",
      facebook: "https://www.facebook.com/",
      twitter: "https://www.twitter.com/",
      instagram: "https://www.instagram.com/",
      company_name: "",
      job_title: "",
      industry: "",
      department: "",
      work_address: "",
      university: "",
      major: "",
      minor: "",
      how_met: "",
      hobbies_interests: "",
    }
  );
  
  const [tagInput, setTagInput] = useState("");
  const [birthday, setBirthday] = useState<Date | undefined>(
    formData.birthday ? new Date(formData.birthday) : undefined
  );
  const [birthdayYear, setBirthdayYear] = useState<number | undefined>(
    birthday ? birthday.getFullYear() : undefined
  );
  const [birthdayMonth, setBirthdayMonth] = useState<number | undefined>(
    birthday ? birthday.getMonth() : undefined
  );
  const [calendarView, setCalendarView] = useState<"days" | "months" | "years">("days");
  
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  
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

  const handleBirthdayYearChange = (year: number) => {
    setBirthdayYear(year);
    
    // If we have a month and year, update the date
    if (birthdayMonth !== undefined) {
      const newDate = new Date();
      newDate.setFullYear(year);
      newDate.setMonth(birthdayMonth);
      // Keep the day or set to 1 if invalid date
      const day = birthday ? Math.min(birthday.getDate(), new Date(year, birthdayMonth + 1, 0).getDate()) : 1;
      newDate.setDate(day);
      newDate.setHours(0, 0, 0, 0);
      setBirthday(newDate);
      
      setFormData(prev => ({
        ...prev,
        birthday: newDate.toISOString()
      }));
    }
    
    // After selecting a year, move to month view
    setCalendarView("months");
  };

  const handleBirthdayMonthChange = (month: number) => {
    setBirthdayMonth(month);
    
    // If we have a year and month, update the date
    if (birthdayYear !== undefined) {
      const newDate = new Date();
      newDate.setFullYear(birthdayYear);
      newDate.setMonth(month);
      // Set to the 1st day of month initially
      newDate.setDate(1);
      newDate.setHours(0, 0, 0, 0);
      setBirthday(newDate);
      
      setFormData(prev => ({
        ...prev,
        birthday: newDate.toISOString()
      }));
    }
    
    // After selecting a month, move to day view
    setCalendarView("days");
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setImageFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setDocumentFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveDocument = (index: number) => {
    setDocumentFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const createBirthdayKeystone = async (contactId: string, birthdate: Date) => {
    const birthdayMonth = birthdate.getMonth() + 1;
    const birthdayDay = birthdate.getDate();
    const currentYear = new Date().getFullYear();
    
    try {
      // Create a recurring birthday keystone
      await keystoneService.createKeystone({
        title: `${formData.name}'s Birthday`,
        date: new Date(currentYear, birthdate.getMonth(), birthdate.getDate()).toISOString(),
        category: "Birthday",
        contact_id: contactId,
        is_recurring: true,
        recurrence_frequency: "Yearly"
      });
    } catch (error) {
      console.error("Error creating birthday keystone:", error);
      // Don't fail the whole submission if keystone creation fails
    }
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
      let contactId;
      
      if (contact?.id) {
        // Update existing contact
        const updatedContact = await contactService.updateContact(contact.id, formData);
        contactId = updatedContact.id;
        toast({
          title: "Contact updated",
          description: "The contact has been successfully updated.",
        });
      } else {
        // Create new contact
        const newContact = await contactService.createContact(formData as Omit<Contact, "id" | "user_id" | "created_at" | "updated_at">);
        contactId = newContact.id;
        toast({
          title: "Contact created",
          description: "The new contact has been successfully created.",
        });
      }
      
      // If we have a birthday set, create a birthday keystone
      if (birthday) {
        await createBirthdayKeystone(contactId, birthday);
      }
      
      // Upload any files
      const uploadPromises = [
        ...imageFiles.map(file => contactMediaService.uploadContactMedia(contactId, file, true)),
        ...documentFiles.map(file => contactMediaService.uploadContactMedia(contactId, file, false))
      ];
      
      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
        toast({
          title: "Files uploaded",
          description: `Successfully uploaded ${uploadPromises.length} file(s).`,
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

  // Render calendar content based on the current view
  const renderCalendarContent = () => {
    if (calendarView === "years") {
      const currentYear = new Date().getFullYear();
      const startYear = currentYear - 70; // Show 70 years in the past
      const years = Array.from({ length: 100 }, (_, i) => startYear + i);
      
      return (
        <div className="p-2 h-[240px] overflow-y-auto">
          <div className="grid grid-cols-4 gap-1 text-center">
            {years.map(year => (
              <button
                key={year}
                type="button"
                className={cn(
                  "p-2 rounded hover:bg-accent",
                  birthdayYear === year ? "bg-primary text-primary-foreground" : ""
                )}
                onClick={() => handleBirthdayYearChange(year)}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      );
    }
    
    if (calendarView === "months") {
      const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];
      
      return (
        <div className="p-2">
          <div className="grid grid-cols-3 gap-2 text-center">
            {months.map((month, index) => (
              <button
                key={month}
                type="button"
                className={cn(
                  "p-2 rounded hover:bg-accent",
                  birthdayMonth === index ? "bg-primary text-primary-foreground" : ""
                )}
                onClick={() => handleBirthdayMonthChange(index)}
              >
                {month}
              </button>
            ))}
          </div>
        </div>
      );
    }
    
    return (
      <Calendar
        mode="single"
        selected={birthday}
        onSelect={handleBirthdayDayChange}
        initialFocus
        className="p-3 pointer-events-auto"
      />
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
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
                <div className="p-2 flex border-b">
                  <Button 
                    type="button"
                    variant={calendarView === "days" ? "default" : "outline"} 
                    className="mr-1 flex-1 text-xs"
                    onClick={() => setCalendarView("days")}
                  >
                    Day
                  </Button>
                  <Button 
                    type="button"
                    variant={calendarView === "months" ? "default" : "outline"} 
                    className="mr-1 flex-1 text-xs"
                    onClick={() => setCalendarView("months")}
                  >
                    Month
                  </Button>
                  <Button 
                    type="button"
                    variant={calendarView === "years" ? "default" : "outline"} 
                    className="flex-1 text-xs"
                    onClick={() => setCalendarView("years")}
                  >
                    Year
                  </Button>
                </div>
                {renderCalendarContent()}
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

          <div className="space-y-2">
            <Label>Social Media Profiles</Label>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="linkedin" className="text-xs text-muted-foreground">LinkedIn</Label>
                <Input
                  id="linkedin"
                  name="linkedin"
                  value={formData.linkedin || "https://www.linkedin.com/in/"}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="facebook" className="text-xs text-muted-foreground">Facebook</Label>
                <Input
                  id="facebook"
                  name="facebook"
                  value={formData.facebook || "https://www.facebook.com/"}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="twitter" className="text-xs text-muted-foreground">Twitter</Label>
                <Input
                  id="twitter"
                  name="twitter"
                  value={formData.twitter || "https://www.twitter.com/"}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="instagram" className="text-xs text-muted-foreground">Instagram</Label>
                <Input
                  id="instagram"
                  name="instagram"
                  value={formData.instagram || "https://www.instagram.com/"}
                  onChange={handleChange}
                />
              </div>
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
        
        <TabsContent value="files" className="space-y-4">
          <div className="space-y-2">
            <Label>Images</Label>
            <div className="border-2 border-dashed rounded-md p-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => imageInputRef.current?.click()}>
              <div className="text-center">
                <FileImage className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Click to upload images</p>
                <p className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 10MB each</p>
              </div>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
            
            {imageFiles.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {imageFiles.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Upload ${index}`}
                      className="h-20 w-full object-cover rounded"
                    />
                    <button
                      type="button"
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Documents</Label>
            <div className="border-2 border-dashed rounded-md p-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => documentInputRef.current?.click()}>
              <div className="text-center">
                <File className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Click to upload documents</p>
                <p className="text-xs text-muted-foreground">PDF, DOC, TXT up to 10MB each</p>
              </div>
              <input
                ref={documentInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                multiple
                className="hidden"
                onChange={handleDocumentUpload}
              />
            </div>
            
            {documentFiles.length > 0 && (
              <div className="space-y-2 mt-2">
                {documentFiles.map((file, index) => (
                  <div key={index} className="flex justify-between items-center bg-muted p-2 rounded">
                    <div className="flex items-center">
                      <File size={16} className="mr-2" />
                      <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                    </div>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveDocument(index)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
