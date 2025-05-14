
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
import { contactService } from "@/services/contacts";
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
import { Contact, Interaction } from "@/types/contact";

interface InteractionFormProps {
  interaction?: Interaction;
  contact: Contact;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function InteractionForm({
  interaction,
  contact,
  onSuccess,
  onCancel,
}: InteractionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<{
    type: string;
    date: Date;
    notes?: string;
  }>({
    type: interaction?.type || "",
    date: interaction ? new Date(interaction.date) : new Date(),
    notes: interaction?.notes || "",
  });

  const { toast } = useToast();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, type: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, date }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type) {
      toast({
        title: "Missing interaction type",
        description: "Please select an interaction type",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Log the interaction
      await contactService.addInteraction({
        contact_id: contact.id,
        type: formData.type,
        notes: formData.notes,
        date: formData.date.toISOString()
      });
      
      // Update the last contact date for the contact
      await contactService.updateContact(contact.id, {
        last_contact: formData.date.toISOString()
      });
      
      toast({
        title: "Interaction logged",
        description: "The interaction has been successfully recorded."
      });
      
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
        <Label htmlFor="type">Interaction Type*</Label>
        <Select
          value={formData.type}
          onValueChange={handleTypeChange}
          required
        >
          <SelectTrigger id="type">
            <SelectValue placeholder="Select interaction type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="call">Phone Call</SelectItem>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="message">Message/Text</SelectItem>
            <SelectItem value="social">Social Media</SelectItem>
            <SelectItem value="video">Video Call</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
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
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes || ""}
          onChange={handleChange}
          placeholder="Details about the interaction..."
          rows={4}
        />
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
          {isSubmitting ? "Saving..." : "Log Interaction"}
        </Button>
      </div>
    </form>
  );
}
