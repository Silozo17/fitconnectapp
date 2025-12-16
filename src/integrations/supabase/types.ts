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
      admin_granted_subscriptions: {
        Row: {
          coach_id: string | null
          created_at: string | null
          expires_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean | null
          reason: string | null
          tier: string
        }
        Insert: {
          coach_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          reason?: string | null
          tier: string
        }
        Update: {
          coach_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          reason?: string | null
          tier?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_granted_subscriptions_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
      audit_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          category: string
          created_at: string
          criteria: Json
          description: string
          icon: string
          id: string
          is_active: boolean | null
          name: string
          rarity: string
          xp_reward: number
        }
        Insert: {
          category?: string
          created_at?: string
          criteria?: Json
          description: string
          icon?: string
          id?: string
          is_active?: boolean | null
          name: string
          rarity?: string
          xp_reward?: number
        }
        Update: {
          category?: string
          created_at?: string
          criteria?: Json
          description?: string
          icon?: string
          id?: string
          is_active?: boolean | null
          name?: string
          rarity?: string
          xp_reward?: number
        }
        Relationships: []
      }
      booking_requests: {
        Row: {
          client_id: string
          coach_id: string
          created_at: string | null
          currency: string | null
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
          currency?: string | null
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
          currency?: string | null
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
      bundle_products: {
        Row: {
          bundle_id: string
          display_order: number | null
          id: string
          product_id: string
        }
        Insert: {
          bundle_id: string
          display_order?: number | null
          id?: string
          product_id: string
        }
        Update: {
          bundle_id?: string
          display_order?: number | null
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bundle_products_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "digital_bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bundle_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "digital_products"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_connections: {
        Row: {
          access_token: string
          calendar_id: string | null
          created_at: string | null
          id: string
          provider: Database["public"]["Enums"]["calendar_provider"]
          refresh_token: string | null
          sync_enabled: boolean | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          calendar_id?: string | null
          created_at?: string | null
          id?: string
          provider: Database["public"]["Enums"]["calendar_provider"]
          refresh_token?: string | null
          sync_enabled?: boolean | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          calendar_id?: string | null
          created_at?: string | null
          id?: string
          provider?: Database["public"]["Enums"]["calendar_provider"]
          refresh_token?: string | null
          sync_enabled?: boolean | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      challenge_participants: {
        Row: {
          challenge_id: string
          client_id: string
          completed_at: string | null
          current_progress: number
          id: string
          joined_at: string
          status: string
        }
        Insert: {
          challenge_id: string
          client_id: string
          completed_at?: string | null
          current_progress?: number
          id?: string
          joined_at?: string
          status?: string
        }
        Update: {
          challenge_id?: string
          client_id?: string
          completed_at?: string | null
          current_progress?: number
          id?: string
          joined_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          badge_reward_id: string | null
          challenge_type: string
          created_at: string
          created_by: string
          description: string | null
          end_date: string
          id: string
          is_active: boolean | null
          max_participants: number | null
          start_date: string
          target_unit: string
          target_value: number
          title: string
          visibility: string
          xp_reward: number
        }
        Insert: {
          badge_reward_id?: string | null
          challenge_type?: string
          created_at?: string
          created_by: string
          description?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          start_date?: string
          target_unit?: string
          target_value?: number
          title: string
          visibility?: string
          xp_reward?: number
        }
        Update: {
          badge_reward_id?: string | null
          challenge_type?: string
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          start_date?: string
          target_unit?: string
          target_value?: number
          title?: string
          visibility?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "challenges_badge_reward_id_fkey"
            columns: ["badge_reward_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      client_badges: {
        Row: {
          badge_id: string
          client_id: string
          earned_at: string
          id: string
          is_featured: boolean | null
          source_data: Json | null
        }
        Insert: {
          badge_id: string
          client_id: string
          earned_at?: string
          id?: string
          is_featured?: boolean | null
          source_data?: Json | null
        }
        Update: {
          badge_id?: string
          client_id?: string
          earned_at?: string
          id?: string
          is_featured?: boolean | null
          source_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "client_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      client_habits: {
        Row: {
          category: string
          client_id: string
          coach_id: string
          created_at: string
          description: string | null
          end_date: string | null
          frequency: string
          id: string
          is_active: boolean | null
          name: string
          reminder_time: string | null
          specific_days: number[] | null
          start_date: string
          target_count: number
          updated_at: string
        }
        Insert: {
          category?: string
          client_id: string
          coach_id: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          name: string
          reminder_time?: string | null
          specific_days?: number[] | null
          start_date?: string
          target_count?: number
          updated_at?: string
        }
        Update: {
          category?: string
          client_id?: string
          coach_id?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          name?: string
          reminder_time?: string | null
          specific_days?: number[] | null
          start_date?: string
          target_count?: number
          updated_at?: string
        }
        Relationships: []
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
          currency: string | null
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
          currency?: string | null
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
          currency?: string | null
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
          currency: string | null
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
          currency?: string | null
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
          currency?: string | null
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
      client_xp: {
        Row: {
          client_id: string
          created_at: string
          current_level: number
          id: string
          total_xp: number
          updated_at: string
          xp_to_next_level: number
        }
        Insert: {
          client_id: string
          created_at?: string
          current_level?: number
          id?: string
          total_xp?: number
          updated_at?: string
          xp_to_next_level?: number
        }
        Update: {
          client_id?: string
          created_at?: string
          current_level?: number
          id?: string
          total_xp?: number
          updated_at?: string
          xp_to_next_level?: number
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
      coach_feature_overrides: {
        Row: {
          coach_id: string | null
          created_at: string | null
          expires_at: string | null
          feature_id: string | null
          granted_by: string | null
          id: string
          reason: string | null
          value: Json
        }
        Insert: {
          coach_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          feature_id?: string | null
          granted_by?: string | null
          id?: string
          reason?: string | null
          value: Json
        }
        Update: {
          coach_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          feature_id?: string | null
          granted_by?: string | null
          id?: string
          reason?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "coach_feature_overrides_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_feature_overrides_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "platform_features"
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
          is_verified: boolean | null
          location: string | null
          onboarding_completed: boolean
          online_available: boolean | null
          profile_image_url: string | null
          stripe_connect_id: string | null
          stripe_connect_onboarded: boolean | null
          subscription_tier: string | null
          updated_at: string
          user_id: string
          verification_notes: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
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
          is_verified?: boolean | null
          location?: string | null
          onboarding_completed?: boolean
          online_available?: boolean | null
          profile_image_url?: string | null
          stripe_connect_id?: string | null
          stripe_connect_onboarded?: boolean | null
          subscription_tier?: string | null
          updated_at?: string
          user_id: string
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
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
          is_verified?: boolean | null
          location?: string | null
          onboarding_completed?: boolean
          online_available?: boolean | null
          profile_image_url?: string | null
          stripe_connect_id?: string | null
          stripe_connect_onboarded?: boolean | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
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
      coach_verification_documents: {
        Row: {
          admin_notes: string | null
          coach_id: string
          created_at: string
          document_type: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          coach_id: string
          created_at?: string
          document_type: string
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          coach_id?: string
          created_at?: string
          document_type?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_verification_documents_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coaching_sessions: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          client_id: string
          coach_id: string
          created_at: string
          currency: string | null
          duration_minutes: number
          external_calendar_event_id: string | null
          id: string
          is_online: boolean | null
          location: string | null
          notes: string | null
          price: number | null
          rescheduled_from: string | null
          scheduled_at: string
          session_type: string
          status: string
          updated_at: string
          video_meeting_id: string | null
          video_meeting_url: string | null
          video_provider: Database["public"]["Enums"]["video_provider"] | null
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          client_id: string
          coach_id: string
          created_at?: string
          currency?: string | null
          duration_minutes?: number
          external_calendar_event_id?: string | null
          id?: string
          is_online?: boolean | null
          location?: string | null
          notes?: string | null
          price?: number | null
          rescheduled_from?: string | null
          scheduled_at: string
          session_type?: string
          status?: string
          updated_at?: string
          video_meeting_id?: string | null
          video_meeting_url?: string | null
          video_provider?: Database["public"]["Enums"]["video_provider"] | null
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          client_id?: string
          coach_id?: string
          created_at?: string
          currency?: string | null
          duration_minutes?: number
          external_calendar_event_id?: string | null
          id?: string
          is_online?: boolean | null
          location?: string | null
          notes?: string | null
          price?: number | null
          rescheduled_from?: string | null
          scheduled_at?: string
          session_type?: string
          status?: string
          updated_at?: string
          video_meeting_id?: string | null
          video_meeting_url?: string | null
          video_provider?: Database["public"]["Enums"]["video_provider"] | null
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
      contact_submissions: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          responded_at: string | null
          responded_by: string | null
          status: string | null
          subject: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          responded_at?: string | null
          responded_by?: string | null
          status?: string | null
          subject: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          responded_at?: string | null
          responded_by?: string | null
          status?: string | null
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_submissions_responded_by_fkey"
            columns: ["responded_by"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_purchases: {
        Row: {
          access_expires_at: string | null
          amount_paid: number
          bundle_id: string | null
          coach_id: string
          currency: string | null
          id: string
          product_id: string | null
          purchased_at: string | null
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          user_id: string
        }
        Insert: {
          access_expires_at?: string | null
          amount_paid: number
          bundle_id?: string | null
          coach_id: string
          currency?: string | null
          id?: string
          product_id?: string | null
          purchased_at?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          user_id: string
        }
        Update: {
          access_expires_at?: string | null
          amount_paid?: number
          bundle_id?: string | null
          coach_id?: string
          currency?: string | null
          id?: string
          product_id?: string | null
          purchased_at?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_purchases_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "digital_bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_purchases_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_purchases_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "digital_products"
            referencedColumns: ["id"]
          },
        ]
      }
      content_reviews: {
        Row: {
          created_at: string | null
          id: string
          is_verified_purchase: boolean | null
          product_id: string
          rating: number
          review_text: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_verified_purchase?: boolean | null
          product_id: string
          rating: number
          review_text?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_verified_purchase?: boolean | null
          product_id?: string
          rating?: number
          review_text?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "digital_products"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_bundles: {
        Row: {
          coach_id: string
          cover_image_url: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          original_price: number | null
          price: number
          title: string
          updated_at: string | null
        }
        Insert: {
          coach_id: string
          cover_image_url?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          original_price?: number | null
          price: number
          title: string
          updated_at?: string | null
        }
        Update: {
          coach_id?: string
          cover_image_url?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          original_price?: number | null
          price?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "digital_bundles_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_products: {
        Row: {
          category: string | null
          coach_id: string
          content_type: Database["public"]["Enums"]["content_type"]
          content_url: string | null
          cover_image_url: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          difficulty_level: string | null
          download_count: number | null
          duration_minutes: number | null
          file_size_bytes: number | null
          id: string
          is_downloadable: boolean | null
          is_featured: boolean | null
          is_published: boolean | null
          is_streamable: boolean | null
          page_count: number | null
          preview_url: string | null
          price: number
          short_description: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          category?: string | null
          coach_id: string
          content_type?: Database["public"]["Enums"]["content_type"]
          content_url?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          difficulty_level?: string | null
          download_count?: number | null
          duration_minutes?: number | null
          file_size_bytes?: number | null
          id?: string
          is_downloadable?: boolean | null
          is_featured?: boolean | null
          is_published?: boolean | null
          is_streamable?: boolean | null
          page_count?: number | null
          preview_url?: string | null
          price?: number
          short_description?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          category?: string | null
          coach_id?: string
          content_type?: Database["public"]["Enums"]["content_type"]
          content_url?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          difficulty_level?: string | null
          download_count?: number | null
          duration_minutes?: number | null
          file_size_bytes?: number | null
          id?: string
          is_downloadable?: boolean | null
          is_featured?: boolean | null
          is_published?: boolean | null
          is_streamable?: boolean | null
          page_count?: number | null
          preview_url?: string | null
          price?: number
          short_description?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "digital_products_coach_id_fkey"
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
      grocery_lists: {
        Row: {
          client_id: string
          coach_id: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          is_completed: boolean | null
          items: Json
          name: string
          source_id: string | null
          source_type: string | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          coach_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          items?: Json
          name?: string
          source_id?: string | null
          source_type?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          coach_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          items?: Json
          name?: string
          source_id?: string | null
          source_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grocery_lists_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grocery_lists_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_logs: {
        Row: {
          client_id: string
          completed_count: number
          created_at: string
          habit_id: string
          id: string
          logged_at: string
          notes: string | null
        }
        Insert: {
          client_id: string
          completed_count?: number
          created_at?: string
          habit_id: string
          id?: string
          logged_at?: string
          notes?: string | null
        }
        Update: {
          client_id?: string
          completed_count?: number
          created_at?: string
          habit_id?: string
          id?: string
          logged_at?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "client_habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_streaks: {
        Row: {
          current_streak: number
          habit_id: string
          id: string
          last_completed_date: string | null
          longest_streak: number
          total_completions: number
          updated_at: string
        }
        Insert: {
          current_streak?: number
          habit_id: string
          id?: string
          last_completed_date?: string | null
          longest_streak?: number
          total_completions?: number
          updated_at?: string
        }
        Update: {
          current_streak?: number
          habit_id?: string
          id?: string
          last_completed_date?: string | null
          longest_streak?: number
          total_completions?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_streaks_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: true
            referencedRelation: "client_habits"
            referencedColumns: ["id"]
          },
        ]
      }
      health_data_sync: {
        Row: {
          client_id: string
          created_at: string | null
          data_type: string
          id: string
          raw_data: Json | null
          recorded_at: string
          source: Database["public"]["Enums"]["wearable_provider"]
          unit: string
          value: number
          wearable_connection_id: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          data_type: string
          id?: string
          raw_data?: Json | null
          recorded_at: string
          source: Database["public"]["Enums"]["wearable_provider"]
          unit: string
          value: number
          wearable_connection_id?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          data_type?: string
          id?: string
          raw_data?: Json | null
          recorded_at?: string
          source?: Database["public"]["Enums"]["wearable_provider"]
          unit?: string
          value?: number
          wearable_connection_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_data_sync_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_data_sync_wearable_connection_id_fkey"
            columns: ["wearable_connection_id"]
            isOneToOne: false
            referencedRelation: "wearable_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_usage: {
        Row: {
          action: string
          created_at: string | null
          id: string
          integration_type: string
          metadata: Json | null
          provider: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          integration_type: string
          metadata?: Json | null
          provider: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          integration_type?: string
          metadata?: Json | null
          provider?: string
          user_id?: string
        }
        Relationships: []
      }
      leaderboard_entries: {
        Row: {
          client_id: string
          created_at: string
          id: string
          period_end: string
          period_start: string
          period_type: string
          rank: number | null
          region: string | null
          total_xp: number
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          period_end: string
          period_start: string
          period_type?: string
          rank?: number | null
          region?: string | null
          total_xp?: number
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          period_end?: string
          period_start?: string
          period_type?: string
          rank?: number | null
          region?: string | null
          total_xp?: number
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          category: string | null
          coach_id: string
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          coach_id: string
          content: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          coach_id?: string
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_coach_id_fkey"
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
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          source: string | null
          subscribed_at: string | null
          unsubscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          source?: string | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          source?: string | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          email_bookings: boolean | null
          email_marketing: boolean | null
          email_messages: boolean | null
          email_reminders: boolean | null
          id: string
          push_bookings: boolean | null
          push_messages: boolean | null
          push_reminders: boolean | null
          reminder_hours_before: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_bookings?: boolean | null
          email_marketing?: boolean | null
          email_messages?: boolean | null
          email_reminders?: boolean | null
          id?: string
          push_bookings?: boolean | null
          push_messages?: boolean | null
          push_reminders?: boolean | null
          reminder_hours_before?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_bookings?: boolean | null
          email_marketing?: boolean | null
          email_messages?: boolean | null
          email_reminders?: boolean | null
          id?: string
          push_bookings?: boolean | null
          push_messages?: boolean | null
          push_reminders?: boolean | null
          reminder_hours_before?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          email_sent: boolean | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          email_sent?: boolean | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          email_sent?: boolean | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
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
      platform_features: {
        Row: {
          created_at: string | null
          default_value: Json | null
          description: string | null
          feature_key: string
          feature_type: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          default_value?: Json | null
          description?: string | null
          feature_key: string
          feature_type?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          default_value?: Json | null
          description?: string | null
          feature_key?: string
          feature_type?: string | null
          id?: string
          name?: string
        }
        Relationships: []
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
      review_disputes: {
        Row: {
          admin_notes: string | null
          coach_id: string | null
          created_at: string | null
          id: string
          reason: string
          resolved_at: string | null
          resolved_by: string | null
          review_id: string | null
          status: string | null
        }
        Insert: {
          admin_notes?: string | null
          coach_id?: string | null
          created_at?: string | null
          id?: string
          reason: string
          resolved_at?: string | null
          resolved_by?: string | null
          review_id?: string | null
          status?: string | null
        }
        Update: {
          admin_notes?: string | null
          coach_id?: string | null
          created_at?: string | null
          id?: string
          reason?: string
          resolved_at?: string | null
          resolved_by?: string | null
          review_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_disputes_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_disputes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
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
          currency: string | null
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
          currency?: string | null
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
          currency?: string | null
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
      tier_features: {
        Row: {
          created_at: string | null
          feature_id: string | null
          id: string
          tier: string
          value: Json
        }
        Insert: {
          created_at?: string | null
          feature_id?: string | null
          id?: string
          tier: string
          value: Json
        }
        Update: {
          created_at?: string | null
          feature_id?: string | null
          id?: string
          tier?: string
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "tier_features_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "platform_features"
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
      video_conference_settings: {
        Row: {
          access_token: string | null
          auto_create_meetings: boolean | null
          coach_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          provider: Database["public"]["Enums"]["video_provider"]
          provider_user_id: string | null
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string | null
        }
        Insert: {
          access_token?: string | null
          auto_create_meetings?: boolean | null
          coach_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          provider: Database["public"]["Enums"]["video_provider"]
          provider_user_id?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Update: {
          access_token?: string | null
          auto_create_meetings?: boolean | null
          coach_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          provider?: Database["public"]["Enums"]["video_provider"]
          provider_user_id?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_conference_settings_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wearable_connections: {
        Row: {
          access_token: string
          client_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          last_synced_at: string | null
          provider: Database["public"]["Enums"]["wearable_provider"]
          provider_user_id: string | null
          refresh_token: string | null
          scopes: string[] | null
          token_expires_at: string | null
          updated_at: string | null
        }
        Insert: {
          access_token: string
          client_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          provider: Database["public"]["Enums"]["wearable_provider"]
          provider_user_id?: string | null
          refresh_token?: string | null
          scopes?: string[] | null
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Update: {
          access_token?: string
          client_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          provider?: Database["public"]["Enums"]["wearable_provider"]
          provider_user_id?: string | null
          refresh_token?: string | null
          scopes?: string[] | null
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wearable_connections_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      xp_transactions: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          description: string
          id: string
          source: string
          source_id: string | null
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string
          description: string
          id?: string
          source: string
          source_id?: string | null
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          description?: string
          id?: string
          source?: string
          source_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      client_has_messaged_coach: {
        Args: { client_profile_id: string }
        Returns: boolean
      }
      coach_has_messaged_client: {
        Args: { coach_profile_id: string }
        Returns: boolean
      }
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
      calendar_provider: "google_calendar" | "apple_calendar"
      content_type:
        | "ebook"
        | "video_course"
        | "single_video"
        | "template"
        | "audio"
        | "other"
      video_provider: "zoom" | "google_meet"
      wearable_provider: "google_fit" | "fitbit" | "garmin" | "apple_health"
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
      calendar_provider: ["google_calendar", "apple_calendar"],
      content_type: [
        "ebook",
        "video_course",
        "single_video",
        "template",
        "audio",
        "other",
      ],
      video_provider: ["zoom", "google_meet"],
      wearable_provider: ["google_fit", "fitbit", "garmin", "apple_health"],
    },
  },
} as const
