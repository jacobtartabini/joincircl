
import demoData from '@/fixtures/demoData.json';

interface MockStore {
  users: any[];
  contacts: any[];
  events: any[];
  keystones: any[];
  jobApplications: any[];
  conversations: any[];
  interactions: any[];
}

class DemoMockStore {
  private store: MockStore;
  private initialized = false;

  constructor() {
    this.store = this.getInitialData();
    this.setupBeforeUnload();
  }

  private getInitialData(): MockStore {
    return {
      users: [...demoData.users],
      contacts: [...demoData.contacts],
      events: [...demoData.events],
      keystones: [...demoData.keystones],
      jobApplications: [...demoData.jobApplications],
      conversations: [...demoData.conversations],
      interactions: []
    };
  }

  private setupBeforeUnload() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.reset();
      });
    }
  }

  public initialize() {
    if (!this.initialized) {
      console.log('demo_visit', { timestamp: new Date().toISOString() });
      this.initialized = true;
    }
  }

  public reset() {
    this.store = this.getInitialData();
    console.log('Demo store reset with fresh data');
  }

  // Contacts
  public getContacts(userId: string) {
    return this.store.contacts.filter(contact => contact.user_id === userId);
  }

  public getContact(id: string) {
    return this.store.contacts.find(contact => contact.id === id);
  }

  public createContact(contactData: any) {
    const newContact = {
      ...contactData,
      id: `contact-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.store.contacts.push(newContact);
    console.log('demo_completed_action', { action: 'create_contact', timestamp: new Date().toISOString() });
    return newContact;
  }

  public updateContact(id: string, updates: any) {
    const index = this.store.contacts.findIndex(contact => contact.id === id);
    if (index !== -1) {
      this.store.contacts[index] = {
        ...this.store.contacts[index],
        ...updates,
        updated_at: new Date().toISOString()
      };
      console.log('demo_completed_action', { action: 'update_contact', timestamp: new Date().toISOString() });
      return this.store.contacts[index];
    }
    return null;
  }

  public deleteContact(id: string) {
    this.store.contacts = this.store.contacts.filter(contact => contact.id !== id);
    console.log('demo_completed_action', { action: 'delete_contact', timestamp: new Date().toISOString() });
  }

  // Events
  public getEvents(userId: string) {
    return this.store.events.filter(event => event.user_id === userId);
  }

  public createEvent(eventData: any) {
    const newEvent = {
      ...eventData,
      id: `event-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    this.store.events.push(newEvent);
    console.log('demo_completed_action', { action: 'create_event', timestamp: new Date().toISOString() });
    return newEvent;
  }

  // Keystones
  public getKeystones(userId: string) {
    return this.store.keystones.filter(keystone => keystone.user_id === userId);
  }

  public createKeystone(keystoneData: any) {
    const newKeystone = {
      ...keystoneData,
      id: `keystone-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.store.keystones.push(newKeystone);
    console.log('demo_completed_action', { action: 'create_keystone', timestamp: new Date().toISOString() });
    return newKeystone;
  }

  // Job Applications
  public getJobApplications(userId: string) {
    return this.store.jobApplications.filter(app => app.user_id === userId);
  }

  public createJobApplication(appData: any) {
    const newApp = {
      ...appData,
      id: `job-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.store.jobApplications.push(newApp);
    console.log('demo_completed_action', { action: 'create_job_application', timestamp: new Date().toISOString() });
    return newApp;
  }

  // Conversations
  public getConversations(userId: string) {
    return this.store.conversations.filter(conv => conv.user_id === userId);
  }

  public createConversation(convData: any) {
    const newConv = {
      ...convData,
      id: `conv-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.store.conversations.push(newConv);
    console.log('demo_completed_action', { action: 'create_conversation', timestamp: new Date().toISOString() });
    return newConv;
  }

  public updateConversation(id: string, updates: any) {
    const index = this.store.conversations.findIndex(conv => conv.id === id);
    if (index !== -1) {
      this.store.conversations[index] = {
        ...this.store.conversations[index],
        ...updates,
        updated_at: new Date().toISOString()
      };
      console.log('demo_completed_action', { action: 'update_conversation', timestamp: new Date().toISOString() });
      return this.store.conversations[index];
    }
    return null;
  }
}

export const demoMockStore = new DemoMockStore();
