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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          display_name: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      booking_requests: {
        Row: {
          client_id: string
          coach_id: string
          created_at: string | null
          duration_minutes: number
          id: string
          is_online: boolean | null
          message: string | null
          requested_at: string
          responded_at: string | null
          session_type_id: string | null
          status: string | null
        }
        Insert: {
          client_id: string
          coach_id: string
          created_at?: string | null
          duration_minutes?: number
          id?: string
          is_online?: boolean | null
          message?: string | null
          requested_at: string
          responded_at?: string | null
          session_type_id?: string | null
          status?: string | null
        }
        Update: {
          client_id?: string
          coach_id?: string
          created_at?: string | null
          duration_minutes?: number
          id?: string
          is_online?: boolean | null
          message?: string | null
          requested_at?: string
          responded_at?: string | null
          session_type_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_requests_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_requests_session_type_id_fkey"
            columns: ["session_type_id"]
            isOneToOne: false
            referencedRelation: "session_types"
            referencedColumns: ["id"]
          },
        ]
      }
      client_notes: {
        Row: {
          category: string | null
          client_id: string
          coach_id: string
          content: string
          created_at: string
          id: string
          is_pinned: boolean | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          client_id: string
          coach_id: string
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          client_id?: string
          coach_id?: string
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_notes_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_package_purchases: {
        Row: {
          amount_paid: number
          client_id: string
          coach_id: string
          created_at: string
          expires_at: string | null
          id: string
          package_id: string
          purchased_at: string
          sessions_total: number
          sessions_used: number | null
          status: string | null
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
        }
        Insert: {
          amount_paid: number
          client_id: string
          coach_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          package_id: string
          purchased_at?: string
          sessions_total: number
          sessions_used?: number | null
          status?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
        }
        Update: {
          amount_paid?: number
          client_id?: string
          coach_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          package_id?: string
          purchased_at?: string
          sessions_total?: number
          sessions_used?: number | null
          status?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
        }
        Relationships: []
      }
      client_profiles: {
        Row: {
          age: number | null
          allergies: string[] | null
          avatar_url: string | null
          body_measurements: Json | null
          created_at: string
          dietary_restrictions: string[] | null
          first_name: string | null
          fitness_goals: string[] | null
          gender_pronouns: string | null
          height_cm: number | null
          id: string
          last_name: string | null
          medical_conditions: string[] | null
          onboarding_completed: boolean
          updated_at: string
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          age?: number | null
          allergies?: string[] | null
          avatar_url?: string | null
          body_measurements?: Json | null
          created_at?: string
          dietary_restrictions?: string[] | null
          first_name?: string | null
          fitness_goals?: string[] | null
          gender_pronouns?: string | null
          height_cm?: number | null
          id?: string
          last_name?: string | null
          medical_conditions?: string[] | null
          onboarding_completed?: boolean
          updated_at?: string
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          age?: number | null
          allergies?: string[] | null
          avatar_url?: string | null
          body_measurements?: Json | null
          created_at?: string
          dietary_restrictions?: string[] | null
          first_name?: string | null
          fitness_goals?: string[] | null
          gender_pronouns?: string | null
          height_cm?: number | null
          id?: string
          last_name?: string | null
          medical_conditions?: string[] | null
          onboarding_completed?: boolean
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      client_progress: {
        Row: {
          body_fat_percentage: number | null
          client_id: string
          coach_id: string | null
          created_at: string
          id: string
          measurements: Json | null
          notes: string | null
          photo_urls: string[] | null
          recorded_at: string
          weight_kg: number | null
        }
        Insert: {
          body_fat_percentage?: number | null
          client_id: string
          coach_id?: string | null
          created_at?: string
          id?: string
          measurements?: Json | null
          notes?: string | null
          photo_urls?: string[] | null
          recorded_at?: string
          weight_kg?: number | null
        }
        Update: {
          body_fat_percentage?: number | null
          client_id?: string
          coach_id?: string | null
          created_at?: string
          id?: string
          measurements?: Json | null
          notes?: string | null
          photo_urls?: string[] | null
          recorded_at?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "client_progress_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_progress_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_subscriptions: {
        Row: {
          cancelled_at: string | null
          client_id: string
          coach_id: string
          created_at: string
          current_period_end: string | null
          current_period_start: string
          id: string
          plan_id: string
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          cancelled_at?: string | null
          client_id: string
          coach_id: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string
          id?: string
          plan_id: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          cancelled_at?: string | null
          client_id?: string
          coach_id?: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string
          id?: string
          plan_id?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      coach_availability: {
        Row: {
          coach_id: string
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean | null
          start_time: string
        }
        Insert: {
          coach_id: string
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean | null
          start_time: string
        }
        Update: {
          coach_id?: string
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_availability_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_clients: {
        Row: {
          client_id: string
          coach_id: string
          created_at: string
          id: string
          plan_type: string | null
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          client_id: string
          coach_id: string
          created_at?: string
          id?: string
          plan_type?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          coach_id?: string
          created_at?: string
          id?: string
          plan_type?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_clients_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_clients_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_packages: {
        Row: {
          coach_id: string
          created_at: string
          currency: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          session_count: number
          updated_at: string
          validity_days: number | null
        }
        Insert: {
          coach_id: string
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          session_count: number
          updated_at?: string
          validity_days?: number | null
        }
        Update: {
          coach_id?: string
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          session_count?: number
          updated_at?: string
          validity_days?: number | null
        }
        Relationships: []
      }
      coach_profiles: {
        Row: {
          bio: string | null
          booking_mode: string | null
          certifications: Json | null
          coach_types: string[] | null
          created_at: string
          display_name: string | null
          experience_years: number | null
          hourly_rate: number | null
          id: string
          in_person_available: boolean | null
          location: string | null
          onboarding_completed: boolean
          online_available: boolean | null
          profile_image_url: string | null
          stripe_connect_id: string | null
          stripe_connect_onboarded: boolean | null
          subscription_tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          booking_mode?: string | null
          certifications?: Json | null
          coach_types?: string[] | null
          created_at?: string
          display_name?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          in_person_available?: boolean | null
          location?: string | null
          onboarding_completed?: boolean
          online_available?: boolean | null
          profile_image_url?: string | null
          stripe_connect_id?: string | null
          stripe_connect_onboarded?: boolean | null
          subscription_tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          booking_mode?: string | null
          certifications?: Json | null
          coach_types?: string[] | null
          created_at?: string
          display_name?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          in_person_available?: boolean | null
          location?: string | null
          onboarding_completed?: boolean
          online_available?: boolean | null
          profile_image_url?: string | null
          stripe_connect_id?: string | null
          stripe_connect_onboarded?: boolean | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      coach_subscription_plans: {
        Row: {
          billing_period: string
          coach_id: string
          created_at: string
          currency: string | null
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          sessions_per_period: number | null
          updated_at: string
        }
        Insert: {
          billing_period?: string
          coach_id: string
          created_at?: string
          currency?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          sessions_per_period?: number | null
          updated_at?: string
        }
        Update: {
          billing_period?: string
          coach_id?: string
          created_at?: string
          currency?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          sessions_per_period?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      coaching_sessions: {
        Row: {
          client_id: string
          coach_id: string
          created_at: string
          duration_minutes: number
          id: string
          is_online: boolean | null
          location: string | null
          notes: string | null
          scheduled_at: string
          session_type: string
          status: string
          updated_at: string
        }
        Insert: {
          client_id: string
          coach_id: string
          created_at?: string
          duration_minutes?: number
          id?: string
          is_online?: boolean | null
          location?: string | null
          notes?: string | null
          scheduled_at: string
          session_type?: string
          status?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          coach_id?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          is_online?: boolean | null
          location?: string | null
          notes?: string | null
          scheduled_at?: string
          session_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coaching_sessions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coaching_sessions_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      connection_requests: {
        Row: {
          client_id: string
          coach_id: string
          created_at: string
          id: string
          message: string | null
          responded_at: string | null
          status: string
        }
        Insert: {
          client_id: string
          coach_id: string
          created_at?: string
          id?: string
          message?: string | null
          responded_at?: string | null
          status?: string
        }
        Update: {
          client_id?: string
          coach_id?: string
          created_at?: string
          id?: string
          message?: string | null
          responded_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "connection_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connection_requests_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_categories: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          category_id: string | null
          coach_id: string | null
          created_at: string
          difficulty: string | null
          equipment: string | null
          id: string
          instructions: string | null
          is_custom: boolean | null
          muscle_groups: string[] | null
          name: string
          thumbnail_url: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          category_id?: string | null
          coach_id?: string | null
          created_at?: string
          difficulty?: string | null
          equipment?: string | null
          id?: string
          instructions?: string | null
          is_custom?: boolean | null
          muscle_groups?: string[] | null
          name: string
          thumbnail_url?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          category_id?: string | null
          coach_id?: string | null
          created_at?: string
          difficulty?: string | null
          equipment?: string | null
          id?: string
          instructions?: string | null
          is_custom?: boolean | null
          muscle_groups?: string[] | null
          name?: string
          thumbnail_url?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "exercise_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favourites: {
        Row: {
          client_id: string
          coach_id: string
          created_at: string
          id: string
        }
        Insert: {
          client_id: string
          coach_id: string
          created_at?: string
          id?: string
        }
        Update: {
          client_id?: string
          coach_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      food_categories: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      foods: {
        Row: {
          calories_per_100g: number
          carbs_g: number
          category_id: string | null
          coach_id: string | null
          created_at: string
          fat_g: number
          fiber_g: number | null
          id: string
          is_custom: boolean | null
          name: string
          protein_g: number
          serving_description: string | null
          serving_size_g: number | null
          updated_at: string
        }
        Insert: {
          calories_per_100g?: number
          carbs_g?: number
          category_id?: string | null
          coach_id?: string | null
          created_at?: string
          fat_g?: number
          fiber_g?: number | null
          id?: string
          is_custom?: boolean | null
          name: string
          protein_g?: number
          serving_description?: string | null
          serving_size_g?: number | null
          updated_at?: string
        }
        Update: {
          calories_per_100g?: number
          carbs_g?: number
          category_id?: string | null
          coach_id?: string | null
          created_at?: string
          fat_g?: number
          fiber_g?: number | null
          id?: string
          is_custom?: boolean | null
          name?: string
          protein_g?: number
          serving_description?: string | null
          serving_size_g?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "foods_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "food_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "foods_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read_at: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read_at?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read_at?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      plan_assignments: {
        Row: {
          assigned_at: string
          client_id: string
          coach_id: string
          created_at: string
          end_date: string | null
          id: string
          plan_id: string
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_at?: string
          client_id: string
          coach_id: string
          created_at?: string
          end_date?: string | null
          id?: string
          plan_id: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_at?: string
          client_id?: string
          coach_id?: string
          created_at?: string
          end_date?: string | null
          id?: string
          plan_id?: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_assignments_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_assignments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "training_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      platform_subscriptions: {
        Row: {
          coach_id: string
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: string
          updated_at: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          client_id: string
          coach_id: string
          created_at: string
          id: string
          is_public: boolean | null
          rating: number
          review_text: string | null
          session_id: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          coach_id: string
          created_at?: string
          id?: string
          is_public?: boolean | null
          rating: number
          review_text?: string | null
          session_id?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          coach_id?: string
          created_at?: string
          id?: string
          is_public?: boolean | null
          rating?: number
          review_text?: string | null
          session_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      session_types: {
        Row: {
          coach_id: string
          created_at: string | null
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean | null
          is_in_person: boolean | null
          is_online: boolean | null
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          coach_id: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          is_in_person?: boolean | null
          is_online?: boolean | null
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          coach_id?: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          is_in_person?: boolean | null
          is_online?: boolean | null
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_types_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount: number
          coach_id: string | null
          created_at: string
          currency: string | null
          expires_at: string | null
          id: string
          started_at: string | null
          status: string | null
          stripe_subscription_id: string | null
          tier: string
        }
        Insert: {
          amount?: number
          coach_id?: string | null
          created_at?: string
          currency?: string | null
          expires_at?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
          stripe_subscription_id?: string | null
          tier?: string
        }
        Update: {
          amount?: number
          coach_id?: string | null
          created_at?: string
          currency?: string | null
          expires_at?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
          stripe_subscription_id?: string | null
          tier?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      training_plans: {
        Row: {
          coach_id: string
          content: Json | null
          created_at: string
          description: string | null
          duration_weeks: number | null
          id: string
          is_template: boolean | null
          name: string
          plan_type: string
          updated_at: string
        }
        Insert: {
          coach_id: string
          content?: Json | null
          created_at?: string
          description?: string | null
          duration_weeks?: number | null
          id?: string
          is_template?: boolean | null
          name: string
          plan_type: string
          updated_at?: string
        }
        Update: {
          coach_id?: string
          content?: Json | null
          created_at?: string
          description?: string | null
          duration_weeks?: number | null
          id?: string
          is_template?: boolean | null
          name?: string
          plan_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_plans_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          client_id: string | null
          coach_id: string | null
          commission_amount: number | null
          commission_rate: number | null
          created_at: string
          currency: string | null
          description: string | null
          id: string
          session_id: string | null
          status: string | null
          subscription_id: string | null
          transaction_type: string
        }
        Insert: {
          amount: number
          client_id?: string | null
          coach_id?: string | null
          commission_amount?: number | null
          commission_rate?: number | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          session_id?: string | null
          status?: string | null
          subscription_id?: string | null
          transaction_type: string
        }
        Update: {
          amount?: number
          client_id?: string | null
          coach_id?: string | null
          commission_amount?: number | null
          commission_rate?: number | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          session_id?: string | null
          status?: string | null
          subscription_id?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "coaching_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "client" | "coach" | "admin" | "manager" | "staff"
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
    Enums: {
      app_role: ["client", "coach", "admin", "manager", "staff"],
    },
  },
} as const
