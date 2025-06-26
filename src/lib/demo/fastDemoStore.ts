
import demoData from '@/fixtures/demoData.json';
import type { Contact } from '@/types/contact';
import type { Keystone } from '@/types/keystone';

// Fast demo store that works without MSW - loads instantly
class FastDemoStore {
  private data = {
    contacts: [...demoData.contacts],
    events: [...demoData.events],
    keystones: [...demoData.keystones],
    jobApplications: [...demoData.jobApplications],
    conversations: [...demoData.conversations]
  };

  // Type the contacts properly to match Contact interface
  private typeContact(contact: any): Contact {
    return {
      ...contact,
      circle: contact.circle as "inner" | "middle" | "outer",
      updated_at: contact.updated_at || contact.created_at
    };
  }

  // Type the keystones properly to match Keystone interface
  private typeKeystone(keystone: any): Keystone {
    return {
      ...keystone,
      updated_at: keystone.updated_at || keystone.created_at
    };
  }

  // Immediate synchronous data access
  getContacts(): Contact[] {
    return this.data.contacts
      .filter(contact => contact.user_id === 'demo-user-1')
      .map(contact => this.typeContact(contact));
  }

  getContact(id: string): Contact | undefined {
    const contact = this.data.contacts.find(contact => contact.id === id);
    return contact ? this.typeContact(contact) : undefined;
  }

  getEvents() {
    return this.data.events.filter(event => event.user_id === 'demo-user-1');
  }

  getKeystones(): Keystone[] {
    return this.data.keystones
      .filter(keystone => keystone.user_id === 'demo-user-1')
      .map(keystone => this.typeKeystone(keystone));
  }

  getJobApplications() {
    return this.data.jobApplications.filter(app => app.user_id === 'demo-user-1');
  }

  getConversations() {
    return this.data.conversations.filter(conv => conv.user_id === 'demo-user-1');
  }

  // Optimistic updates - immediately return success
  createContact(contactData: any): Contact {
    const newContact = {
      ...contactData,
      id: `contact-${Date.now()}`,
      user_id: 'demo-user-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.contacts.push(newContact);
    return this.typeContact(newContact);
  }

  updateContact(id: string, updates: any): Contact | null {
    const index = this.data.contacts.findIndex(contact => contact.id === id);
    if (index !== -1) {
      this.data.contacts[index] = {
        ...this.data.contacts[index],
        ...updates,
        updated_at: new Date().toISOString()
      };
      return this.typeContact(this.data.contacts[index]);
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
