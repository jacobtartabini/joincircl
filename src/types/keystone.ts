
export interface Keystone {
  id: string;
  title: string;
  date: string;
  due_date?: string;
  category?: string;
  contact_id?: string;
  contact_name?: string;
  user_id: string;
  is_recurring?: boolean;
  recurrence_frequency?: string;
  created_at: string;
  updated_at: string;
}

export interface KeystoneProps {
  id: string;
  title: string;
  date: string | Date;
  category?: string;
  contactId: string;
  contactName: string;
  isPast?: boolean;
}
