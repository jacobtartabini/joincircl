export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
          circle: string
          company_name: string | null
          created_at: string | null
          department: string | null
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
          circle?: string
          company_name?: string | null
          created_at?: string | null
          department?: string | null
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
          circle?: string
          company_name?: string | null
          created_at?: string | null
          department?: string | null
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
            foreignKeyName: "contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      keystones: {
        Row: {
          category: string | null
          contact_id: string | null
          created_at: string | null
          date: string
          id: string
          is_recurring: boolean | null
          notes: string | null
          recurrence_frequency: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          contact_id?: string | null
          created_at?: string | null
          date: string
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          recurrence_frequency?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          contact_id?: string | null
          created_at?: string | null
          date?: string
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
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          has_seen_tutorial: boolean | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          has_seen_tutorial?: boolean | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          has_seen_tutorial?: boolean | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
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
      user_email_tokens: {
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
      user_social_integrations: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string
          id: string
          last_synced: string | null
          platform: string
          refresh_token: string | null
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
          refresh_token?: string | null
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
          refresh_token?: string | null
          updated_at?: string
          user_id?: string
          username?: string
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
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
