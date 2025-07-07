export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      application_workflow_data: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          job_application_id: string | null
          stage: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          job_application_id?: string | null
          stage: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          job_application_id?: string | null
          stage?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_workflow_data_job_application_id_fkey"
            columns: ["job_application_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_suggestions: {
        Row: {
          contact_id: string | null
          created_at: string
          id: string
          is_read: boolean
          suggestion: string
          type: string
          urgency: string
          user_id: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          suggestion: string
          type: string
          urgency?: string
          user_id: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          suggestion?: string
          type?: string
          urgency?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_suggestions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          all_day: boolean | null
          attendees: Json | null
          contact_ids: string[] | null
          created_at: string | null
          description: string | null
          end_time: string | null
          event_id: string
          id: string
          location: string | null
          metadata: Json | null
          provider: string
          start_time: string
          summary: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          all_day?: boolean | null
          attendees?: Json | null
          contact_ids?: string[] | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          event_id: string
          id?: string
          location?: string | null
          metadata?: Json | null
          provider: string
          start_time: string
          summary?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          all_day?: boolean | null
          attendees?: Json | null
          contact_ids?: string[] | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          event_id?: string
          id?: string
          location?: string | null
          metadata?: Json | null
          provider?: string
          start_time?: string
          summary?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      career_documents: {
        Row: {
          contact_id: string | null
          created_at: string
          document_name: string
          document_type: string
          file_size: number | null
          file_url: string | null
          id: string
          job_application_id: string | null
          storage_path: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          document_name: string
          document_type: string
          file_size?: number | null
          file_url?: string | null
          id?: string
          job_application_id?: string | null
          storage_path?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          document_name?: string
          document_type?: string
          file_size?: number | null
          file_url?: string | null
          id?: string
          job_application_id?: string | null
          storage_path?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_documents_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "career_documents_job_application_id_fkey"
            columns: ["job_application_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      career_events: {
        Row: {
          contacts_met: number | null
          created_at: string
          event_date: string
          event_name: string
          event_type: string
          id: string
          location: string | null
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contacts_met?: number | null
          created_at?: string
          event_date: string
          event_name: string
          event_type: string
          id?: string
          location?: string | null
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          contacts_met?: number | null
          created_at?: string
          event_date?: string
          event_name?: string
          event_type?: string
          id?: string
          location?: string | null
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contact_media: {
        Row: {
          contact_id: string
          created_at: string
          file_name: string
          file_type: string
          id: string
          is_image: boolean
          storage_path: string
          user_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          file_name: string
          file_type: string
          id?: string
          is_image: boolean
          storage_path: string
          user_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          file_name?: string
          file_type?: string
          id?: string
          is_image?: boolean
          storage_path?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_media_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          avatar_url: string | null
          birthday: string | null
          career_event_id: string | null
          career_priority: boolean | null
          career_tags: string[] | null
          circle: string
          company_name: string | null
          created_at: string | null
          department: string | null
          emails: Json | null
          facebook: string | null
          graduation_year: number | null
          hobbies_interests: string | null
          how_met: string | null
          id: string
          industry: string | null
          instagram: string | null
          job_title: string | null
          last_contact: string | null
          linkedin: string | null
          location: string | null
          major: string | null
          minor: string | null
          mobile_phone: string | null
          name: string
          notes: string | null
          personal_email: string | null
          referral_potential: string | null
          tags: string[] | null
          twitter: string | null
          university: string | null
          updated_at: string | null
          user_id: string
          website: string | null
          work_address: string | null
        }
        Insert: {
          avatar_url?: string | null
          birthday?: string | null
          career_event_id?: string | null
          career_priority?: boolean | null
          career_tags?: string[] | null
          circle?: string
          company_name?: string | null
          created_at?: string | null
          department?: string | null
          emails?: Json | null
          facebook?: string | null
          graduation_year?: number | null
          hobbies_interests?: string | null
          how_met?: string | null
          id?: string
          industry?: string | null
          instagram?: string | null
          job_title?: string | null
          last_contact?: string | null
          linkedin?: string | null
          location?: string | null
          major?: string | null
          minor?: string | null
          mobile_phone?: string | null
          name: string
          notes?: string | null
          personal_email?: string | null
          referral_potential?: string | null
          tags?: string[] | null
          twitter?: string | null
          university?: string | null
          updated_at?: string | null
          user_id: string
          website?: string | null
          work_address?: string | null
        }
        Update: {
          avatar_url?: string | null
          birthday?: string | null
          career_event_id?: string | null
          career_priority?: boolean | null
          career_tags?: string[] | null
          circle?: string
          company_name?: string | null
          created_at?: string | null
          department?: string | null
          emails?: Json | null
          facebook?: string | null
          graduation_year?: number | null
          hobbies_interests?: string | null
          how_met?: string | null
          id?: string
          industry?: string | null
          instagram?: string | null
          job_title?: string | null
          last_contact?: string | null
          linkedin?: string | null
          location?: string | null
          major?: string | null
          minor?: string | null
          mobile_phone?: string | null
          name?: string
          notes?: string | null
          personal_email?: string | null
          referral_potential?: string | null
          tags?: string[] | null
          twitter?: string | null
          university?: string | null
          updated_at?: string | null
          user_id?: string
          website?: string | null
          work_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_career_event_id_fkey"
            columns: ["career_event_id"]
            isOneToOne: false
            referencedRelation: "career_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          messages: Json
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          messages?: Json
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          messages?: Json
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_interactions: {
        Row: {
          contact_id: string | null
          created_at: string | null
          email_id: string
          id: string
          labels: string[] | null
          metadata: Json | null
          received_at: string
          sender_email: string
          sender_name: string | null
          snippet: string | null
          subject: string | null
          thread_id: string | null
          user_id: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string | null
          email_id: string
          id?: string
          labels?: string[] | null
          metadata?: Json | null
          received_at: string
          sender_email: string
          sender_name?: string | null
          snippet?: string | null
          subject?: string | null
          thread_id?: string | null
          user_id: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string | null
          email_id?: string
          id?: string
          labels?: string[] | null
          metadata?: Json | null
          received_at?: string
          sender_email?: string
          sender_name?: string | null
          snippet?: string | null
          subject?: string | null
          thread_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_interactions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          created_at: string
          email_type: string
          error_message: string | null
          id: string
          recipient: string
          resend_id: string | null
          sent_at: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_type: string
          error_message?: string | null
          id?: string
          recipient: string
          resend_id?: string | null
          sent_at?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_type?: string
          error_message?: string | null
          id?: string
          recipient?: string
          resend_id?: string | null
          sent_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      interactions: {
        Row: {
          contact_id: string
          created_at: string | null
          date: string | null
          id: string
          notes: string | null
          type: string
          user_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string | null
          date?: string | null
          id?: string
          notes?: string | null
          type: string
          user_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string | null
          date?: string | null
          id?: string
          notes?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interactions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_sessions: {
        Row: {
          arlo_feedback: Json
          confidence_score: number | null
          contact_id: string | null
          created_at: string
          duration_minutes: number | null
          id: string
          job_application_id: string | null
          questions: Json
          responses: Json
          session_title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          arlo_feedback?: Json
          confidence_score?: number | null
          contact_id?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          job_application_id?: string | null
          questions?: Json
          responses?: Json
          session_title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          arlo_feedback?: Json
          confidence_score?: number | null
          contact_id?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          job_application_id?: string | null
          questions?: Json
          responses?: Json
          session_title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_sessions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_sessions_job_application_id_fkey"
            columns: ["job_application_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          applied_date: string | null
          arlo_insights: Json | null
          company_name: string
          contact_id: string | null
          created_at: string
          follow_up_date: string | null
          id: string
          interview_date: string | null
          interviewer_contacts: string[] | null
          job_description: string | null
          job_title: string
          job_url: string | null
          notes: string | null
          salary_range: string | null
          stage_completion: Json | null
          status: string
          updated_at: string
          user_id: string
          workflow_stage: string | null
        }
        Insert: {
          applied_date?: string | null
          arlo_insights?: Json | null
          company_name: string
          contact_id?: string | null
          created_at?: string
          follow_up_date?: string | null
          id?: string
          interview_date?: string | null
          interviewer_contacts?: string[] | null
          job_description?: string | null
          job_title: string
          job_url?: string | null
          notes?: string | null
          salary_range?: string | null
          stage_completion?: Json | null
          status?: string
          updated_at?: string
          user_id: string
          workflow_stage?: string | null
        }
        Update: {
          applied_date?: string | null
          arlo_insights?: Json | null
          company_name?: string
          contact_id?: string | null
          created_at?: string
          follow_up_date?: string | null
          id?: string
          interview_date?: string | null
          interviewer_contacts?: string[] | null
          job_description?: string | null
          job_title?: string
          job_url?: string | null
          notes?: string | null
          salary_range?: string | null
          stage_completion?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
          workflow_stage?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      keystones: {
        Row: {
          all_day: boolean | null
          category: string | null
          contact_id: string | null
          created_at: string | null
          date: string
          end_date: string | null
          id: string
          is_recurring: boolean | null
          notes: string | null
          recurrence_frequency: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          all_day?: boolean | null
          category?: string | null
          contact_id?: string | null
          created_at?: string | null
          date: string
          end_date?: string | null
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          recurrence_frequency?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          all_day?: boolean | null
          category?: string | null
          contact_id?: string | null
          created_at?: string | null
          date?: string
          end_date?: string | null
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          recurrence_frequency?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "keystones_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "keystones_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_automations: {
        Row: {
          channel: string
          contact_id: string | null
          created_at: string
          id: string
          message: string
          sent_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          channel: string
          contact_id?: string | null
          created_at?: string
          id?: string
          message: string
          sent_at?: string | null
          status: string
          user_id: string
        }
        Update: {
          channel?: string
          contact_id?: string | null
          created_at?: string
          id?: string
          message?: string
          sent_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_automations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          additional_notes: string | null
          avatar_url: string | null
          bio: string | null
          company_name: string | null
          created_at: string | null
          email: string
          first_name: string | null
          full_name: string | null
          goals: string | null
          has_seen_tutorial: boolean | null
          how_heard_about_us: string | null
          id: string
          job_title: string | null
          last_name: string | null
          location: string | null
          onboarding_completed: boolean | null
          onboarding_completed_at: string | null
          onboarding_step_completed: Json | null
          phone_number: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          additional_notes?: string | null
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          full_name?: string | null
          goals?: string | null
          has_seen_tutorial?: boolean | null
          how_heard_about_us?: string | null
          id: string
          job_title?: string | null
          last_name?: string | null
          location?: string | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          onboarding_step_completed?: Json | null
          phone_number?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          additional_notes?: string | null
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          full_name?: string | null
          goals?: string | null
          has_seen_tutorial?: boolean | null
          how_heard_about_us?: string | null
          id?: string
          job_title?: string | null
          last_name?: string | null
          location?: string | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          onboarding_step_completed?: Json | null
          phone_number?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      social_posts: {
        Row: {
          contact_id: string | null
          content: string
          created_at: string | null
          id: string
          metadata: Json | null
          platform: string
          post_id: string
          post_url: string | null
          posted_at: string
          summary: string | null
          user_id: string
        }
        Insert: {
          contact_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          platform: string
          post_id: string
          post_url?: string | null
          posted_at: string
          summary?: string | null
          user_id: string
        }
        Update: {
          contact_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          platform?: string
          post_id?: string
          post_url?: string | null
          posted_at?: string
          summary?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_logs: {
        Row: {
          contact_count: number
          created_at: string
          direction: string
          error_message: string | null
          id: string
          platform: string
          status: string
          user_id: string
        }
        Insert: {
          contact_count?: number
          created_at?: string
          direction: string
          error_message?: string | null
          id?: string
          platform: string
          status: string
          user_id: string
        }
        Update: {
          contact_count?: number
          created_at?: string
          direction?: string
          error_message?: string | null
          id?: string
          platform?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      user_automation_preferences: {
        Row: {
          automations_enabled: boolean
          created_at: string
          digest_day: string
          id: string
          preferred_communication_channel: string
          reconnect_reminder_days: number
          updated_at: string
          user_id: string
          weekly_digest_enabled: boolean
        }
        Insert: {
          automations_enabled?: boolean
          created_at?: string
          digest_day?: string
          id?: string
          preferred_communication_channel?: string
          reconnect_reminder_days?: number
          updated_at?: string
          user_id: string
          weekly_digest_enabled?: boolean
        }
        Update: {
          automations_enabled?: boolean
          created_at?: string
          digest_day?: string
          id?: string
          preferred_communication_channel?: string
          reconnect_reminder_days?: number
          updated_at?: string
          user_id?: string
          weekly_digest_enabled?: boolean
        }
        Relationships: []
      }
      user_calendar_tokens: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string
          id: string
          provider: string
          refresh_token: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at: string
          id?: string
          provider: string
          refresh_token?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string
          id?: string
          provider?: string
          refresh_token?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          created_at: string
          credits: number
          credits_date: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits?: number
          credits_date?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits?: number
          credits_date?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_email_tokens: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string
          id: string
          last_synced: string | null
          provider: string
          refresh_token: string | null
          sync_enabled: boolean | null
          sync_frequency: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at: string
          id?: string
          last_synced?: string | null
          provider: string
          refresh_token?: string | null
          sync_enabled?: boolean | null
          sync_frequency?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string
          id?: string
          last_synced?: string | null
          provider?: string
          refresh_token?: string | null
          sync_enabled?: boolean | null
          sync_frequency?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_integrations: {
        Row: {
          access_token: string | null
          connected_at: string
          id: string
          is_active: boolean | null
          last_synced: string | null
          metadata: Json | null
          provider: string
          provider_id: string | null
          refresh_token: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          connected_at?: string
          id?: string
          is_active?: boolean | null
          last_synced?: string | null
          metadata?: Json | null
          provider: string
          provider_id?: string | null
          refresh_token?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          connected_at?: string
          id?: string
          is_active?: boolean | null
          last_synced?: string | null
          metadata?: Json | null
          provider?: string
          provider_id?: string | null
          refresh_token?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_notification_states: {
        Row: {
          created_at: string
          id: string
          notification_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notification_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notification_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          email_notifications: boolean | null
          id: string
          language: string | null
          marketing_emails: boolean | null
          metadata: Json | null
          push_notifications: boolean | null
          theme: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          marketing_emails?: boolean | null
          metadata?: Json | null
          push_notifications?: boolean | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          marketing_emails?: boolean | null
          metadata?: Json | null
          push_notifications?: boolean | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          device_info: string | null
          id: string
          ip_address: string | null
          last_active: string
          location: string | null
          session_token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: string | null
          id?: string
          ip_address?: string | null
          last_active?: string
          location?: string | null
          session_token: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: string | null
          id?: string
          ip_address?: string | null
          last_active?: string
          location?: string | null
          session_token?: string
          user_id?: string
        }
        Relationships: []
      }
      user_social_integrations: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string
          id: string
          last_synced: string | null
          platform: string
          profile_data: Json | null
          refresh_token: string | null
          sync_enabled: boolean | null
          sync_frequency: number | null
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at: string
          id?: string
          last_synced?: string | null
          platform: string
          profile_data?: Json | null
          refresh_token?: string | null
          sync_enabled?: boolean | null
          sync_frequency?: number | null
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string
          id?: string
          last_synced?: string | null
          platform?: string
          profile_data?: Json | null
          refresh_token?: string | null
          sync_enabled?: boolean | null
          sync_frequency?: number | null
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_type: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type: string
          status: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      weekly_digests: {
        Row: {
          content: string
          created_at: string
          id: string
          interaction_count: number
          stats: Json | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          interaction_count?: number
          stats?: Json | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          interaction_count?: number
          stats?: Json | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      handle_new_user: {
        Args:
          | { new_user_id: string }
          | { p_email: string; p_password: string; p_username: string }
        Returns: undefined
      }
      initialize_user_preferences: {
        Args: { user_uuid: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
