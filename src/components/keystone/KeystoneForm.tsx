
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import { keystoneService } from "@/services/keystoneService";
import { Keystone } from "@/types/keystone";
import { Contact } from "@/types/contact";
import { format } from "date-fns";

interface KeystoneFormProps {
  keystone?: Keystone | null;
  contacts: Contact[];
  onSuccess: () => void;
  onCancel: () => void;
}

function KeystoneForm({ keystone, contacts, onSuccess, onCancel }: KeystoneFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    category: "",
    contact_id: "",
    is_recurring: false,
    recurrence_frequency: "",
    notes: ""
  });

  // Populate form when editing
  useEffect(() => {
    if (keystone) {
      setFormData({
        title: keystone.title || "",
        date: keystone.date ? format(new Date(keystone.date), 'yyyy-MM-dd') : "",
        category: keystone.category || "",
        contact_id: keystone.contact_id || "",
        is_recurring: keystone.is_recurring || false,
        recurrence_frequency: keystone.recurrence_frequency || "",
        notes: keystone.notes || ""
      });
    }
  }, [keystone]);

  const createMutation = useMutation({
    mutationFn: keystoneService.createKeystone,
    onSuccess: onSuccess
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Keystone> }) =>
      keystoneService.updateKeystone(id, data),
    onSuccess: onSuccess
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const keystoneData = {
      title: formData.title,
      date: new Date(formData.date).toISOString(),
      category: formData.category || undefined,
      contact_id: formData.contact_id || undefined,
      is_recurring: formData.is_recurring,
      recurrence_frequency: formData.is_recurring ? formData.recurrence_frequency : undefined,
      notes: formData.notes || undefined
    };

    if (keystone) {
      updateMutation.mutate({ id: keystone.id, data: keystoneData });
    } else {
      createMutation.mutate(keystoneData);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="Enter keystone title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date *</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => handleChange("date", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Birthday">Birthday</SelectItem>
            <SelectItem value="Anniversary">Anniversary</SelectItem>
            <SelectItem value="Meeting">Meeting</SelectItem>
            <SelectItem value="Deadline">Deadline</SelectItem>
            <SelectItem value="Follow-up">Follow-up</SelectItem>
            <SelectItem value="Personal">Personal</SelectItem>
            <SelectItem value="Professional">Professional</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact">Associated Contact</Label>
        <Select value={formData.contact_id} onValueChange={(value) => handleChange("contact_id", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a contact (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No contact</SelectItem>
            {contacts.map((contact) => (
              <SelectItem key={contact.id} value={contact.id}>
                {contact.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="recurring"
            checked={formData.is_recurring}
            onCheckedChange={(checked) => handleChange("is_recurring", checked)}
          />
          <Label htmlFor="recurring">Recurring keystone</Label>
        </div>
      </div>

      {formData.is_recurring && (
        <div className="space-y-2">
          <Label htmlFor="frequency">Recurrence Frequency</Label>
          <Select 
            value={formData.recurrence_frequency} 
            onValueChange={(value) => handleChange("recurrence_frequency", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Daily">Daily</SelectItem>
              <SelectItem value="Weekly">Weekly</SelectItem>
              <SelectItem value="Monthly">Monthly</SelectItem>
              <SelectItem value="Yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          placeholder="Add any additional notes..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : keystone ? "Update Keystone" : "Create Keystone"}
        </Button>
      </div>
    </form>
  );
}

export default KeystoneForm;
