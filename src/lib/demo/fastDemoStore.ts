
import demoData from '@/fixtures/demoData.json';

// Fast demo store that works without MSW - loads instantly
class FastDemoStore {
  private data = {
    contacts: [...demoData.contacts],
    events: [...demoData.events],
    keystones: [...demoData.keystones],
    jobApplications: [...demoData.jobApplications],
    conversations: [...demoData.conversations]
  };

  // Immediate synchronous data access
  getContacts() {
    return this.data.contacts.filter(contact => contact.user_id === 'demo-user-1');
  }

  getContact(id: string) {
    return this.data.contacts.find(contact => contact.id === id);
  }

  getEvents() {
    return this.data.events.filter(event => event.user_id === 'demo-user-1');
  }

  getKeystones() {
    return this.data.keystones.filter(keystone => keystone.user_id === 'demo-user-1');
  }

  getJobApplications() {
    return this.data.jobApplications.filter(app => app.user_id === 'demo-user-1');
  }

  getConversations() {
    return this.data.conversations.filter(conv => conv.user_id === 'demo-user-1');
  }

  // Optimistic updates - immediately return success
  createContact(contactData: any) {
    const newContact = {
      ...contactData,
      id: `contact-${Date.now()}`,
      user_id: 'demo-user-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.contacts.push(newContact);
    return newContact;
  }

  updateContact(id: string, updates: any) {
    const index = this.data.contacts.findIndex(contact => contact.id === id);
    if (index !== -1) {
      this.data.contacts[index] = {
        ...this.data.contacts[index],
        ...updates,
        updated_at: new Date().toISOString()
      };
      return this.data.contacts[index];
    }
    return null;
  }

  createEvent(eventData: any) {
    const newEvent = {
      ...eventData,
      id: `event-${Date.now()}`,
      user_id: 'demo-user-1',
      created_at: new Date().toISOString()
    };
    this.data.events.push(newEvent);
    return newEvent;
  }
}

export const fastDemoStore = new FastDemoStore();
