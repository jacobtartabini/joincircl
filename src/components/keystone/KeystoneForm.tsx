import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MultiContactSelector } from "@/components/ui/multi-contact-selector";
import { useMutation, useQuery } from "@tanstack/react-query";
import { keystoneService } from "@/services/keystoneService";
import { contactService } from "@/services/contactService";
import { Keystone } from "@/types/keystone";
import { Contact } from "@/types/contact";
import { format } from "date-fns";
interface KeystoneFormProps {
  keystone?: Keystone | null;
  contacts?: Contact[];
  contact?: Contact;
  onSuccess: () => void;
  onCancel: () => void;
}
function KeystoneForm({
  keystone,
  contacts: propContacts = [],
  contact,
  onSuccess,
  onCancel
}: KeystoneFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    category: "",
    contact_id: "",
    contact_ids: [] as string[],
    is_recurring: false,
    recurrence_frequency: "",
    notes: ""
  });
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);

  // Fetch contacts if not provided via props
  const {
    data: fetchedContacts = []
  } = useQuery({
    queryKey: ['contacts'],
    queryFn: contactService.getContacts,
    enabled: propContacts.length === 0 && !contact // Only fetch if no contacts provided and no specific contact
  });

  // Use prop contacts, fetched contacts, or single contact
  const availableContacts = contact ? [contact] : propContacts.length > 0 ? propContacts : fetchedContacts;
  const defaultContactId = contact ? contact.id : "";

  // Populate form when editing
  useEffect(() => {
    if (keystone) {
      // Handle both legacy single contact and new multiple contacts
      const contactIds = keystone.contact_ids || (keystone.contact_id ? [keystone.contact_id] : []);
      const relatedContacts = availableContacts.filter(c => contactIds.includes(c.id));
      setFormData({
        title: keystone.title || "",
        date: keystone.date ? format(new Date(keystone.date), 'yyyy-MM-dd') : "",
        category: keystone.category || "",
        contact_id: keystone.contact_id || "",
        contact_ids: contactIds,
        is_recurring: keystone.is_recurring || false,
        recurrence_frequency: keystone.recurrence_frequency || "",
        notes: keystone.notes || ""
      });
      setSelectedContacts(relatedContacts);
    } else if (contact) {
      // Pre-select the contact if creating a new keystone for a specific contact
      setFormData(prev => ({
        ...prev,
        contact_id: contact.id,
        contact_ids: [contact.id]
      }));
      setSelectedContacts([contact]);
    }
  }, [keystone, contact, defaultContactId, availableContacts]);
  const createMutation = useMutation({
    mutationFn: keystoneService.createKeystone,
    onSuccess: onSuccess
  });
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data
    }: {
      id: string;
      data: Partial<Keystone>;
    }) => keystoneService.updateKeystone(id, data),
    onSuccess: onSuccess
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare contact data - use multiple contacts if available, fallback to single
    const contactIds = selectedContacts.map(c => c.id);
    const primaryContactId = contactIds.length > 0 ? contactIds[0] : undefined;
    const keystoneData = {
      title: formData.title,
      date: new Date(formData.date).toISOString(),
      category: formData.category || undefined,
      contact_id: primaryContactId,
      // Keep for backward compatibility
      contact_ids: contactIds.length > 0 ? contactIds : undefined,
      is_recurring: formData.is_recurring,
      recurrence_frequency: formData.is_recurring ? formData.recurrence_frequency : undefined,
      notes: formData.notes || undefined
    };
    if (keystone) {
      updateMutation.mutate({
        id: keystone.id,
        data: keystoneData
      });
    } else {
      createMutation.mutate(keystoneData);
    }
  };
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleContactsChange = (contacts: Contact[]) => {
    setSelectedContacts(contacts);
    const contactIds = contacts.map(c => c.id);
    setFormData(prev => ({
      ...prev,
      contact_ids: contactIds,
      contact_id: contactIds.length > 0 ? contactIds[0] : ""
    }));
  };
  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  return <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input id="title" value={formData.title} onChange={e => handleChange("title", e.target.value)} placeholder="Enter keystone title" required className="rounded-full" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date *</Label>
        <Input id="date" type="date" value={formData.date} onChange={e => handleChange("date", e.target.value)} required className="rounded-full" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={formData.category} onValueChange={value => handleChange("category", value)}>
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

      {/* Multi-contact selector - always show if contacts are available */}
      {availableContacts.length > 0 && <MultiContactSelector contacts={availableContacts} selectedContacts={selectedContacts} onSelectionChange={handleContactsChange} label="Associated Contacts" placeholder="Search contacts..." />}

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox id="recurring" checked={formData.is_recurring} onCheckedChange={checked => handleChange("is_recurring", checked)} />
          <Label htmlFor="recurring">Recurring</Label>
        </div>
      </div>

      {formData.is_recurring && <div className="space-y-2">
          <Label htmlFor="frequency">Recurrence Frequency</Label>
          <Select value={formData.recurrence_frequency} onValueChange={value => handleChange("recurrence_frequency", value)}>
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
        </div>}

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" value={formData.notes} onChange={e => handleChange("notes", e.target.value)} placeholder="Add any additional notes..." rows={3} className="rounded-2xl" />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="rounded-full">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="rounded-full bg-[s#30a2ed] bg-[#30a2ed]">
          {isSubmitting ? "Saving..." : keystone ? "Update Keystone" : "Create Keystone"}
        </Button>
      </div>
    </form>;
}
export default KeystoneForm;