
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add Career Event</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="event_name">Event Name *</Label>
            <Input
              id="event_name"
              value={formData.event_name}
              onChange={(e) => handleInputChange('event_name', e.target.value)}
              placeholder="e.g. Tech Career Fair 2024"
              className="glass-input"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event_type">Event Type</Label>
            <Select value={formData.event_type} onValueChange={(value) => handleInputChange('event_type', value)}>
              <SelectTrigger className="glass-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="networking">Networking</SelectItem>
                <SelectItem value="career fair">Career Fair</SelectItem>
                <SelectItem value="conference">Conference</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="meetup">Meetup</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event_date">Event Date *</Label>
              <Input
                id="event_date"
                type="date"
                value={formData.event_date}
                onChange={(e) => handleInputChange('event_date', e.target.value)}
                className="glass-input"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contacts_met">Contacts Met</Label>
              <Input
                id="contacts_met"
                type="number"
                min="0"
                value={formData.contacts_met}
                onChange={(e) => handleInputChange('contacts_met', parseInt(e.target.value) || 0)}
                className="glass-input"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g. Convention Center, Virtual"
              className="glass-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Key takeaways, follow-up actions, etc."
              className="glass-input min-h-[80px]"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 glass-button">
              Add Event
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
