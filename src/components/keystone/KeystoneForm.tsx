
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassTextarea } from "@/components/ui/GlassTextarea";
import { Label } from "@/components/ui/label";
import { GlassSelect, GlassSelectContent, GlassSelectItem, GlassSelectTrigger, GlassSelectValue } from "@/components/ui/GlassSelect";
import { Checkbox } from "@/components/ui/checkbox";
import { MultiContactSelector } from "@/components/ui/multi-contact-selector";
import { useMutation, useQuery } from "@tanstack/react-query";
import { keystoneService } from "@/services/keystoneService";
import { contactService } from "@/services/contactService";
import { useToast } from "@/hooks/use-toast";
import { Contact, Keystone } from "@/types/keystone";
import { StandardModalHeader } from "@/components/ui/StandardModalHeader";
import { Calendar } from "lucide-react";

interface KeystoneFormProps {
  keystone?: Keystone;
  onSuccess: (keystone?: Keystone) => void;
  onCancel: () => void;
}

export default function KeystoneForm({ keystone, onSuccess, onCancel }: KeystoneFormProps) {
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [formData, setFormData] = useState({
    title: keystone?.title || '',
    date: keystone?.date ? new Date(keystone.date).toISOString().split('T')[0] : '',
    time: keystone?.date ? new Date(keystone.date).toTimeString().slice(0, 5) : '',
    category: keystone?.category || '',
    notes: keystone?.notes || '',
    is_recurring: keystone?.is_recurring || false,
    recurrence_frequency: keystone?.recurrence_frequency || 'monthly'
  });

  const { toast } = useToast();

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: contactService.getContacts
  });

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
    if (keystone?.contact_id && contacts.length > 0) {
      const contact = contacts.find(c => c.id === keystone.contact_id);
      if (contact) {
        setSelectedContacts([contact]);
      }
    }
  }, [keystone?.contact_id, contacts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const datetime = `${formData.date}T${formData.time || '00:00'}:00.000Z`;
    
    const keystoneData = {
      title: formData.title,
      date: datetime,
      category: formData.category || undefined,
      contact_id: selectedContacts[0]?.id || null,
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

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <StandardModalHeader
        icon={Calendar}
        title={keystone ? 'Edit Keystone' : 'Create New Keystone'}
        subtitle="Plan and track important life events"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <GlassInput
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g. Annual Performance Review"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <GlassInput
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <GlassInput
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
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
            <Label>Related Contact</Label>
            <div className="rounded-xl border border-white/30 bg-white/40 dark:bg-white/5 dark:border-white/15 backdrop-blur-sm p-3">
              <MultiContactSelector
                contacts={contacts}
                selectedContacts={selectedContacts}
                onSelectionChange={setSelectedContacts}
                maxSelection={1}
                label=""
                placeholder="Search for a contact..."
                className="w-full bg-transparent border-0"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_recurring"
                checked={formData.is_recurring}
                onCheckedChange={(checked) => handleInputChange('is_recurring', checked)}
              />
              <Label htmlFor="is_recurring">Recurring event</Label>
            </div>

            {formData.is_recurring && (
              <div className="space-y-2">
                <Label htmlFor="recurrence_frequency">Frequency</Label>
                <GlassSelect value={formData.recurrence_frequency} onValueChange={(value) => handleInputChange('recurrence_frequency', value)}>
                  <GlassSelectTrigger>
                    <GlassSelectValue />
                  </GlassSelectTrigger>
                  <GlassSelectContent>
                    <GlassSelectItem value="daily">Daily</GlassSelectItem>
                    <GlassSelectItem value="weekly">Weekly</GlassSelectItem>
                    <GlassSelectItem value="monthly">Monthly</GlassSelectItem>
                    <GlassSelectItem value="yearly">Yearly</GlassSelectItem>
                  </GlassSelectContent>
                </GlassSelect>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <GlassTextarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional details about this keystone..."
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 rounded-full bg-white/20 border-white/30 backdrop-blur-sm hover:bg-white/30"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
          >
            {isLoading ? 'Saving...' : keystone ? 'Update Keystone' : 'Create Keystone'}
          </Button>
        </div>
      </form>
    </div>
  );
}
