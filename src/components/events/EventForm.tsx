
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, User } from 'lucide-react'
import { format } from 'date-fns'
import { EventFormData } from '@/types/events'
import { keystoneService } from '@/services/keystoneService'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface EventFormProps {
  onSuccess: () => void
  onCancel: () => void
  preselectedContactId?: string
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
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const datetime = `${formData.date}T${formData.time || '00:00'}:00.000Z`

      if (formData.type === 'keystone') {
        await keystoneService.createKeystone({
          title: formData.title,
          date: datetime,
          category: formData.category || undefined,
          contact_id: formData.contact_ids?.[0] || null,
          is_recurring: formData.is_recurring,
          notes: formData.notes || undefined
        })
      } else if (formData.type === 'interaction') {
        const { error } = await supabase
          .from('interactions')
          .insert({
            contact_id: formData.contact_ids?.[0] || '',
            type: formData.category || 'general',
            date: datetime,
            notes: formData.notes || undefined
          })

        if (error) throw error
      }

      toast({
        title: "Event created",
        description: `${formData.type} "${formData.title}" has been created successfully.`,
      })
      
      onSuccess()
    } catch (error) {
      console.error('Error creating event:', error)
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Calendar className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Create New Event</h2>
          <p className="text-sm text-muted-foreground">Add a new event to your calendar</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="type">Event Type</Label>
          <Select 
            value={formData.type} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as 'keystone' | 'interaction' }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="keystone">Keystone Event</SelectItem>
              <SelectItem value="interaction">Interaction</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Event title"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            placeholder="Event category"
          />
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Additional notes about this event"
            rows={3}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? 'Creating...' : 'Create Event'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
