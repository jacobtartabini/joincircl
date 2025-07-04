
export interface UnifiedEvent {
  id: string
  title: string
  date: string
  time?: string
  end_date?: string
  all_day?: boolean
  type: 'keystone' | 'interaction' | 'birthday' | 'sync' | 'calendar'
  source: 'circl' | 'google' | 'outlook' | 'gmail'
  contact_ids?: string[]
  contact_names?: string[]
  category?: string
  notes?: string
  is_recurring?: boolean
  integration_id?: string
  external_id?: string
  created_at?: string
  updated_at?: string
}

export interface EventFormData {
  title: string
  date: string
  time?: string
  end_date?: string
  end_time?: string
  all_day?: boolean
  type: 'keystone' | 'interaction'
  contact_ids?: string[]
  category?: string
  notes?: string
  is_recurring?: boolean
  recurrence_frequency?: string
}

export interface EventFilters {
  type?: 'keystone' | 'interaction' | 'birthday' | 'sync' | 'calendar' | 'all'
  contact_id?: string
  date_from?: string
  date_to?: string
  search?: string
}
