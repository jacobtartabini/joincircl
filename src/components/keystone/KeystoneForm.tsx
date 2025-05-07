
import { useState, useEffect } from "react";
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
import { keystoneService } from "@/services/keystoneService";
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
import { Keystone } from "@/types/keystone";
import { Contact } from "@/types/contact";
import { Switch } from "@/components/ui/switch";
import { contactService } from "@/services/contactService";

interface KeystoneFormProps {
  keystone?: Keystone;
  contact?: Contact;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function KeystoneForm({
  keystone,
  contact,
  onSuccess,
  onCancel,
}: KeystoneFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [formData, setFormData] = useState<{
    title: string;
    date: Date;
    category?: string;
    contact_id?: string;
    is_recurring: boolean;
    recurrence_frequency?: string;
  }>({
    title: keystone?.title || "",
    date: keystone ? new Date(keystone.date) : new Date(),
    category: keystone?.category || "",
    contact_id: keystone?.contact_id || contact?.id,
    is_recurring: keystone?.is_recurring || false,
    recurrence_frequency: keystone?.recurrence_frequency || "",
  });

  const { toast } = useToast();

  useEffect(() => {
    if (contact) {
      setFormData((prev) => ({ ...prev, contact_id: contact.id }));
    }
  }, [contact]);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const data = await contactService.getContacts();
        setContacts(data);
      } catch (error) {
        console.error("Error fetching contacts:", error);
        toast({
          title: "Error loading contacts",
          description: "Could not retrieve your contacts. Please try again.",
          variant: "destructive"
        });
      }
    };

    if (!contact) {
      fetchContacts();
    }
  }, [contact, toast]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value || undefined }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, date }));
    }
  };

  const toggleRecurring = () => {
    setFormData((prev) => ({
      ...prev,
      is_recurring: !prev.is_recurring,
      recurrence_frequency: !prev.is_recurring ? "Monthly" : undefined
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast({
        title: "Missing title",
        description: "Please enter a title for this keystone",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const keystoneData = {
        title: formData.title,
        date: formData.date.toISOString(),
        category: formData.category,
        contact_id: formData.contact_id,
        is_recurring: formData.is_recurring,
        recurrence_frequency: formData.is_recurring ? formData.recurrence_frequency : undefined
      };
      
      if (keystone?.id) {
        await keystoneService.updateKeystone(keystone.id, keystoneData);
        toast({
          title: "Keystone updated",
          description: "The keystone has been successfully updated."
        });
      } else {
        await keystoneService.createKeystone(keystoneData);
        toast({
          title: "Keystone created",
          description: "The keystone has been successfully created."
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
        <Label htmlFor="title">Title*</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="date">Date*</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formData.date}
              onSelect={handleDateChange}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => handleSelectChange("category", value)}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Birthday">Birthday</SelectItem>
            <SelectItem value="Anniversary">Anniversary</SelectItem>
            <SelectItem value="Work">Work</SelectItem>
            <SelectItem value="Personal">Personal</SelectItem>
            <SelectItem value="Holiday">Holiday</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {!contact && (
        <div className="space-y-2">
          <Label htmlFor="contact">Related Contact</Label>
          <Select
            value={formData.contact_id}
            onValueChange={(value) => handleSelectChange("contact_id", value)}
          >
            <SelectTrigger id="contact">
              <SelectValue placeholder="Select contact" />
            </SelectTrigger>
            <SelectContent>
              {contacts.map(contact => (
                <SelectItem key={contact.id} value={contact.id}>
                  {contact.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="is_recurring">Recurring</Label>
          <Switch
            id="is_recurring"
            checked={formData.is_recurring}
            onCheckedChange={toggleRecurring}
          />
        </div>
        
        {formData.is_recurring && (
          <div className="mt-2">
            <Label htmlFor="recurrence_frequency">Frequency</Label>
            <Select
              value={formData.recurrence_frequency}
              onValueChange={(value) => handleSelectChange("recurrence_frequency", value)}
            >
              <SelectTrigger id="recurrence_frequency">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Daily">Daily</SelectItem>
                <SelectItem value="Weekly">Weekly</SelectItem>
                <SelectItem value="Biweekly">Biweekly</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
                <SelectItem value="Bimonthly">Bimonthly</SelectItem>
                <SelectItem value="Quarterly">Quarterly</SelectItem>
                <SelectItem value="Yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
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
            : keystone?.id
            ? "Update Keystone"
            : "Create Keystone"}
        </Button>
      </div>
    </form>
  );
}
