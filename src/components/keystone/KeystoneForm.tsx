import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassTextarea } from "@/components/ui/GlassTextarea";
import { Label } from "@/components/ui/label";
import { GlassSelect, GlassSelectContent, GlassSelectItem, GlassSelectTrigger, GlassSelectValue } from "@/components/ui/GlassSelect";
import { Switch } from "@/components/ui/switch";
import { MultiContactSelector } from "@/components/ui/multi-contact-selector";
import { RecurringScheduler } from "@/components/ui/scheduler";
import { useMutation, useQuery } from "@tanstack/react-query";
import { keystoneService } from "@/services/keystoneService";
import { contactService } from "@/services/contactService";
import { useToast } from "@/hooks/use-toast";
import { Contact } from "@/types/contact";
import { Keystone } from "@/types/keystone";
import { StandardModalHeader } from "@/components/ui/StandardModalHeader";
import { Calendar } from "lucide-react";

interface KeystoneFormProps {
  keystone?: Keystone;
  contact?: Contact;
  prefilledData?: {
    date?: string;
    time?: string;
    endDate?: string;
    endTime?: string;
    all_day?: boolean;
  };
  onSuccess: (keystone?: Keystone) => void;
  onCancel: () => void;
}

export default function KeystoneForm({ keystone, contact, prefilledData, onSuccess, onCancel }: KeystoneFormProps) {
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    title: keystone?.title || '',
    date: keystone?.date 
      ? new Date(keystone.date).toISOString().split('T')[0] 
      : prefilledData?.date || '',
    time: keystone?.date 
      ? new Date(keystone.date).toTimeString().slice(0, 5) 
      : prefilledData?.time || '',
    end_date: keystone?.end_date 
      ? new Date(keystone.end_date).toISOString().split('T')[0] 
      : prefilledData?.endDate || '',
    end_time: keystone?.end_date 
      ? new Date(keystone.end_date).toTimeString().slice(0, 5) 
      : prefilledData?.endTime || '',
    all_day: keystone?.all_day || prefilledData?.all_day || false,
    category: keystone?.category || '',
    notes: keystone?.notes || '',
    is_recurring: keystone?.is_recurring || false,
    recurrence_frequency: keystone?.recurrence_frequency || 'monthly'
  });

  const daysOfWeek = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const { toast } = useToast();

  const { data: contactsResult = { contacts: [], totalCount: 0, totalPages: 0 } } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => contactService.getContacts({ itemsPerPage: 1000 })
  });

  const contacts = contactsResult.contacts;

  const createMutation = useMutation({
    mutationFn: keystoneService.createKeystone,
    onSuccess: (data) => {
      toast({
        title: "Keystone created",
        description: "Your keystone has been created successfully.",
      });
      onSuccess(data);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create keystone",
        variant: "destructive",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      keystoneService.updateKeystone(id, data),
    onSuccess: (data) => {
      toast({
        title: "Keystone updated",
        description: "Your keystone has been updated successfully.",
      });
      onSuccess(data);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update keystone",
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    if (contact) {
      setSelectedContacts([contact]);
    } else if (keystone?.contact_id && contacts.length > 0) {
      const existingContact = contacts.find(c => c.id === keystone.contact_id);
      if (existingContact) {
        setSelectedContacts([existingContact]);
      }
    }
  }, [keystone?.contact_id, contacts, contact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const datetime = formData.all_day 
      ? `${formData.date}T00:00:00.000Z`
      : `${formData.date}T${formData.time || '00:00'}:00.000Z`;
    
    let endDatetime = null;
    if (formData.end_date) {
      endDatetime = formData.all_day
        ? `${formData.end_date}T23:59:59.999Z`
        : `${formData.end_date}T${formData.end_time || '23:59'}:00.000Z`;
    }
    
    const keystoneData = {
      title: formData.title,
      date: datetime,
      end_date: endDatetime,
      all_day: formData.all_day,
      category: formData.category || undefined,
      contact_id: selectedContacts[0]?.id || null,
      is_recurring: formData.is_recurring,
      recurrence_frequency: formData.is_recurring ? formData.recurrence_frequency : undefined,
      recurring_days: formData.is_recurring && selectedDays.size > 0 ? Array.from(selectedDays) : undefined,
      notes: formData.notes || undefined
    };

    console.log('Submitting keystone with recurring days:', keystoneData.recurring_days);

    if (keystone) {
      updateMutation.mutate({ id: keystone.id, data: keystoneData });
    } else {
      createMutation.mutate(keystoneData);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleRecurring = () => {
    setFormData(prev => ({ ...prev, is_recurring: !prev.is_recurring }));
  };

  const toggleAllDay = () => {
    setFormData(prev => ({ 
      ...prev, 
      all_day: !prev.all_day,
      // Clear times when switching to all-day
      time: !prev.all_day ? '' : prev.time,
      end_time: !prev.all_day ? '' : prev.end_time
    }));
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <StandardModalHeader
        icon={Calendar}
        title={keystone ? 'Edit Keystone' : 'Create New Keystone'}
        subtitle="Plan and track important life events"
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">Title *</Label>
            <GlassInput
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g. Annual Performance Review"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium">Start Date *</Label>
              <GlassInput
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                required
              />
            </div>
            {!formData.all_day && (
              <div className="space-y-2">
                <Label htmlFor="time" className="text-sm font-medium">Start Time</Label>
                <GlassInput
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch 
                id="all-day" 
                checked={formData.all_day}
                onCheckedChange={toggleAllDay}
              />
              <Label htmlFor="all-day" className="text-sm font-medium">All Day Event</Label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="end_date" className="text-sm font-medium">End Date (Optional)</Label>
              <GlassInput
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                min={formData.date} // Ensure end date is not before start date
              />
            </div>
            {!formData.all_day && formData.end_date && (
              <div className="space-y-2">
                <Label htmlFor="end_time" className="text-sm font-medium">End Time</Label>
                <GlassInput
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => handleInputChange('end_time', e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">Category</Label>
            <GlassSelect value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
              <GlassSelectTrigger>
                <GlassSelectValue placeholder="Select a category" />
              </GlassSelectTrigger>
              <GlassSelectContent>
                <GlassSelectItem value="personal">Personal</GlassSelectItem>
                <GlassSelectItem value="professional">Professional</GlassSelectItem>
                <GlassSelectItem value="health">Health</GlassSelectItem>
                <GlassSelectItem value="education">Education</GlassSelectItem>
                <GlassSelectItem value="relationship">Relationship</GlassSelectItem>
                <GlassSelectItem value="milestone">Milestone</GlassSelectItem>
                <GlassSelectItem value="other">Other</GlassSelectItem>
              </GlassSelectContent>
            </GlassSelect>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Related Contact</Label>
            <div className="rounded-xl border-2 border-white/40 dark:border-white/25 bg-white/50 dark:bg-white/8 backdrop-blur-sm p-3">
              <MultiContactSelector
                contacts={contacts}
                selectedContacts={selectedContacts}
                onSelectionChange={setSelectedContacts}
                label=""
                placeholder="Search for a contact..."
                className="w-full bg-transparent border-0"
              />
            </div>
          </div>

          <RecurringScheduler
            isRepeating={formData.is_recurring}
            toggleRepeating={toggleRecurring}
            repeatInterval={formData.recurrence_frequency}
            setRepeatInterval={(interval) => handleInputChange('recurrence_frequency', interval)}
            daysOfWeek={daysOfWeek}
            selectedDays={selectedDays}
            onDaysChange={setSelectedDays}
          />

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
            <GlassTextarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional details about this keystone..."
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 rounded-full bg-white/20 border-white/40 backdrop-blur-sm hover:bg-white/30"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 rounded-full bg-primary hover:bg-primary/90 text-white border-0"
          >
            {isLoading ? 'Saving...' : keystone ? 'Update Keystone' : 'Create Keystone'}
          </Button>
        </div>
      </form>
    </div>
  );
}
