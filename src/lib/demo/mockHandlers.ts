
import { http, HttpResponse } from 'msw';
import { demoMockStore } from './mockStore';

const SUPABASE_URL = 'https://ubxepyzyzctzwsxxzjot.supabase.co';

export const mockHandlers = [
  // Contacts endpoints
  http.get(`${SUPABASE_URL}/rest/v1/contacts`, ({ request }) => {
    const url = new URL(request.url);
    const userId = 'demo-user-1'; // Always use demo user in sandbox
    const contacts = demoMockStore.getContacts(userId);
    
    return HttpResponse.json(contacts, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }),

  http.post(`${SUPABASE_URL}/rest/v1/contacts`, async ({ request }) => {
    const contactData = await request.json() as any;
    const newContact = demoMockStore.createContact({
      ...(contactData || {}),
      user_id: 'demo-user-1'
    });
    
    return HttpResponse.json([newContact], {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }),

  http.patch(`${SUPABASE_URL}/rest/v1/contacts`, async ({ request }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get('id')?.replace('eq.', '');
    const updates = await request.json() as any;
    
    if (id) {
      const updatedContact = demoMockStore.updateContact(id, updates || {});
      return HttpResponse.json([updatedContact]);
    }
    
    return HttpResponse.json([], { status: 404 });
  }),

  // Events endpoints
  http.get(`${SUPABASE_URL}/rest/v1/events`, () => {
    const events = demoMockStore.getEvents('demo-user-1');
    return HttpResponse.json(events);
  }),

  http.post(`${SUPABASE_URL}/rest/v1/events`, async ({ request }) => {
    const eventData = await request.json() as any;
    const newEvent = demoMockStore.createEvent({
      ...(eventData || {}),
      user_id: 'demo-user-1'
    });
    
    return HttpResponse.json([newEvent], {
      status: 201
    });
  }),

  // Keystones endpoints
  http.get(`${SUPABASE_URL}/rest/v1/keystones`, () => {
    const keystones = demoMockStore.getKeystones('demo-user-1');
    return HttpResponse.json(keystones);
  }),

  http.post(`${SUPABASE_URL}/rest/v1/keystones`, async ({ request }) => {
    const keystoneData = await request.json() as any;
    const newKeystone = demoMockStore.createKeystone({
      ...(keystoneData || {}),
      user_id: 'demo-user-1'
    });
    
    return HttpResponse.json([newKeystone], {
      status: 201
    });
  }),

  // Job Applications endpoints
  http.get(`${SUPABASE_URL}/rest/v1/job_applications`, () => {
    const jobApps = demoMockStore.getJobApplications('demo-user-1');
    return HttpResponse.json(jobApps);
  }),

  http.post(`${SUPABASE_URL}/rest/v1/job_applications`, async ({ request }) => {
    const appData = await request.json() as any;
    const newApp = demoMockStore.createJobApplication({
      ...(appData || {}),
      user_id: 'demo-user-1'
    });
    
    return HttpResponse.json([newApp], {
      status: 201
    });
  }),

  // Conversations endpoints
  http.get(`${SUPABASE_URL}/rest/v1/conversations`, () => {
    const conversations = demoMockStore.getConversations('demo-user-1');
    return HttpResponse.json(conversations);
  }),

  http.post(`${SUPABASE_URL}/rest/v1/conversations`, async ({ request }) => {
    const convData = await request.json() as any;
    const newConv = demoMockStore.createConversation({
      ...(convData || {}),
      user_id: 'demo-user-1'
    });
    
    return HttpResponse.json([newConv], {
      status: 201
    });
  }),

  http.patch(`${SUPABASE_URL}/rest/v1/conversations`, async ({ request }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get('id')?.replace('eq.', '');
    const updates = await request.json() as any;
    
    if (id) {
      const updatedConv = demoMockStore.updateConversation(id, updates || {});
      return HttpResponse.json([updatedConv]);
    }
    
    return HttpResponse.json([], { status: 404 });
  }),

  // Auth endpoints - always return demo user
  http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
    return HttpResponse.json({
      access_token: 'demo-token',
      refresh_token: 'demo-refresh',
      expires_in: 3600,
      token_type: 'bearer',
      user: {
        id: 'demo-user-1',
        email: 'demo@circl.com'
      }
    });
  }),

  // Profile endpoints
  http.get(`${SUPABASE_URL}/rest/v1/profiles`, () => {
    return HttpResponse.json([{
      id: 'demo-user-1',
      email: 'demo@circl.com',
      full_name: 'Demo User',
      avatar_url: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      has_seen_tutorial: true,
      onboarding_completed: true
    }]);
  }),

  // Generic fallback for other Supabase endpoints
  http.get(`${SUPABASE_URL}/rest/v1/*`, () => {
    return HttpResponse.json([]);
  }),

  http.post(`${SUPABASE_URL}/rest/v1/*`, () => {
    return HttpResponse.json([{}], { status: 201 });
  }),

  http.patch(`${SUPABASE_URL}/rest/v1/*`, () => {
    return HttpResponse.json([{}]);
  }),

  http.delete(`${SUPABASE_URL}/rest/v1/*`, () => {
    return HttpResponse.json(null, { status: 204 });
  })
];
