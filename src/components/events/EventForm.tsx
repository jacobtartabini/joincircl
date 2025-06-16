
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GlassInput } from '@/components/ui/GlassInput';
import { GlassTextarea } from '@/components/ui/GlassTextarea';
import { Label } from '@/components/ui/label';
import { GlassSelect, GlassSelectContent, GlassSelectItem, GlassSelectTrigger, GlassSelectValue } from '@/components/ui/GlassSelect';
import { StandardModalHeader } from '@/components/ui/StandardModalHeader';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { EventFormData } from '@/types/events';
import { keystoneService } from '@/services/keystoneService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EventFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  preselectedContactId?: string;
}

export function EventForm({ onSuccess, onCancel, preselectedContactId }: EventFormProps) {
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
    type: 'keystone',
    contact_ids: preselectedContactId ? [preselectedContactId] : [],
    category: '',
    notes: '',
    is_recurring: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const datetime = `${formData.date}T${formData.time || '00:00'}:00.000Z`;

      if (formData.type === 'keystone') {
        await keystoneService.createKeystone({
          title: formData.title,
          date: datetime,
          category: formData.category || undefined,
          contact_id: formData.contact_ids?.[0] || null,
          is_recurring: formData.is_recurring,
          notes: formData.notes || undefined
        });
      } else if (formData.type === 'interaction') {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (!user || userError) {
          throw new Error('Failed to get user info for interaction event');
        }
        const { error } = await supabase
          .from('interactions')
          .insert({
            contact_id: formData.contact_ids?.[0] || '',
            type: formData.category || 'general',
            date: datetime,
            notes: formData.notes || undefined,
            user_id: user.id
          });

        if (error) throw error;
      }

      toast({
        title: "Event created",
        description: `${formData.type} "${formData.title}" has been created successfully.`,
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <StandardModalHeader
        icon={Calendar}
        title="Create New Event"
        subtitle="Add a new event to your calendar"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Event Type</Label>
            <GlassSelect 
              value={formData.type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as 'keystone' | 'interaction' }))}
            >
              <GlassSelectTrigger>
                <GlassSelectValue />
              </GlassSelectTrigger>
              <GlassSelectContent>
                <GlassSelectItem value="keystone">Keystone Event</GlassSelectItem>
                <GlassSelectItem value="interaction">Interaction</GlassSelectItem>
              </GlassSelectContent>
            </GlassSelect>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <GlassInput
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Event title"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <GlassInput
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <GlassInput
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <GlassInput
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              placeholder="Event category"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <GlassTextarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes about this event"
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="flex-1 rounded-full bg-white/20 border-white/30 backdrop-blur-sm hover:bg-white/30"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="flex-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
          >
            {isSubmitting ? 'Creating...' : 'Create Event'}
          </Button>
        </div>
      </form>
    </div>
  );
}
