
import { format, parseISO } from 'date-fns'
import { keystoneService } from './keystoneService'
import { supabase } from '@/integrations/supabase/client'
import { UnifiedEvent } from '@/types/events'

export const eventsService = {
  async getAllEvents(contactId?: string): Promise<UnifiedEvent[]> {
    try {
      const events: UnifiedEvent[] = []

      // Get keystones
      const keystones = contactId 
        ? await keystoneService.getKeystonesByContactId(contactId)
        : await keystoneService.getKeystones()

      keystones.forEach(keystone => {
        events.push({
          id: keystone.id,
          title: keystone.title,
          date: keystone.date,
          time: format(parseISO(keystone.date), 'HH:mm'),
          type: 'keystone',
          source: 'circl',
          contact_ids: keystone.contact_id ? [keystone.contact_id] : [],
          category: keystone.category || undefined,
          notes: keystone.notes || undefined,
          is_recurring: keystone.is_recurring || false,
          created_at: keystone.created_at,
          updated_at: keystone.updated_at
        })
      })

      // Get interactions
      const { data: interactions } = await supabase
        .from('interactions')
        .select(`
          *,
          contacts!inner(id, name)
        `)
        .eq(contactId ? 'contact_id' : 'id', contactId || 'id')

      if (interactions) {
        interactions.forEach(interaction => {
          events.push({
            id: interaction.id,
            title: `${interaction.type} interaction`,
            date: interaction.date || interaction.created_at,
            time: format(parseISO(interaction.date || interaction.created_at), 'HH:mm'),
            type: 'interaction',
            source: 'circl',
            contact_ids: [interaction.contact_id],
            contact_names: [(interaction as any).contacts?.name],
            notes: interaction.notes || undefined,
            created_at: interaction.created_at
          })
        })
      }

      // Get birthdays from contacts
      const { data: contactsWithBirthdays } = await supabase
        .from('contacts')
        .select('id, name, birthday')
        .not('birthday', 'is', null)
        .eq(contactId ? 'id' : 'user_id', contactId || (await supabase.auth.getUser()).data.user?.id)

      if (contactsWithBirthdays) {
        contactsWithBirthdays.forEach(contact => {
          if (contact.birthday) {
            // Create birthday event for current year
            const currentYear = new Date().getFullYear()
            const birthdayThisYear = `${currentYear}-${contact.birthday.slice(5)}`
            
            events.push({
              id: `birthday-${contact.id}-${currentYear}`,
              title: `${contact.name}'s Birthday`,
              date: birthdayThisYear,
              time: '00:00',
              type: 'birthday',
              source: 'circl',
              contact_ids: [contact.id],
              contact_names: [contact.name],
              is_recurring: true
            })
          }
        })
      }

      // Sort events by date
      return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    } catch (error) {
      console.error('Error fetching events:', error)
      return []
    }
  },

  async getEventsByContactId(contactId: string): Promise<UnifiedEvent[]> {
    return this.getAllEvents(contactId)
  }
}
