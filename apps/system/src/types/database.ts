export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      academy_events: {
        Row: {
          color: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          ends_at: string | null
          event_date: string
          id: string
          is_free: boolean
          location: string | null
          starts_at: string | null
          title: string
        }
        Insert: {
          color?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          ends_at?: string | null
          event_date: string
          id?: string
          is_free?: boolean
          location?: string | null
          starts_at?: string | null
          title: string
        }
        Update: {
          color?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          ends_at?: string | null
          event_date?: string
          id?: string
          is_free?: boolean
          location?: string | null
          starts_at?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_emails: {
        Row: {
          email: string
          is_developer: boolean | null
        }
        Insert: {
          email: string
          is_developer?: boolean | null
        }
        Update: {
          email?: string
          is_developer?: boolean | null
        }
        Relationships: []
      }
      attendance: {
        Row: {
          booking_id: string
          consumed: boolean
          id: string
          marked_at: string
          marked_by: string | null
          session_id: string
          status: Database["public"]["Enums"]["attendance_status"]
          student_id: string
          student_plan_id: string | null
        }
        Insert: {
          booking_id: string
          consumed?: boolean
          id?: string
          marked_at?: string
          marked_by?: string | null
          session_id: string
          status: Database["public"]["Enums"]["attendance_status"]
          student_id: string
          student_plan_id?: string | null
        }
        Update: {
          booking_id?: string
          consumed?: boolean
          id?: string
          marked_at?: string
          marked_by?: string | null
          session_id?: string
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id?: string
          student_plan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_marked_by_fkey"
            columns: ["marked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_plan_id_fkey"
            columns: ["student_plan_id"]
            isOneToOne: false
            referencedRelation: "student_plan_balances"
            referencedColumns: ["student_plan_id"]
          },
          {
            foreignKeyName: "attendance_student_plan_id_fkey"
            columns: ["student_plan_id"]
            isOneToOne: false
            referencedRelation: "student_plan_summary"
            referencedColumns: ["student_plan_id"]
          },
          {
            foreignKeyName: "attendance_student_plan_id_fkey"
            columns: ["student_plan_id"]
            isOneToOne: false
            referencedRelation: "student_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          cancelled_at: string | null
          created_at: string
          created_by: string | null
          id: string
          promoted_at: string | null
          session_id: string
          status: Database["public"]["Enums"]["booking_status"]
          student_id: string
          student_plan_id: string | null
          waitlist_position: number | null
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          promoted_at?: string | null
          session_id: string
          status: Database["public"]["Enums"]["booking_status"]
          student_id: string
          student_plan_id?: string | null
          waitlist_position?: number | null
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          promoted_at?: string | null
          session_id?: string
          status?: Database["public"]["Enums"]["booking_status"]
          student_id?: string
          student_plan_id?: string | null
          waitlist_position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_student_plan_id_fkey"
            columns: ["student_plan_id"]
            isOneToOne: false
            referencedRelation: "student_plan_balances"
            referencedColumns: ["student_plan_id"]
          },
          {
            foreignKeyName: "bookings_student_plan_id_fkey"
            columns: ["student_plan_id"]
            isOneToOne: false
            referencedRelation: "student_plan_summary"
            referencedColumns: ["student_plan_id"]
          },
          {
            foreignKeyName: "bookings_student_plan_id_fkey"
            columns: ["student_plan_id"]
            isOneToOne: false
            referencedRelation: "student_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      class_categories: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      class_schedules: {
        Row: {
          active: boolean
          capacity: number
          class_type_id: string
          description: string | null
          end_time: string
          id: string
          min_bookings: number
          room_id: string | null
          start_time: string
          teacher_id: string
          valid_from: string
          valid_until: string | null
          weekday: number
        }
        Insert: {
          active?: boolean
          capacity?: number
          class_type_id: string
          description?: string | null
          end_time: string
          id?: string
          min_bookings?: number
          room_id?: string | null
          start_time: string
          teacher_id: string
          valid_from?: string
          valid_until?: string | null
          weekday: number
        }
        Update: {
          active?: boolean
          capacity?: number
          class_type_id?: string
          description?: string | null
          end_time?: string
          id?: string
          min_bookings?: number
          room_id?: string | null
          start_time?: string
          teacher_id?: string
          valid_from?: string
          valid_until?: string | null
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "class_schedules_class_type_id_fkey"
            columns: ["class_type_id"]
            isOneToOne: false
            referencedRelation: "class_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_schedules_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_schedules_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      class_sessions: {
        Row: {
          booked_count: number
          cancel_reason: string | null
          cancelled_at: string | null
          capacity: number
          class_type_id: string
          created_at: string
          description: string | null
          ends_at: string
          id: string
          kind: Database["public"]["Enums"]["session_kind"]
          min_bookings: number
          room_id: string | null
          schedule_id: string | null
          starts_at: string
          status: Database["public"]["Enums"]["session_status"]
          teacher_id: string
          title: string | null
          waitlist_count: number
        }
        Insert: {
          booked_count?: number
          cancel_reason?: string | null
          cancelled_at?: string | null
          capacity?: number
          class_type_id: string
          created_at?: string
          description?: string | null
          ends_at: string
          id?: string
          kind?: Database["public"]["Enums"]["session_kind"]
          min_bookings?: number
          room_id?: string | null
          schedule_id?: string | null
          starts_at: string
          status?: Database["public"]["Enums"]["session_status"]
          teacher_id: string
          title?: string | null
          waitlist_count?: number
        }
        Update: {
          booked_count?: number
          cancel_reason?: string | null
          cancelled_at?: string | null
          capacity?: number
          class_type_id?: string
          created_at?: string
          description?: string | null
          ends_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["session_kind"]
          min_bookings?: number
          room_id?: string | null
          schedule_id?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["session_status"]
          teacher_id?: string
          title?: string | null
          waitlist_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "class_sessions_class_type_id_fkey"
            columns: ["class_type_id"]
            isOneToOne: false
            referencedRelation: "class_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_sessions_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_sessions_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "class_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_sessions_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      class_types: {
        Row: {
          active: boolean
          category_id: string | null
          color: string
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          level: Database["public"]["Enums"]["class_level"]
          name: string
          slug: string
        }
        Insert: {
          active?: boolean
          category_id?: string | null
          color?: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          level?: Database["public"]["Enums"]["class_level"]
          name: string
          slug: string
        }
        Update: {
          active?: boolean
          category_id?: string | null
          color?: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          level?: Database["public"]["Enums"]["class_level"]
          name?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_types_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "class_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          profile_id: string
          read_at: string | null
          session_id: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          profile_id: string
          read_at?: string | null
          session_id?: string | null
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          profile_id?: string
          read_at?: string | null
          session_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: [
          {
            foreignKeyName: "notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          notes: string | null
          paid_on: string
          receipt_path: string | null
          reference: string | null
          student_id: string
          student_plan_id: string | null
          void_reason: string | null
          voided_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          id?: string
          method: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          paid_on?: string
          receipt_path?: string | null
          reference?: string | null
          student_id: string
          student_plan_id?: string | null
          void_reason?: string | null
          voided_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          paid_on?: string
          receipt_path?: string | null
          reference?: string | null
          student_id?: string
          student_plan_id?: string | null
          void_reason?: string | null
          voided_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_student_plan_id_fkey"
            columns: ["student_plan_id"]
            isOneToOne: false
            referencedRelation: "student_plan_balances"
            referencedColumns: ["student_plan_id"]
          },
          {
            foreignKeyName: "payments_student_plan_id_fkey"
            columns: ["student_plan_id"]
            isOneToOne: false
            referencedRelation: "student_plan_summary"
            referencedColumns: ["student_plan_id"]
          },
          {
            foreignKeyName: "payments_student_plan_id_fkey"
            columns: ["student_plan_id"]
            isOneToOne: false
            referencedRelation: "student_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_category_quotas: {
        Row: {
          category_id: string
          max_classes: number
          plan_id: string
        }
        Insert: {
          category_id: string
          max_classes: number
          plan_id: string
        }
        Update: {
          category_id?: string
          max_classes?: number
          plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_category_quotas_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "class_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_category_quotas_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_class_types: {
        Row: {
          class_type_id: string
          plan_id: string
        }
        Insert: {
          class_type_id: string
          plan_id: string
        }
        Update: {
          class_type_id?: string
          plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_class_types_class_type_id_fkey"
            columns: ["class_type_id"]
            isOneToOne: false
            referencedRelation: "class_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_class_types_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          active: boolean
          class_count: number | null
          created_at: string
          deleted_at: string | null
          description: string | null
          duration_days: number
          id: string
          is_private: boolean
          name: string
          price: number | null
          type: Database["public"]["Enums"]["plan_type"]
          validity: Database["public"]["Enums"]["plan_validity"]
          weekly_limit: number | null
        }
        Insert: {
          active?: boolean
          class_count?: number | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          duration_days: number
          id?: string
          is_private?: boolean
          name: string
          price?: number | null
          type: Database["public"]["Enums"]["plan_type"]
          validity?: Database["public"]["Enums"]["plan_validity"]
          weekly_limit?: number | null
        }
        Update: {
          active?: boolean
          class_count?: number | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          duration_days?: number
          id?: string
          is_private?: boolean
          name?: string
          price?: number | null
          type?: Database["public"]["Enums"]["plan_type"]
          validity?: Database["public"]["Enums"]["plan_validity"]
          weekly_limit?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birth_date: string | null
          created_at: string
          data_consent_at: string | null
          deleted_at: string | null
          email: string | null
          full_name: string | null
          guardian_name: string | null
          guardian_phone: string | null
          id: string
          image_consent: boolean | null
          image_consent_at: string | null
          is_developer: boolean
          onboarded_at: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["profile_status"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          data_consent_at?: string | null
          deleted_at?: string | null
          email?: string | null
          full_name?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id: string
          image_consent?: boolean | null
          image_consent_at?: string | null
          is_developer?: boolean
          onboarded_at?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["profile_status"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          data_consent_at?: string | null
          deleted_at?: string | null
          email?: string | null
          full_name?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          image_consent?: boolean | null
          image_consent_at?: string | null
          is_developer?: boolean
          onboarded_at?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["profile_status"]
          updated_at?: string
        }
        Relationships: []
      }
      progress_notes: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          session_id: string | null
          student_id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          session_id?: string | null
          student_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          session_id?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_notes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_notes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          active: boolean
          capacity: number
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          capacity: number
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          capacity?: number
          id?: string
          name?: string
        }
        Relationships: []
      }
      student_admin_notes: {
        Row: {
          notes: string | null
          profile_id: string
          updated_at: string
        }
        Insert: {
          notes?: string | null
          profile_id: string
          updated_at?: string
        }
        Update: {
          notes?: string | null
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_admin_notes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_plan_freezes: {
        Row: {
          created_by: string | null
          ended_at: string | null
          id: string
          reason: string | null
          started_at: string
          student_plan_id: string
        }
        Insert: {
          created_by?: string | null
          ended_at?: string | null
          id?: string
          reason?: string | null
          started_at?: string
          student_plan_id: string
        }
        Update: {
          created_by?: string | null
          ended_at?: string | null
          id?: string
          reason?: string | null
          started_at?: string
          student_plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_plan_freezes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_plan_freezes_student_plan_id_fkey"
            columns: ["student_plan_id"]
            isOneToOne: false
            referencedRelation: "student_plan_balances"
            referencedColumns: ["student_plan_id"]
          },
          {
            foreignKeyName: "student_plan_freezes_student_plan_id_fkey"
            columns: ["student_plan_id"]
            isOneToOne: false
            referencedRelation: "student_plan_summary"
            referencedColumns: ["student_plan_id"]
          },
          {
            foreignKeyName: "student_plan_freezes_student_plan_id_fkey"
            columns: ["student_plan_id"]
            isOneToOne: false
            referencedRelation: "student_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      student_plans: {
        Row: {
          classes_total: number | null
          classes_used: number
          created_at: string
          created_by: string | null
          discount_note: string | null
          expires_on: string
          frozen_at: string | null
          frozen_days: number
          id: string
          notes: string | null
          plan_id: string
          price: number | null
          starts_on: string
          status: Database["public"]["Enums"]["student_plan_status"]
          student_id: string
        }
        Insert: {
          classes_total?: number | null
          classes_used?: number
          created_at?: string
          created_by?: string | null
          discount_note?: string | null
          expires_on: string
          frozen_at?: string | null
          frozen_days?: number
          id?: string
          notes?: string | null
          plan_id: string
          price?: number | null
          starts_on?: string
          status?: Database["public"]["Enums"]["student_plan_status"]
          student_id: string
        }
        Update: {
          classes_total?: number | null
          classes_used?: number
          created_at?: string
          created_by?: string | null
          discount_note?: string | null
          expires_on?: string
          frozen_at?: string | null
          frozen_days?: number
          id?: string
          notes?: string | null
          plan_id?: string
          price?: number | null
          starts_on?: string
          status?: Database["public"]["Enums"]["student_plan_status"]
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_plans_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_plans_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          active: boolean
          bio: string | null
          color: string | null
          created_at: string
          deleted_at: string | null
          full_name: string
          id: string
          instagram: string | null
          phone: string | null
          photo_url: string | null
          profile_id: string | null
        }
        Insert: {
          active?: boolean
          bio?: string | null
          color?: string | null
          created_at?: string
          deleted_at?: string | null
          full_name: string
          id?: string
          instagram?: string | null
          phone?: string | null
          photo_url?: string | null
          profile_id?: string | null
        }
        Update: {
          active?: boolean
          bio?: string | null
          color?: string | null
          created_at?: string
          deleted_at?: string | null
          full_name?: string
          id?: string
          instagram?: string | null
          phone?: string | null
          photo_url?: string | null
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teachers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      student_plan_balances: {
        Row: {
          balance: number | null
          discount_note: string | null
          expires_on: string | null
          paid: number | null
          payment_status: string | null
          plan_id: string | null
          plan_name: string | null
          plan_status: Database["public"]["Enums"]["student_plan_status"] | null
          price: number | null
          starts_on: string | null
          student_id: string | null
          student_plan_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_plans_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_plans_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_plan_summary: {
        Row: {
          booked_this_week: number | null
          classes_remaining: number | null
          classes_total: number | null
          classes_used: number | null
          days_to_expire: number | null
          effective_status:
            | Database["public"]["Enums"]["student_plan_status"]
            | null
          expires_on: string | null
          frozen_days: number | null
          is_expiring: boolean | null
          is_frozen: boolean | null
          is_private: boolean | null
          plan_id: string | null
          plan_name: string | null
          plan_type: Database["public"]["Enums"]["plan_type"] | null
          starts_on: string | null
          student_id: string | null
          student_plan_id: string | null
          weekly_limit: number | null
        }
        Relationships: [
          {
            foreignKeyName: "student_plans_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_plans_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      _assign_plan_core: {
        Args: {
          p_created_by: string
          p_month: string
          p_notes: string
          p_plan_id: string
          p_price: number
          p_starts_on: string
          p_student_id: string
        }
        Returns: {
          classes_total: number | null
          classes_used: number
          created_at: string
          created_by: string | null
          discount_note: string | null
          expires_on: string
          frozen_at: string | null
          frozen_days: number
          id: string
          notes: string | null
          plan_id: string
          price: number | null
          starts_on: string
          status: Database["public"]["Enums"]["student_plan_status"]
          student_id: string
        }
        SetofOptions: {
          from: "*"
          to: "student_plans"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      _birthday_in_year: {
        Args: { p_birth: string; p_year: number }
        Returns: string
      }
      _find_valid_plan: {
        Args: {
          p_class_type_id: string
          p_private: boolean
          p_starts_at: string
          p_student_id: string
        }
        Returns: string
      }
      _generate_sessions: {
        Args: { p_from: string; p_weeks: number }
        Returns: number
      }
      _generate_sessions_range: {
        Args: { p_from: string; p_to: string }
        Returns: number
      }
      _month_end: { Args: { p_date: string }; Returns: string }
      _month_start: { Args: { p_date: string }; Returns: string }
      _normalize_phone: { Args: { p_phone: string }; Returns: string }
      _notify: {
        Args: {
          p_body: string
          p_profile_id: string
          p_session_id?: string
          p_title: string
          p_type: Database["public"]["Enums"]["notification_type"]
        }
        Returns: undefined
      }
      _plan_lookup: {
        Args: {
          p_class_type_id: string
          p_private: boolean
          p_starts_at: string
          p_student_id: string
        }
        Returns: Record<string, unknown>
      }
      _plan_reason: {
        Args: { p_class_type_id: string; p_sp_id: string; p_starts_at: string }
        Returns: string
      }
      _promote_waitlist: { Args: { p_session_id: string }; Returns: undefined }
      _renumber_waitlist: { Args: { p_session_id: string }; Returns: undefined }
      _session_label: { Args: { p_session_id: string }; Returns: string }
      _validate_profile_input: {
        Args: { p_birth_date: string; p_full_name: string; p_phone: string }
        Returns: Record<string, unknown>
      }
      admin_add_student_to_session: {
        Args: {
          p_force?: boolean
          p_session_id: string
          p_student_id: string
          p_student_plan_id?: string
        }
        Returns: {
          cancelled_at: string | null
          created_at: string
          created_by: string | null
          id: string
          promoted_at: string | null
          session_id: string
          status: Database["public"]["Enums"]["booking_status"]
          student_id: string
          student_plan_id: string | null
          waitlist_position: number | null
        }
        SetofOptions: {
          from: "*"
          to: "bookings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_at_risk_students: {
        Args: { p_days?: number }
        Returns: {
          avatar_url: string
          days_since: number
          full_name: string
          last_attended_at: string
          phone: string
          student_id: string
          usual_weekly: number
        }[]
      }
      admin_inactive_students: {
        Args: { p_days?: number }
        Returns: {
          avatar_url: string
          days_inactive: number
          email: string
          full_name: string
          last_attended_at: string
          phone: string
          student_id: string
        }[]
      }
      admin_occupancy_report: {
        Args: { p_from: string; p_to: string }
        Returns: {
          attendance_rate: number
          attended_count: number
          booked_total: number
          capacity_total: number
          dimension: string
          hour: number
          key_id: string
          label: string
          occupancy_rate: number
          sessions_count: number
          weekday: number
        }[]
      }
      admin_outstanding_balance: {
        Args: never
        Returns: {
          students: number
          total: number
        }[]
      }
      admin_renewal_report: {
        Args: { p_months?: number }
        Returns: {
          dimension: string
          ended: number
          key: string
          label: string
          renewal_rate: number
          renewed: number
        }[]
      }
      admin_revenue_report: {
        Args: { p_from: string; p_to: string }
        Returns: {
          amount: number
          dimension: string
          key: string
          label: string
          payments_count: number
        }[]
      }
      admin_subscriptions_overview: {
        Args: { p_month?: string }
        Returns: {
          avatar_url: string
          balance: number
          balance_due: boolean
          birth_date: string
          bucket: string
          classes_remaining: number
          classes_total: number
          classes_used: number
          expired_not_renewed: boolean
          expires_on: string
          expiring_soon: boolean
          full_name: string
          is_frozen: boolean
          last_attended_at: string
          last_payment_on: string
          no_plan: boolean
          paid: number
          payment_status: string
          phone: string
          plan_id: string
          plan_name: string
          prev_plan_id: string
          prev_plan_name: string
          prev_student_plan_id: string
          price: number
          student_id: string
          student_plan_id: string
        }[]
      }
      admin_month_birthdays: {
        Args: never
        Returns: {
          avatar_url: string
          birth_date: string
          birthday_date: string
          days_until: number
          full_name: string
          phone: string
          profile_id: string
          role: Database["public"]["Enums"]["user_role"]
        }[]
      }
      approve_user: {
        Args: {
          p_profile_id: string
          p_role: Database["public"]["Enums"]["user_role"]
          p_teacher_id?: string
        }
        Returns: {
          avatar_url: string | null
          birth_date: string | null
          created_at: string
          data_consent_at: string | null
          deleted_at: string | null
          email: string | null
          full_name: string | null
          guardian_name: string | null
          guardian_phone: string | null
          id: string
          image_consent: boolean | null
          image_consent_at: string | null
          is_developer: boolean
          onboarded_at: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["profile_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      assign_plan: {
        Args: {
          p_month?: string
          p_notes?: string
          p_plan_id: string
          p_price?: number
          p_starts_on?: string
          p_student_id: string
        }
        Returns: {
          classes_total: number | null
          classes_used: number
          created_at: string
          created_by: string | null
          discount_note: string | null
          expires_on: string
          frozen_at: string | null
          frozen_days: number
          id: string
          notes: string | null
          plan_id: string
          price: number | null
          starts_on: string
          status: Database["public"]["Enums"]["student_plan_status"]
          student_id: string
        }
        SetofOptions: {
          from: "*"
          to: "student_plans"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      book_session: {
        Args: { p_session_id: string }
        Returns: {
          cancelled_at: string | null
          created_at: string
          created_by: string | null
          id: string
          promoted_at: string | null
          session_id: string
          status: Database["public"]["Enums"]["booking_status"]
          student_id: string
          student_plan_id: string | null
          waitlist_position: number | null
        }
        SetofOptions: {
          from: "*"
          to: "bookings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      cancel_booking: {
        Args: { p_booking_id: string }
        Returns: {
          cancelled_at: string | null
          created_at: string
          created_by: string | null
          id: string
          promoted_at: string | null
          session_id: string
          status: Database["public"]["Enums"]["booking_status"]
          student_id: string
          student_plan_id: string | null
          waitlist_position: number | null
        }
        SetofOptions: {
          from: "*"
          to: "bookings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      cancel_session: {
        Args: { p_reason: string; p_session_id: string }
        Returns: {
          booked_count: number
          cancel_reason: string | null
          cancelled_at: string | null
          capacity: number
          class_type_id: string
          created_at: string
          description: string | null
          ends_at: string
          id: string
          kind: Database["public"]["Enums"]["session_kind"]
          min_bookings: number
          room_id: string | null
          schedule_id: string | null
          starts_at: string
          status: Database["public"]["Enums"]["session_status"]
          teacher_id: string
          title: string | null
          waitlist_count: number
        }
        SetofOptions: {
          from: "*"
          to: "class_sessions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      complete_onboarding: {
        Args: {
          p_accept_data_policy: boolean
          p_birth_date: string
          p_full_name: string
          p_image_consent: boolean
          p_phone: string
        }
        Returns: {
          avatar_url: string | null
          birth_date: string | null
          created_at: string
          data_consent_at: string | null
          deleted_at: string | null
          email: string | null
          full_name: string | null
          guardian_name: string | null
          guardian_phone: string | null
          id: string
          image_consent: boolean | null
          image_consent_at: string | null
          is_developer: boolean
          onboarded_at: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["profile_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      current_teacher_id: { Args: never; Returns: string }
      expire_student_plans: { Args: never; Returns: number }
      freeze_plan: {
        Args: { p_reason?: string; p_student_plan_id: string }
        Returns: {
          classes_total: number | null
          classes_used: number
          created_at: string
          created_by: string | null
          discount_note: string | null
          expires_on: string
          frozen_at: string | null
          frozen_days: number
          id: string
          notes: string | null
          plan_id: string
          price: number | null
          starts_on: string
          status: Database["public"]["Enums"]["student_plan_status"]
          student_id: string
        }
        SetofOptions: {
          from: "*"
          to: "student_plans"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      generate_month_sessions: { Args: { p_month: string }; Returns: number }
      generate_sessions: {
        Args: { p_from: string; p_weeks?: number }
        Returns: number
      }
      has_booking_in_teacher_session: {
        Args: { p_student_id: string }
        Returns: boolean
      }
      is_active_user: { Args: never; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      is_student_or_dev: { Args: { p_profile_id: string }; Returns: boolean }
      mark_attendance: {
        Args: {
          p_booking_id: string
          p_status: Database["public"]["Enums"]["attendance_status"]
        }
        Returns: {
          booking_id: string
          consumed: boolean
          id: string
          marked_at: string
          marked_by: string | null
          session_id: string
          status: Database["public"]["Enums"]["attendance_status"]
          student_id: string
          student_plan_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "attendance"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      register_payment: {
        Args: {
          p_amount: number
          p_method: Database["public"]["Enums"]["payment_method"]
          p_notes?: string
          p_paid_on?: string
          p_receipt_path?: string
          p_reference?: string
          p_student_id: string
          p_student_plan_id?: string
        }
        Returns: {
          amount: number
          created_at: string
          created_by: string | null
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          notes: string | null
          paid_on: string
          receipt_path: string | null
          reference: string | null
          student_id: string
          student_plan_id: string | null
          void_reason: string | null
          voided_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "payments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      renew_plan: {
        Args: { p_price?: number; p_student_plan_id: string }
        Returns: {
          classes_total: number | null
          classes_used: number
          created_at: string
          created_by: string | null
          discount_note: string | null
          expires_on: string
          frozen_at: string | null
          frozen_days: number
          id: string
          notes: string | null
          plan_id: string
          price: number | null
          starts_on: string
          status: Database["public"]["Enums"]["student_plan_status"]
          student_id: string
        }
        SetofOptions: {
          from: "*"
          to: "student_plans"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      renew_plans_bulk: {
        Args: { p_month: string; p_student_plan_ids: string[] }
        Returns: number
      }
      save_plan: {
        Args: {
          p_active: boolean
          p_category_quotas?: Json
          p_class_count: number
          p_class_type_ids: string[]
          p_description: string
          p_duration_days: number
          p_is_private: boolean
          p_name: string
          p_plan_id: string
          p_price: number
          p_type: Database["public"]["Enums"]["plan_type"]
          p_validity?: Database["public"]["Enums"]["plan_validity"]
          p_weekly_limit: number
        }
        Returns: {
          active: boolean
          class_count: number | null
          created_at: string
          deleted_at: string | null
          description: string | null
          duration_days: number
          id: string
          is_private: boolean
          name: string
          price: number | null
          type: Database["public"]["Enums"]["plan_type"]
          validity: Database["public"]["Enums"]["plan_validity"]
          weekly_limit: number | null
        }
        SetofOptions: {
          from: "*"
          to: "plans"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      set_plan_price: {
        Args: {
          p_discount_note?: string
          p_price: number
          p_student_plan_id: string
        }
        Returns: {
          classes_total: number | null
          classes_used: number
          created_at: string
          created_by: string | null
          discount_note: string | null
          expires_on: string
          frozen_at: string | null
          frozen_days: number
          id: string
          notes: string | null
          plan_id: string
          price: number | null
          starts_on: string
          status: Database["public"]["Enums"]["student_plan_status"]
          student_id: string
        }
        SetofOptions: {
          from: "*"
          to: "student_plans"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      teaches_session: { Args: { p_session_id: string }; Returns: boolean }
      unfreeze_plan: {
        Args: { p_student_plan_id: string }
        Returns: {
          classes_total: number | null
          classes_used: number
          created_at: string
          created_by: string | null
          discount_note: string | null
          expires_on: string
          frozen_at: string | null
          frozen_days: number
          id: string
          notes: string | null
          plan_id: string
          price: number | null
          starts_on: string
          status: Database["public"]["Enums"]["student_plan_status"]
          student_id: string
        }
        SetofOptions: {
          from: "*"
          to: "student_plans"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_my_profile: {
        Args: {
          p_birth_date: string
          p_full_name: string
          p_image_consent?: boolean
          p_phone: string
        }
        Returns: {
          avatar_url: string | null
          birth_date: string | null
          created_at: string
          data_consent_at: string | null
          deleted_at: string | null
          email: string | null
          full_name: string | null
          guardian_name: string | null
          guardian_phone: string | null
          id: string
          image_consent: boolean | null
          image_consent_at: string | null
          is_developer: boolean
          onboarded_at: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["profile_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      void_payment: {
        Args: { p_payment_id: string; p_reason: string }
        Returns: {
          amount: number
          created_at: string
          created_by: string | null
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          notes: string | null
          paid_on: string
          receipt_path: string | null
          reference: string | null
          student_id: string
          student_plan_id: string | null
          void_reason: string | null
          voided_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "payments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      attendance_status: "present" | "absent" | "excused"
      booking_status: "booked" | "waitlist" | "cancelled"
      class_level: "all" | "beginner" | "intermediate" | "advanced"
      notification_type:
        | "booking_promoted"
        | "session_cancelled"
        | "booking_added"
        | "plan_expiring"
        | "account_approved"
        | "general"
      payment_method:
        | "cash"
        | "nequi"
        | "daviplata"
        | "transfer"
        | "card"
        | "other"
      plan_type: "package" | "monthly"
      plan_validity: "calendar_month" | "days"
      profile_status: "pending" | "active" | "inactive"
      session_kind: "group" | "private"
      session_status: "scheduled" | "cancelled"
      student_plan_status: "active" | "expired" | "cancelled"
      user_role: "admin" | "teacher" | "student"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      attendance_status: ["present", "absent", "excused"],
      booking_status: ["booked", "waitlist", "cancelled"],
      class_level: ["all", "beginner", "intermediate", "advanced"],
      notification_type: [
        "booking_promoted",
        "session_cancelled",
        "booking_added",
        "plan_expiring",
        "account_approved",
        "general",
      ],
      payment_method: [
        "cash",
        "nequi",
        "daviplata",
        "transfer",
        "card",
        "other",
      ],
      plan_type: ["package", "monthly"],
      plan_validity: ["calendar_month", "days"],
      profile_status: ["pending", "active", "inactive"],
      session_kind: ["group", "private"],
      session_status: ["scheduled", "cancelled"],
      student_plan_status: ["active", "expired", "cancelled"],
      user_role: ["admin", "teacher", "student"],
    },
  },
} as const
