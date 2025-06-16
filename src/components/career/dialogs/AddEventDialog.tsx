
import { useState } from "react";
import { GlassModal } from "@/components/ui/GlassModal";
import { Button } from "@/components/ui/button";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassTextarea } from "@/components/ui/GlassTextarea";
import { Label } from "@/components/ui/label";
import { GlassSelect, GlassSelectContent, GlassSelectItem, GlassSelectTrigger, GlassSelectValue } from "@/components/ui/GlassSelect";
import { Calendar } from "lucide-react";

interface EventFormData {
  event_name: string;
  event_type: string;
  event_date: string;
  location: string;
  contacts_met: number;
  notes: string;
}

interface AddEventDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (event: EventFormData) => void;
}

export function AddEventDialog({ isOpen, onOpenChange, onAdd }: AddEventDialogProps) {
  const [formData, setFormData] = useState<EventFormData>({
    event_name: '',
    event_type: 'networking',
    event_date: '',
    location: '',
    contacts_met: 0,
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.event_name && formData.event_date) {
      onAdd(formData);
      setFormData({
        event_name: '',
        event_type: 'networking',
        event_date: '',
        location: '',
        contacts_met: 0,
        notes: ''
      });
    }
  };

  const handleInputChange = (field: keyof EventFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <GlassModal
      open={isOpen}
      onOpenChange={onOpenChange}
      title="Add Career Event"
      subtitle="Track networking events and career activities"
      icon={Calendar}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="event_name">Event Name *</Label>
            <GlassInput
              id="event_name"
              value={formData.event_name}
              onChange={(e) => handleInputChange('event_name', e.target.value)}
              placeholder="e.g. Tech Career Fair 2024"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event_type">Event Type</Label>
            <GlassSelect value={formData.event_type} onValueChange={(value) => handleInputChange('event_type', value)}>
              <GlassSelectTrigger>
                <GlassSelectValue />
              </GlassSelectTrigger>
              <GlassSelectContent>
                <GlassSelectItem value="networking">Networking</GlassSelectItem>
                <GlassSelectItem value="career fair">Career Fair</GlassSelectItem>
                <GlassSelectItem value="conference">Conference</GlassSelectItem>
                <GlassSelectItem value="workshop">Workshop</GlassSelectItem>
                <GlassSelectItem value="meetup">Meetup</GlassSelectItem>
                <GlassSelectItem value="other">Other</GlassSelectItem>
              </GlassSelectContent>
            </GlassSelect>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event_date">Event Date *</Label>
              <GlassInput
                id="event_date"
                type="date"
                value={formData.event_date}
                onChange={(e) => handleInputChange('event_date', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contacts_met">Contacts Met</Label>
              <GlassInput
                id="contacts_met"
                type="number"
                min="0"
                value={formData.contacts_met}
                onChange={(e) => handleInputChange('contacts_met', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <GlassInput
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g. Convention Center, Virtual"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <GlassTextarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Key takeaways, follow-up actions, etc."
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-full bg-white/20 border-white/30 backdrop-blur-sm hover:bg-white/30"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            className="flex-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
          >
            Add Event
          </Button>
        </div>
      </form>
    </GlassModal>
  );
}
