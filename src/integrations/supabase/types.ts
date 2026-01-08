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
      admin_dashboard_widgets: {
        Row: {
          admin_id: string | null
          config: Json | null
          created_at: string | null
          id: string
          is_visible: boolean | null
          position: number
          size: string | null
          title: string
          updated_at: string | null
          widget_type: string
        }
        Insert: {
          admin_id?: string | null
          config?: Json | null
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          position: number
          size?: string | null
          title: string
          updated_at?: string | null
          widget_type: string
        }
        Update: {
          admin_id?: string | null
          config?: Json | null
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          position?: number
          size?: string | null
          title?: string
          updated_at?: string | null
          widget_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_dashboard_widgets_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
          {
            foreignKeyName: "admin_granted_subscriptions_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_profiles: {
        Row: {
          avatar_url: string | null
          coaches_last_viewed_at: string | null
          created_at: string
          department: string | null
          display_name: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          status: string | null
          status_reason: string | null
          status_updated_at: string | null
          status_updated_by: string | null
          updated_at: string
          user_id: string
          user_profile_id: string | null
          username: string
          users_last_viewed_at: string | null
          verifications_last_viewed_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          coaches_last_viewed_at?: string | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          status?: string | null
          status_reason?: string | null
          status_updated_at?: string | null
          status_updated_by?: string | null
          updated_at?: string
          user_id: string
          user_profile_id?: string | null
          username: string
          users_last_viewed_at?: string | null
          verifications_last_viewed_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          coaches_last_viewed_at?: string | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          status?: string | null
          status_reason?: string | null
          status_updated_at?: string | null
          status_updated_by?: string | null
          updated_at?: string
          user_id?: string
          user_profile_id?: string | null
          username?: string
          users_last_viewed_at?: string | null
          verifications_last_viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_profiles_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_plan_recommendations: {
        Row: {
          applied_at: string | null
          client_id: string
          coach_id: string
          created_at: string | null
          description: string
          expires_at: string | null
          id: string
          priority: string | null
          rationale: string | null
          recommendation_type: string
          status: string | null
          suggested_changes: Json | null
          title: string
        }
        Insert: {
          applied_at?: string | null
          client_id: string
          coach_id: string
          created_at?: string | null
          description: string
          expires_at?: string | null
          id?: string
          priority?: string | null
          rationale?: string | null
          recommendation_type: string
          status?: string | null
          suggested_changes?: Json | null
          title: string
        }
        Update: {
          applied_at?: string | null
          client_id?: string
          coach_id?: string
          created_at?: string | null
          description?: string
          expires_at?: string | null
          id?: string
          priority?: string | null
          rationale?: string | null
          recommendation_type?: string
          status?: string | null
          suggested_changes?: Json | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_plan_recommendations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_plan_recommendations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_plan_recommendations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_plan_recommendations_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_plan_recommendations_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
        ]
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
      automation_execution_logs: {
        Row: {
          automation_id: string | null
          automation_type: string
          client_id: string | null
          coach_id: string
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          notification_sent: boolean | null
          run_id: string
          status: string
        }
        Insert: {
          automation_id?: string | null
          automation_type: string
          client_id?: string | null
          coach_id: string
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          notification_sent?: boolean | null
          run_id?: string
          status?: string
        }
        Update: {
          automation_id?: string | null
          automation_type?: string
          client_id?: string | null
          coach_id?: string
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          notification_sent?: boolean | null
          run_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_execution_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_execution_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_execution_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_execution_logs_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_execution_logs_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_execution_logs_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_logs: {
        Row: {
          action_type: string
          automation_type: string
          client_id: string | null
          coach_id: string
          created_at: string
          id: string
          message_sent: string | null
          metadata: Json | null
          status: string
        }
        Insert: {
          action_type: string
          automation_type: string
          client_id?: string | null
          coach_id: string
          created_at?: string
          id?: string
          message_sent?: string | null
          metadata?: Json | null
          status?: string
        }
        Update: {
          action_type?: string
          automation_type?: string
          client_id?: string | null
          coach_id?: string
          created_at?: string
          id?: string
          message_sent?: string | null
          metadata?: Json | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_logs_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_logs_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      avatars: {
        Row: {
          category: string
          challenge_id: string | null
          created_at: string | null
          description: string | null
          gender: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_challenge_exclusive: boolean | null
          name: string
          rarity: string
          slug: string
          sort_order: number | null
          unlock_threshold: number | null
          unlock_type: string | null
        }
        Insert: {
          category?: string
          challenge_id?: string | null
          created_at?: string | null
          description?: string | null
          gender?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_challenge_exclusive?: boolean | null
          name: string
          rarity?: string
          slug: string
          sort_order?: number | null
          unlock_threshold?: number | null
          unlock_type?: string | null
        }
        Update: {
          category?: string
          challenge_id?: string | null
          created_at?: string | null
          description?: string | null
          gender?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_challenge_exclusive?: boolean | null
          name?: string
          rarity?: string
          slug?: string
          sort_order?: number | null
          unlock_threshold?: number | null
          unlock_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "avatars_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          category: string
          challenge_id: string | null
          created_at: string
          criteria: Json
          description: string
          icon: string
          id: string
          image_url: string | null
          is_active: boolean | null
          is_challenge_exclusive: boolean | null
          name: string
          rarity: string
          xp_reward: number
        }
        Insert: {
          category?: string
          challenge_id?: string | null
          created_at?: string
          criteria?: Json
          description: string
          icon?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_challenge_exclusive?: boolean | null
          name: string
          rarity?: string
          xp_reward?: number
        }
        Update: {
          category?: string
          challenge_id?: string | null
          created_at?: string
          criteria?: Json
          description?: string
          icon?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_challenge_exclusive?: boolean | null
          name?: string
          rarity?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "badges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author: string | null
          category: string
          content: string
          created_at: string | null
          excerpt: string
          featured_image: string | null
          id: string
          is_published: boolean | null
          keywords: string[]
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          reading_time_minutes: number | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          category: string
          content: string
          created_at?: string | null
          excerpt: string
          featured_image?: string | null
          id?: string
          is_published?: boolean | null
          keywords?: string[]
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          category?: string
          content?: string
          created_at?: string | null
          excerpt?: string
          featured_image?: string | null
          id?: string
          is_published?: boolean | null
          keywords?: string[]
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      booking_requests: {
        Row: {
          amount_due: number | null
          amount_paid: number | null
          client_id: string
          coach_id: string
          created_at: string | null
          currency: string | null
          duration_minutes: number
          id: string
          is_boosted_acquisition: boolean | null
          is_online: boolean | null
          message: string | null
          payment_required: string | null
          payment_status: string | null
          refund_amount: number | null
          refunded_at: string | null
          requested_at: string
          responded_at: string | null
          session_type_id: string | null
          status: string | null
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
        }
        Insert: {
          amount_due?: number | null
          amount_paid?: number | null
          client_id: string
          coach_id: string
          created_at?: string | null
          currency?: string | null
          duration_minutes?: number
          id?: string
          is_boosted_acquisition?: boolean | null
          is_online?: boolean | null
          message?: string | null
          payment_required?: string | null
          payment_status?: string | null
          refund_amount?: number | null
          refunded_at?: string | null
          requested_at: string
          responded_at?: string | null
          session_type_id?: string | null
          status?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
        }
        Update: {
          amount_due?: number | null
          amount_paid?: number | null
          client_id?: string
          coach_id?: string
          created_at?: string | null
          currency?: string | null
          duration_minutes?: number
          id?: string
          is_boosted_acquisition?: boolean | null
          is_online?: boolean | null
          message?: string | null
          payment_required?: string | null
          payment_status?: string | null
          refund_amount?: number | null
          refunded_at?: string | null
          requested_at?: string
          responded_at?: string | null
          session_type_id?: string | null
          status?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
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
            foreignKeyName: "booking_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_leaderboard_profiles"
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
            foreignKeyName: "booking_requests_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
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
      boost_client_attributions: {
        Row: {
          attributed_at: string | null
          booking_amount: number | null
          client_id: string
          coach_id: string
          created_at: string | null
          fee_amount: number | null
          fee_status: string | null
          first_booking_id: string | null
          id: string
          stripe_charge_id: string | null
        }
        Insert: {
          attributed_at?: string | null
          booking_amount?: number | null
          client_id: string
          coach_id: string
          created_at?: string | null
          fee_amount?: number | null
          fee_status?: string | null
          first_booking_id?: string | null
          id?: string
          stripe_charge_id?: string | null
        }
        Update: {
          attributed_at?: string | null
          booking_amount?: number | null
          client_id?: string
          coach_id?: string
          created_at?: string | null
          fee_amount?: number | null
          fee_status?: string | null
          first_booking_id?: string | null
          id?: string
          stripe_charge_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "boost_client_attributions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boost_client_attributions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boost_client_attributions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boost_client_attributions_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boost_client_attributions_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boost_client_attributions_first_booking_id_fkey"
            columns: ["first_booking_id"]
            isOneToOne: false
            referencedRelation: "booking_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      boost_settings: {
        Row: {
          boost_duration_days: number | null
          boost_price: number | null
          commission_rate: number | null
          id: string
          is_active: boolean | null
          max_fee: number | null
          min_fee: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          boost_duration_days?: number | null
          boost_price?: number | null
          commission_rate?: number | null
          id?: string
          is_active?: boolean | null
          max_fee?: number | null
          min_fee?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          boost_duration_days?: number | null
          boost_price?: number | null
          commission_rate?: number | null
          id?: string
          is_active?: boolean | null
          max_fee?: number | null
          min_fee?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "boost_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
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
          caldav_server_url: string | null
          calendar_id: string | null
          connection_type: string | null
          created_at: string | null
          id: string
          last_inbound_sync_at: string | null
          provider: Database["public"]["Enums"]["calendar_provider"]
          refresh_token: string | null
          sync_enabled: boolean | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          caldav_server_url?: string | null
          calendar_id?: string | null
          connection_type?: string | null
          created_at?: string | null
          id?: string
          last_inbound_sync_at?: string | null
          provider: Database["public"]["Enums"]["calendar_provider"]
          refresh_token?: string | null
          sync_enabled?: boolean | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          caldav_server_url?: string | null
          calendar_id?: string | null
          connection_type?: string | null
          created_at?: string | null
          id?: string
          last_inbound_sync_at?: string | null
          provider?: Database["public"]["Enums"]["calendar_provider"]
          refresh_token?: string | null
          sync_enabled?: boolean | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      case_studies: {
        Row: {
          client_id: string | null
          coach_id: string
          content: Json
          created_at: string | null
          generated_narrative: string | null
          id: string
          is_published: boolean | null
          public_url: string | null
          showcase_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          coach_id: string
          content: Json
          created_at?: string | null
          generated_narrative?: string | null
          id?: string
          is_published?: boolean | null
          public_url?: string | null
          showcase_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          coach_id?: string
          content?: Json
          created_at?: string | null
          generated_narrative?: string | null
          id?: string
          is_published?: boolean | null
          public_url?: string | null
          showcase_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_studies_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_studies_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_studies_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_studies_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_studies_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_studies_showcase_id_fkey"
            columns: ["showcase_id"]
            isOneToOne: false
            referencedRelation: "coach_outcome_showcases"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_participants: {
        Row: {
          challenge_id: string
          client_id: string
          completed_at: string | null
          current_progress: number
          id: string
          joined_at: string
          last_wearable_sync_at: string | null
          reward_claimed: boolean | null
          status: string
          unverified_progress: number | null
          verified_progress: number | null
        }
        Insert: {
          challenge_id: string
          client_id: string
          completed_at?: string | null
          current_progress?: number
          id?: string
          joined_at?: string
          last_wearable_sync_at?: string | null
          reward_claimed?: boolean | null
          status?: string
          unverified_progress?: number | null
          verified_progress?: number | null
        }
        Update: {
          challenge_id?: string
          client_id?: string
          completed_at?: string | null
          current_progress?: number
          id?: string
          joined_at?: string
          last_wearable_sync_at?: string | null
          reward_claimed?: boolean | null
          status?: string
          unverified_progress?: number | null
          verified_progress?: number | null
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
          admin_created_by: string | null
          avatar_reward_id: string | null
          badge_reward_id: string | null
          challenge_type: string
          created_at: string
          created_by: string
          data_source: string | null
          description: string | null
          end_date: string
          id: string
          is_active: boolean | null
          max_participants: number | null
          requires_verification: boolean | null
          reward_type: string | null
          start_date: string
          target_audience: string | null
          target_unit: string
          target_value: number
          title: string
          visibility: string
          wearable_data_type: string | null
          xp_reward: number
        }
        Insert: {
          admin_created_by?: string | null
          avatar_reward_id?: string | null
          badge_reward_id?: string | null
          challenge_type?: string
          created_at?: string
          created_by: string
          data_source?: string | null
          description?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          requires_verification?: boolean | null
          reward_type?: string | null
          start_date?: string
          target_audience?: string | null
          target_unit?: string
          target_value?: number
          title: string
          visibility?: string
          wearable_data_type?: string | null
          xp_reward?: number
        }
        Update: {
          admin_created_by?: string | null
          avatar_reward_id?: string | null
          badge_reward_id?: string | null
          challenge_type?: string
          created_at?: string
          created_by?: string
          data_source?: string | null
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          requires_verification?: boolean | null
          reward_type?: string | null
          start_date?: string
          target_audience?: string | null
          target_unit?: string
          target_value?: number
          title?: string
          visibility?: string
          wearable_data_type?: string | null
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "challenges_admin_created_by_fkey"
            columns: ["admin_created_by"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenges_avatar_reward_id_fkey"
            columns: ["avatar_reward_id"]
            isOneToOne: false
            referencedRelation: "avatars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenges_badge_reward_id_fkey"
            columns: ["badge_reward_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      client_ai_summaries: {
        Row: {
          approved_at: string | null
          client_id: string
          coach_edits: Json | null
          coach_id: string
          created_at: string
          generated_content: Json
          id: string
          scheduled_for: string | null
          shared_at: string | null
          status: string
          summary_type: string
          updated_at: string
          version: number
        }
        Insert: {
          approved_at?: string | null
          client_id: string
          coach_edits?: Json | null
          coach_id: string
          created_at?: string
          generated_content: Json
          id?: string
          scheduled_for?: string | null
          shared_at?: string | null
          status?: string
          summary_type?: string
          updated_at?: string
          version?: number
        }
        Update: {
          approved_at?: string | null
          client_id?: string
          coach_edits?: Json | null
          coach_id?: string
          created_at?: string
          generated_content?: Json
          id?: string
          scheduled_for?: string | null
          shared_at?: string | null
          status?: string
          summary_type?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "client_ai_summaries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_ai_summaries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_ai_summaries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_ai_summaries_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_ai_summaries_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_automation_status: {
        Row: {
          client_id: string
          coach_id: string
          created_at: string
          id: string
          is_at_risk: boolean
          last_coach_alert_at: string | null
          last_recovery_attempt_at: string | null
          last_soft_checkin_at: string | null
          muted_until: string | null
          risk_stage: number
          updated_at: string
        }
        Insert: {
          client_id: string
          coach_id: string
          created_at?: string
          id?: string
          is_at_risk?: boolean
          last_coach_alert_at?: string | null
          last_recovery_attempt_at?: string | null
          last_soft_checkin_at?: string | null
          muted_until?: string | null
          risk_stage?: number
          updated_at?: string
        }
        Update: {
          client_id?: string
          coach_id?: string
          created_at?: string
          id?: string
          is_at_risk?: boolean
          last_coach_alert_at?: string | null
          last_recovery_attempt_at?: string | null
          last_soft_checkin_at?: string | null
          muted_until?: string | null
          risk_stage?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_automation_status_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_automation_status_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_automation_status_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_automation_status_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_automation_status_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
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
          is_claimed: boolean | null
          is_featured: boolean | null
          source_data: Json | null
        }
        Insert: {
          badge_id: string
          client_id: string
          earned_at?: string
          id?: string
          is_claimed?: boolean | null
          is_featured?: boolean | null
          source_data?: Json | null
        }
        Update: {
          badge_id?: string
          client_id?: string
          earned_at?: string
          id?: string
          is_claimed?: boolean | null
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
      client_custom_field_values: {
        Row: {
          client_id: string
          created_at: string | null
          field_id: string
          id: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          field_id: string
          id?: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          field_id?: string
          id?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_custom_field_values_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_custom_field_values_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_custom_field_values_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_custom_field_values_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "coach_message_fields"
            referencedColumns: ["id"]
          },
        ]
      }
      client_engagement_history: {
        Row: {
          client_id: string
          coach_id: string
          created_at: string
          engagement_score: number
          factors: Json | null
          id: string
          risk_score: number | null
          trajectory: string | null
          week_start: string
        }
        Insert: {
          client_id: string
          coach_id: string
          created_at?: string
          engagement_score: number
          factors?: Json | null
          id?: string
          risk_score?: number | null
          trajectory?: string | null
          week_start: string
        }
        Update: {
          client_id?: string
          coach_id?: string
          created_at?: string
          engagement_score?: number
          factors?: Json | null
          id?: string
          risk_score?: number | null
          trajectory?: string | null
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_engagement_history_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_engagement_history_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_engagement_history_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_engagement_history_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_engagement_history_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_engagement_scores: {
        Row: {
          client_id: string
          coach_id: string
          habit_completion_score: number | null
          id: string
          message_responsiveness_score: number | null
          overall_score: number
          plan_adherence_score: number | null
          progress_logging_score: number | null
          session_attendance_score: number | null
          updated_at: string
          week_over_week_change: number | null
        }
        Insert: {
          client_id: string
          coach_id: string
          habit_completion_score?: number | null
          id?: string
          message_responsiveness_score?: number | null
          overall_score: number
          plan_adherence_score?: number | null
          progress_logging_score?: number | null
          session_attendance_score?: number | null
          updated_at?: string
          week_over_week_change?: number | null
        }
        Update: {
          client_id?: string
          coach_id?: string
          habit_completion_score?: number | null
          id?: string
          message_responsiveness_score?: number | null
          overall_score?: number
          plan_adherence_score?: number | null
          progress_logging_score?: number | null
          session_attendance_score?: number | null
          updated_at?: string
          week_over_week_change?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "client_engagement_scores_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_engagement_scores_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_engagement_scores_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_engagement_scores_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_engagement_scores_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_goals: {
        Row: {
          client_id: string
          coach_id: string | null
          completed_at: string | null
          created_at: string
          current_value: number | null
          description: string | null
          goal_type: string
          id: string
          start_date: string
          start_value: number | null
          status: string | null
          target_date: string | null
          target_unit: string | null
          target_value: number | null
          title: string
          updated_at: string
        }
        Insert: {
          client_id: string
          coach_id?: string | null
          completed_at?: string | null
          created_at?: string
          current_value?: number | null
          description?: string | null
          goal_type: string
          id?: string
          start_date?: string
          start_value?: number | null
          status?: string | null
          target_date?: string | null
          target_unit?: string | null
          target_value?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          coach_id?: string | null
          completed_at?: string | null
          created_at?: string
          current_value?: number | null
          description?: string | null
          goal_type?: string
          id?: string
          start_date?: string
          start_value?: number | null
          status?: string | null
          target_date?: string | null
          target_unit?: string | null
          target_value?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_goals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_goals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_goals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_goals_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_goals_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
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
          wearable_target_type: string | null
          wearable_target_value: number | null
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
          wearable_target_type?: string | null
          wearable_target_value?: number | null
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
          wearable_target_type?: string | null
          wearable_target_value?: number | null
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
            foreignKeyName: "client_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_notes_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_notes_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_outcome_consents: {
        Row: {
          client_id: string
          client_ip: string | null
          coach_id: string
          consent_type: string
          created_at: string
          granted_at: string
          id: string
          is_active: boolean | null
          revoked_at: string | null
        }
        Insert: {
          client_id: string
          client_ip?: string | null
          coach_id: string
          consent_type: string
          created_at?: string
          granted_at?: string
          id?: string
          is_active?: boolean | null
          revoked_at?: string | null
        }
        Update: {
          client_id?: string
          client_ip?: string | null
          coach_id?: string
          consent_type?: string
          created_at?: string
          granted_at?: string
          id?: string
          is_active?: boolean | null
          revoked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_outcome_consents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_outcome_consents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_outcome_consents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_outcome_consents_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_outcome_consents_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
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
          refund_amount: number | null
          refunded_at: string | null
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
          refund_amount?: number | null
          refunded_at?: string | null
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
          refund_amount?: number | null
          refunded_at?: string | null
          sessions_total?: number
          sessions_used?: number | null
          status?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_package_purchases_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "coach_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      client_profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          allergen_preferences: Json | null
          allergies: string[] | null
          avatar_url: string | null
          body_measurements: Json | null
          city: string | null
          country: string | null
          county: string | null
          created_at: string
          date_of_birth: string | null
          dietary_restrictions: string[] | null
          discovery_tour_seen: boolean | null
          first_name: string | null
          fitness_goals: string[] | null
          gender: string | null
          gender_pronouns: string | null
          height_cm: number | null
          id: string
          last_name: string | null
          leaderboard_display_name: string | null
          leaderboard_visible: boolean | null
          location: string | null
          location_accuracy: string | null
          location_confidence: string | null
          location_lat: number | null
          location_lng: number | null
          medical_conditions: string[] | null
          onboarding_completed: boolean
          onboarding_progress: Json | null
          plans_last_viewed_at: string | null
          selected_avatar_id: string | null
          selected_discipline: string | null
          status: string | null
          status_reason: string | null
          status_updated_at: string | null
          status_updated_by: string | null
          updated_at: string
          user_id: string
          user_profile_id: string | null
          username: string
          weight_kg: number | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          allergen_preferences?: Json | null
          allergies?: string[] | null
          avatar_url?: string | null
          body_measurements?: Json | null
          city?: string | null
          country?: string | null
          county?: string | null
          created_at?: string
          date_of_birth?: string | null
          dietary_restrictions?: string[] | null
          discovery_tour_seen?: boolean | null
          first_name?: string | null
          fitness_goals?: string[] | null
          gender?: string | null
          gender_pronouns?: string | null
          height_cm?: number | null
          id?: string
          last_name?: string | null
          leaderboard_display_name?: string | null
          leaderboard_visible?: boolean | null
          location?: string | null
          location_accuracy?: string | null
          location_confidence?: string | null
          location_lat?: number | null
          location_lng?: number | null
          medical_conditions?: string[] | null
          onboarding_completed?: boolean
          onboarding_progress?: Json | null
          plans_last_viewed_at?: string | null
          selected_avatar_id?: string | null
          selected_discipline?: string | null
          status?: string | null
          status_reason?: string | null
          status_updated_at?: string | null
          status_updated_by?: string | null
          updated_at?: string
          user_id: string
          user_profile_id?: string | null
          username: string
          weight_kg?: number | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          allergen_preferences?: Json | null
          allergies?: string[] | null
          avatar_url?: string | null
          body_measurements?: Json | null
          city?: string | null
          country?: string | null
          county?: string | null
          created_at?: string
          date_of_birth?: string | null
          dietary_restrictions?: string[] | null
          discovery_tour_seen?: boolean | null
          first_name?: string | null
          fitness_goals?: string[] | null
          gender?: string | null
          gender_pronouns?: string | null
          height_cm?: number | null
          id?: string
          last_name?: string | null
          leaderboard_display_name?: string | null
          leaderboard_visible?: boolean | null
          location?: string | null
          location_accuracy?: string | null
          location_confidence?: string | null
          location_lat?: number | null
          location_lng?: number | null
          medical_conditions?: string[] | null
          onboarding_completed?: boolean
          onboarding_progress?: Json | null
          plans_last_viewed_at?: string | null
          selected_avatar_id?: string | null
          selected_discipline?: string | null
          status?: string | null
          status_reason?: string | null
          status_updated_at?: string | null
          status_updated_by?: string | null
          updated_at?: string
          user_id?: string
          user_profile_id?: string | null
          username?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "client_profiles_selected_avatar_id_fkey"
            columns: ["selected_avatar_id"]
            isOneToOne: false
            referencedRelation: "avatars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_profiles_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_progress: {
        Row: {
          body_fat_percentage: number | null
          client_id: string
          coach_id: string | null
          created_at: string
          data_source: string | null
          id: string
          is_verified: boolean | null
          measurements: Json | null
          notes: string | null
          photo_urls: string[] | null
          recorded_at: string
          wearable_connection_id: string | null
          weight_kg: number | null
        }
        Insert: {
          body_fat_percentage?: number | null
          client_id: string
          coach_id?: string | null
          created_at?: string
          data_source?: string | null
          id?: string
          is_verified?: boolean | null
          measurements?: Json | null
          notes?: string | null
          photo_urls?: string[] | null
          recorded_at?: string
          wearable_connection_id?: string | null
          weight_kg?: number | null
        }
        Update: {
          body_fat_percentage?: number | null
          client_id?: string
          coach_id?: string | null
          created_at?: string
          data_source?: string | null
          id?: string
          is_verified?: boolean | null
          measurements?: Json | null
          notes?: string | null
          photo_urls?: string[] | null
          recorded_at?: string
          wearable_connection_id?: string | null
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
            foreignKeyName: "client_progress_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_progress_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_progress_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_progress_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_progress_wearable_connection_id_fkey"
            columns: ["wearable_connection_id"]
            isOneToOne: false
            referencedRelation: "wearable_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      client_reminders: {
        Row: {
          client_id: string
          coach_id: string
          created_at: string
          custom_interval_days: number | null
          custom_message: string | null
          day_of_week: number | null
          end_date: string | null
          frequency: string
          id: string
          is_active: boolean
          is_paused: boolean
          last_sent_at: string | null
          max_sends: number | null
          next_run_at: string | null
          sends_count: number
          start_date: string
          template_id: string | null
          time_of_day: string
          timezone: string
          updated_at: string
        }
        Insert: {
          client_id: string
          coach_id: string
          created_at?: string
          custom_interval_days?: number | null
          custom_message?: string | null
          day_of_week?: number | null
          end_date?: string | null
          frequency?: string
          id?: string
          is_active?: boolean
          is_paused?: boolean
          last_sent_at?: string | null
          max_sends?: number | null
          next_run_at?: string | null
          sends_count?: number
          start_date?: string
          template_id?: string | null
          time_of_day?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          coach_id?: string
          created_at?: string
          custom_interval_days?: number | null
          custom_message?: string | null
          day_of_week?: number | null
          end_date?: string | null
          frequency?: string
          id?: string
          is_active?: boolean
          is_paused?: boolean
          last_sent_at?: string | null
          max_sends?: number | null
          next_run_at?: string | null
          sends_count?: number
          start_date?: string
          template_id?: string | null
          time_of_day?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_reminders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_reminders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_reminders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_reminders_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_reminders_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_reminders_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "reminder_templates"
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
      coach_automation_settings: {
        Row: {
          automation_type: string
          coach_id: string
          config: Json
          created_at: string
          id: string
          is_enabled: boolean
          updated_at: string
        }
        Insert: {
          automation_type: string
          coach_id: string
          config?: Json
          created_at?: string
          id?: string
          is_enabled?: boolean
          updated_at?: string
        }
        Update: {
          automation_type?: string
          coach_id?: string
          config?: Json
          created_at?: string
          id?: string
          is_enabled?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_automation_settings_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_automation_settings_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "coach_availability_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_badges: {
        Row: {
          badge_id: string
          coach_id: string
          earned_at: string | null
          id: string
          is_featured: boolean | null
          source_data: Json | null
        }
        Insert: {
          badge_id: string
          coach_id: string
          earned_at?: string | null
          id?: string
          is_featured?: boolean | null
          source_data?: Json | null
        }
        Update: {
          badge_id?: string
          coach_id?: string
          earned_at?: string | null
          id?: string
          is_featured?: boolean | null
          source_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_badges_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_badges_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_boosts: {
        Row: {
          activated_at: string | null
          activation_payment_intent_id: string | null
          boost_end_date: string | null
          boost_start_date: string | null
          coach_id: string
          created_at: string | null
          deactivated_at: string | null
          id: string
          is_active: boolean
          payment_status: string | null
          total_clients_acquired: number | null
          total_fees_paid: number | null
          updated_at: string | null
        }
        Insert: {
          activated_at?: string | null
          activation_payment_intent_id?: string | null
          boost_end_date?: string | null
          boost_start_date?: string | null
          coach_id: string
          created_at?: string | null
          deactivated_at?: string | null
          id?: string
          is_active?: boolean
          payment_status?: string | null
          total_clients_acquired?: number | null
          total_fees_paid?: number | null
          updated_at?: string | null
        }
        Update: {
          activated_at?: string | null
          activation_payment_intent_id?: string | null
          boost_end_date?: string | null
          boost_start_date?: string | null
          coach_id?: string
          created_at?: string | null
          deactivated_at?: string | null
          id?: string
          is_active?: boolean
          payment_status?: string | null
          total_clients_acquired?: number | null
          total_fees_paid?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_boosts_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: true
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_boosts_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: true
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_client_reports: {
        Row: {
          ai_disclaimer_acknowledged: boolean | null
          client_id: string
          coach_id: string
          coach_notes: string | null
          created_at: string
          id: string
          measurements_comparison: Json | null
          photo_comparison: Json | null
          report_data: Json
          sent_to_client_at: string | null
          status: string
          title: string
          updated_at: string
          wearable_summary: Json | null
        }
        Insert: {
          ai_disclaimer_acknowledged?: boolean | null
          client_id: string
          coach_id: string
          coach_notes?: string | null
          created_at?: string
          id?: string
          measurements_comparison?: Json | null
          photo_comparison?: Json | null
          report_data: Json
          sent_to_client_at?: string | null
          status?: string
          title: string
          updated_at?: string
          wearable_summary?: Json | null
        }
        Update: {
          ai_disclaimer_acknowledged?: boolean | null
          client_id?: string
          coach_id?: string
          coach_notes?: string | null
          created_at?: string
          id?: string
          measurements_comparison?: Json | null
          photo_comparison?: Json | null
          report_data?: Json
          sent_to_client_at?: string | null
          status?: string
          title?: string
          updated_at?: string
          wearable_summary?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_client_reports_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_client_reports_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_client_reports_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_client_reports_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_client_reports_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
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
            foreignKeyName: "coach_clients_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_clients_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_clients_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_clients_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_dashboard_widgets: {
        Row: {
          coach_id: string | null
          config: Json | null
          created_at: string | null
          id: string
          is_visible: boolean | null
          position: number
          size: string | null
          title: string
          updated_at: string | null
          widget_type: string
        }
        Insert: {
          coach_id?: string | null
          config?: Json | null
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          position?: number
          size?: string | null
          title: string
          updated_at?: string | null
          widget_type: string
        }
        Update: {
          coach_id?: string | null
          config?: Json | null
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          position?: number
          size?: string | null
          title?: string
          updated_at?: string | null
          widget_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_dashboard_widgets_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_dashboard_widgets_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_expenses: {
        Row: {
          amount: number
          category: string
          coach_id: string
          created_at: string | null
          currency: string | null
          description: string
          expense_date: string
          id: string
          notes: string | null
          receipt_url: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          category: string
          coach_id: string
          created_at?: string | null
          currency?: string | null
          description: string
          expense_date: string
          id?: string
          notes?: string | null
          receipt_url?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category?: string
          coach_id?: string
          created_at?: string | null
          currency?: string | null
          description?: string
          expense_date?: string
          id?: string
          notes?: string | null
          receipt_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_expenses_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_expenses_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
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
            foreignKeyName: "coach_feature_overrides_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
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
      coach_gallery_images: {
        Row: {
          caption: string | null
          coach_id: string
          created_at: string
          display_order: number
          id: string
          image_url: string
        }
        Insert: {
          caption?: string | null
          coach_id: string
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
        }
        Update: {
          caption?: string | null
          coach_id?: string
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_gallery_images_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_gallery_images_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_group_classes: {
        Row: {
          coach_id: string
          created_at: string
          currency: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_waitlist_open: boolean | null
          location: string | null
          max_participants: number | null
          price: number | null
          schedule_info: string | null
          target_audience: string | null
          title: string
          updated_at: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_waitlist_open?: boolean | null
          location?: string | null
          max_participants?: number | null
          price?: number | null
          schedule_info?: string | null
          target_audience?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_waitlist_open?: boolean | null
          location?: string | null
          max_participants?: number | null
          price?: number | null
          schedule_info?: string | null
          target_audience?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_group_classes_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_group_classes_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_invoice_settings: {
        Row: {
          accent_color: string | null
          bank_details: string | null
          business_address: string | null
          business_email: string | null
          business_name: string | null
          business_phone: string | null
          coach_id: string
          company_registration: string | null
          created_at: string | null
          default_notes: string | null
          default_payment_terms: string | null
          id: string
          logo_url: string | null
          template_id: string | null
          updated_at: string | null
          vat_inclusive: boolean | null
          vat_number: string | null
          vat_rate: number | null
          vat_registered: boolean | null
        }
        Insert: {
          accent_color?: string | null
          bank_details?: string | null
          business_address?: string | null
          business_email?: string | null
          business_name?: string | null
          business_phone?: string | null
          coach_id: string
          company_registration?: string | null
          created_at?: string | null
          default_notes?: string | null
          default_payment_terms?: string | null
          id?: string
          logo_url?: string | null
          template_id?: string | null
          updated_at?: string | null
          vat_inclusive?: boolean | null
          vat_number?: string | null
          vat_rate?: number | null
          vat_registered?: boolean | null
        }
        Update: {
          accent_color?: string | null
          bank_details?: string | null
          business_address?: string | null
          business_email?: string | null
          business_name?: string | null
          business_phone?: string | null
          coach_id?: string
          company_registration?: string | null
          created_at?: string | null
          default_notes?: string | null
          default_payment_terms?: string | null
          id?: string
          logo_url?: string | null
          template_id?: string | null
          updated_at?: string | null
          vat_inclusive?: boolean | null
          vat_number?: string | null
          vat_rate?: number | null
          vat_registered?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_invoice_settings_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: true
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_invoice_settings_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: true
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_invoices: {
        Row: {
          accent_color: string | null
          business_snapshot: Json | null
          client_id: string | null
          coach_id: string
          created_at: string | null
          currency: string | null
          due_date: string | null
          id: string
          invoice_number: string
          notes: string | null
          paid_at: string | null
          refund_amount: number | null
          refunded_at: string | null
          sent_at: string | null
          source_id: string | null
          source_type: string | null
          status: string | null
          stripe_payment_intent_id: string | null
          subtotal: number | null
          tax_amount: number | null
          tax_rate: number | null
          template_id: string | null
          total: number
          updated_at: string | null
        }
        Insert: {
          accent_color?: string | null
          business_snapshot?: Json | null
          client_id?: string | null
          coach_id: string
          created_at?: string | null
          currency?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          notes?: string | null
          paid_at?: string | null
          refund_amount?: number | null
          refunded_at?: string | null
          sent_at?: string | null
          source_id?: string | null
          source_type?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          template_id?: string | null
          total: number
          updated_at?: string | null
        }
        Update: {
          accent_color?: string | null
          business_snapshot?: Json | null
          client_id?: string | null
          coach_id?: string
          created_at?: string | null
          currency?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          notes?: string | null
          paid_at?: string | null
          refund_amount?: number | null
          refunded_at?: string | null
          sent_at?: string | null
          source_id?: string | null
          source_type?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          template_id?: string | null
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_invoices_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_invoices_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_leads: {
        Row: {
          client_id: string
          coach_id: string
          created_at: string | null
          deal_closed_at: string | null
          id: string
          notes: string | null
          offer_sent_at: string | null
          source: string | null
          stage: string
          updated_at: string | null
        }
        Insert: {
          client_id: string
          coach_id: string
          created_at?: string | null
          deal_closed_at?: string | null
          id?: string
          notes?: string | null
          offer_sent_at?: string | null
          source?: string | null
          stage?: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          coach_id?: string
          created_at?: string | null
          deal_closed_at?: string | null
          id?: string
          notes?: string | null
          offer_sent_at?: string | null
          source?: string | null
          stage?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_leads_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_leads_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_leads_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_leads_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_leads_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_message_fields: {
        Row: {
          coach_id: string
          created_at: string | null
          default_value: string | null
          description: string | null
          field_label: string
          field_name: string
          field_type: string
          id: string
          is_active: boolean | null
          is_global: boolean | null
          updated_at: string | null
        }
        Insert: {
          coach_id: string
          created_at?: string | null
          default_value?: string | null
          description?: string | null
          field_label: string
          field_name: string
          field_type?: string
          id?: string
          is_active?: boolean | null
          is_global?: boolean | null
          updated_at?: string | null
        }
        Update: {
          coach_id?: string
          created_at?: string | null
          default_value?: string | null
          description?: string | null
          field_label?: string
          field_name?: string
          field_type?: string
          id?: string
          is_active?: boolean | null
          is_global?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_message_fields_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_message_fields_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_outcome_showcases: {
        Row: {
          after_photo_url: string | null
          before_photo_url: string | null
          client_id: string
          coach_consent_acknowledged: boolean | null
          coach_consent_acknowledged_at: string | null
          coach_id: string
          consent_id: string | null
          consent_status: string | null
          created_at: string
          description: string | null
          display_name: string | null
          display_order: number | null
          external_client_name: string | null
          id: string
          is_anonymized: boolean | null
          is_external: boolean | null
          is_published: boolean | null
          published_at: string | null
          scheduled_publish_at: string | null
          stats: Json | null
          title: string | null
          updated_at: string
        }
        Insert: {
          after_photo_url?: string | null
          before_photo_url?: string | null
          client_id: string
          coach_consent_acknowledged?: boolean | null
          coach_consent_acknowledged_at?: string | null
          coach_id: string
          consent_id?: string | null
          consent_status?: string | null
          created_at?: string
          description?: string | null
          display_name?: string | null
          display_order?: number | null
          external_client_name?: string | null
          id?: string
          is_anonymized?: boolean | null
          is_external?: boolean | null
          is_published?: boolean | null
          published_at?: string | null
          scheduled_publish_at?: string | null
          stats?: Json | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          after_photo_url?: string | null
          before_photo_url?: string | null
          client_id?: string
          coach_consent_acknowledged?: boolean | null
          coach_consent_acknowledged_at?: string | null
          coach_id?: string
          consent_id?: string | null
          consent_status?: string | null
          created_at?: string
          description?: string | null
          display_name?: string | null
          display_order?: number | null
          external_client_name?: string | null
          id?: string
          is_anonymized?: boolean | null
          is_external?: boolean | null
          is_published?: boolean | null
          published_at?: string | null
          scheduled_publish_at?: string | null
          stats?: Json | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_outcome_showcases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_outcome_showcases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_outcome_showcases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_outcome_showcases_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_outcome_showcases_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_outcome_showcases_consent_id_fkey"
            columns: ["consent_id"]
            isOneToOne: false
            referencedRelation: "client_outcome_consents"
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
          session_duration_minutes: number | null
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
          session_duration_minutes?: number | null
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
          session_duration_minutes?: number | null
          updated_at?: string
          validity_days?: number | null
        }
        Relationships: []
      }
      coach_profiles: {
        Row: {
          also_client: boolean | null
          auto_review_requests: boolean | null
          bio: string | null
          booking_mode: string | null
          card_image_url: string | null
          certifications: Json | null
          coach_types: string[] | null
          created_at: string
          currency: string | null
          custom_review_message: string | null
          default_session_location: string | null
          discovery_tour_seen: boolean | null
          display_name: string | null
          experience_start_date: string | null
          experience_years: number | null
          facebook_url: string | null
          gym_affiliation: string | null
          hourly_rate: number | null
          id: string
          in_person_available: boolean | null
          instagram_url: string | null
          is_complete_profile: boolean | null
          is_verified: boolean | null
          leads_last_viewed_at: string | null
          linkedin_url: string | null
          location: string | null
          location_city: string | null
          location_country: string | null
          location_country_code: string | null
          location_lat: number | null
          location_lng: number | null
          location_place_id: string | null
          location_region: string | null
          marketplace_visible: boolean | null
          min_cancellation_hours: number | null
          onboarding_completed: boolean
          onboarding_progress: Json | null
          online_available: boolean | null
          post_booking_buffer_minutes: number | null
          pre_booking_buffer_minutes: number | null
          primary_coach_type: string | null
          profile_image_url: string | null
          review_request_delay_hours: number | null
          review_request_mode: string | null
          selected_avatar_id: string | null
          status: string | null
          status_reason: string | null
          status_updated_at: string | null
          status_updated_by: string | null
          stripe_connect_id: string | null
          stripe_connect_onboarded: boolean | null
          subscription_tier: string | null
          threads_url: string | null
          tiktok_url: string | null
          updated_at: string
          user_id: string
          user_profile_id: string | null
          username: string
          verification_notes: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
          who_i_work_with: string | null
          x_url: string | null
          youtube_url: string | null
        }
        Insert: {
          also_client?: boolean | null
          auto_review_requests?: boolean | null
          bio?: string | null
          booking_mode?: string | null
          card_image_url?: string | null
          certifications?: Json | null
          coach_types?: string[] | null
          created_at?: string
          currency?: string | null
          custom_review_message?: string | null
          default_session_location?: string | null
          discovery_tour_seen?: boolean | null
          display_name?: string | null
          experience_start_date?: string | null
          experience_years?: number | null
          facebook_url?: string | null
          gym_affiliation?: string | null
          hourly_rate?: number | null
          id?: string
          in_person_available?: boolean | null
          instagram_url?: string | null
          is_complete_profile?: boolean | null
          is_verified?: boolean | null
          leads_last_viewed_at?: string | null
          linkedin_url?: string | null
          location?: string | null
          location_city?: string | null
          location_country?: string | null
          location_country_code?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_place_id?: string | null
          location_region?: string | null
          marketplace_visible?: boolean | null
          min_cancellation_hours?: number | null
          onboarding_completed?: boolean
          onboarding_progress?: Json | null
          online_available?: boolean | null
          post_booking_buffer_minutes?: number | null
          pre_booking_buffer_minutes?: number | null
          primary_coach_type?: string | null
          profile_image_url?: string | null
          review_request_delay_hours?: number | null
          review_request_mode?: string | null
          selected_avatar_id?: string | null
          status?: string | null
          status_reason?: string | null
          status_updated_at?: string | null
          status_updated_by?: string | null
          stripe_connect_id?: string | null
          stripe_connect_onboarded?: boolean | null
          subscription_tier?: string | null
          threads_url?: string | null
          tiktok_url?: string | null
          updated_at?: string
          user_id: string
          user_profile_id?: string | null
          username: string
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
          who_i_work_with?: string | null
          x_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          also_client?: boolean | null
          auto_review_requests?: boolean | null
          bio?: string | null
          booking_mode?: string | null
          card_image_url?: string | null
          certifications?: Json | null
          coach_types?: string[] | null
          created_at?: string
          currency?: string | null
          custom_review_message?: string | null
          default_session_location?: string | null
          discovery_tour_seen?: boolean | null
          display_name?: string | null
          experience_start_date?: string | null
          experience_years?: number | null
          facebook_url?: string | null
          gym_affiliation?: string | null
          hourly_rate?: number | null
          id?: string
          in_person_available?: boolean | null
          instagram_url?: string | null
          is_complete_profile?: boolean | null
          is_verified?: boolean | null
          leads_last_viewed_at?: string | null
          linkedin_url?: string | null
          location?: string | null
          location_city?: string | null
          location_country?: string | null
          location_country_code?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_place_id?: string | null
          location_region?: string | null
          marketplace_visible?: boolean | null
          min_cancellation_hours?: number | null
          onboarding_completed?: boolean
          onboarding_progress?: Json | null
          online_available?: boolean | null
          post_booking_buffer_minutes?: number | null
          pre_booking_buffer_minutes?: number | null
          primary_coach_type?: string | null
          profile_image_url?: string | null
          review_request_delay_hours?: number | null
          review_request_mode?: string | null
          selected_avatar_id?: string | null
          status?: string | null
          status_reason?: string | null
          status_updated_at?: string | null
          status_updated_by?: string | null
          stripe_connect_id?: string | null
          stripe_connect_onboarded?: boolean | null
          subscription_tier?: string | null
          threads_url?: string | null
          tiktok_url?: string | null
          updated_at?: string
          user_id?: string
          user_profile_id?: string | null
          username?: string
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
          who_i_work_with?: string | null
          x_url?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_profiles_selected_avatar_id_fkey"
            columns: ["selected_avatar_id"]
            isOneToOne: false
            referencedRelation: "avatars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_profiles_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_qualifications: {
        Row: {
          coach_id: string
          created_at: string | null
          document_number: string | null
          document_url: string | null
          expiry_date: string | null
          id: string
          is_verified: boolean | null
          issue_date: string | null
          issuing_authority: string | null
          name: string
          updated_at: string | null
          verification_document_id: string | null
          verification_source: string | null
          verification_status: string | null
        }
        Insert: {
          coach_id: string
          created_at?: string | null
          document_number?: string | null
          document_url?: string | null
          expiry_date?: string | null
          id?: string
          is_verified?: boolean | null
          issue_date?: string | null
          issuing_authority?: string | null
          name: string
          updated_at?: string | null
          verification_document_id?: string | null
          verification_source?: string | null
          verification_status?: string | null
        }
        Update: {
          coach_id?: string
          created_at?: string | null
          document_number?: string | null
          document_url?: string | null
          expiry_date?: string | null
          id?: string
          is_verified?: boolean | null
          issue_date?: string | null
          issuing_authority?: string | null
          name?: string
          updated_at?: string | null
          verification_document_id?: string | null
          verification_source?: string | null
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_qualifications_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_qualifications_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_qualifications_verification_document_id_fkey"
            columns: ["verification_document_id"]
            isOneToOne: false
            referencedRelation: "coach_verification_documents"
            referencedColumns: ["id"]
          },
        ]
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
          ai_analysis: Json | null
          ai_analysis_error: string | null
          ai_analysis_status: string | null
          ai_analyzed_at: string | null
          ai_confidence_score: number | null
          ai_flagged: boolean | null
          ai_flagged_reasons: string[] | null
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
          ai_analysis?: Json | null
          ai_analysis_error?: string | null
          ai_analysis_status?: string | null
          ai_analyzed_at?: string | null
          ai_confidence_score?: number | null
          ai_flagged?: boolean | null
          ai_flagged_reasons?: string[] | null
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
          ai_analysis?: Json | null
          ai_analysis_error?: string | null
          ai_analysis_status?: string | null
          ai_analyzed_at?: string | null
          ai_confidence_score?: number | null
          ai_flagged?: boolean | null
          ai_flagged_reasons?: string[] | null
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
          {
            foreignKeyName: "coach_verification_documents_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coaching_sessions: {
        Row: {
          amount_paid: number | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          client_id: string | null
          coach_id: string
          created_at: string
          currency: string | null
          deposit_amount: number | null
          duration_minutes: number
          external_calendar_event_id: string | null
          external_client_id: string | null
          id: string
          is_online: boolean | null
          location: string | null
          notes: string | null
          package_purchase_id: string | null
          payment_mode: string | null
          payment_status: string | null
          price: number | null
          remaining_balance: number | null
          rescheduled_from: string | null
          scheduled_at: string
          session_type: string
          status: string
          stripe_payment_intent_id: string | null
          token_return_reason: string | null
          token_returned: boolean | null
          token_returned_by: string | null
          updated_at: string
          video_meeting_id: string | null
          video_meeting_url: string | null
          video_provider: Database["public"]["Enums"]["video_provider"] | null
        }
        Insert: {
          amount_paid?: number | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          client_id?: string | null
          coach_id: string
          created_at?: string
          currency?: string | null
          deposit_amount?: number | null
          duration_minutes?: number
          external_calendar_event_id?: string | null
          external_client_id?: string | null
          id?: string
          is_online?: boolean | null
          location?: string | null
          notes?: string | null
          package_purchase_id?: string | null
          payment_mode?: string | null
          payment_status?: string | null
          price?: number | null
          remaining_balance?: number | null
          rescheduled_from?: string | null
          scheduled_at: string
          session_type?: string
          status?: string
          stripe_payment_intent_id?: string | null
          token_return_reason?: string | null
          token_returned?: boolean | null
          token_returned_by?: string | null
          updated_at?: string
          video_meeting_id?: string | null
          video_meeting_url?: string | null
          video_provider?: Database["public"]["Enums"]["video_provider"] | null
        }
        Update: {
          amount_paid?: number | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          client_id?: string | null
          coach_id?: string
          created_at?: string
          currency?: string | null
          deposit_amount?: number | null
          duration_minutes?: number
          external_calendar_event_id?: string | null
          external_client_id?: string | null
          id?: string
          is_online?: boolean | null
          location?: string | null
          notes?: string | null
          package_purchase_id?: string | null
          payment_mode?: string | null
          payment_status?: string | null
          price?: number | null
          remaining_balance?: number | null
          rescheduled_from?: string | null
          scheduled_at?: string
          session_type?: string
          status?: string
          stripe_payment_intent_id?: string | null
          token_return_reason?: string | null
          token_returned?: boolean | null
          token_returned_by?: string | null
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
            foreignKeyName: "coaching_sessions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coaching_sessions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coaching_sessions_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coaching_sessions_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coaching_sessions_external_client_id_fkey"
            columns: ["external_client_id"]
            isOneToOne: false
            referencedRelation: "external_session_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coaching_sessions_package_purchase_id_fkey"
            columns: ["package_purchase_id"]
            isOneToOne: false
            referencedRelation: "client_package_purchases"
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
            foreignKeyName: "connection_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connection_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connection_requests_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connection_requests_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
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
          completed_at: string | null
          currency: string | null
          id: string
          product_id: string | null
          purchased_at: string | null
          refund_amount: number | null
          refunded_at: string | null
          status: string | null
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          user_id: string
        }
        Insert: {
          access_expires_at?: string | null
          amount_paid: number
          bundle_id?: string | null
          coach_id: string
          completed_at?: string | null
          currency?: string | null
          id?: string
          product_id?: string | null
          purchased_at?: string | null
          refund_amount?: number | null
          refunded_at?: string | null
          status?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          user_id: string
        }
        Update: {
          access_expires_at?: string | null
          amount_paid?: number
          bundle_id?: string | null
          coach_id?: string
          completed_at?: string | null
          currency?: string | null
          id?: string
          product_id?: string | null
          purchased_at?: string | null
          refund_amount?: number | null
          refunded_at?: string | null
          status?: string | null
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
            foreignKeyName: "content_purchases_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
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
          {
            foreignKeyName: "digital_bundles_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_products: {
        Row: {
          category: string | null
          coach_id: string
          compare_at_price: number | null
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
          slug: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          category?: string | null
          coach_id: string
          compare_at_price?: number | null
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
          slug?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          category?: string | null
          coach_id?: string
          compare_at_price?: number | null
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
          slug?: string | null
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
          {
            foreignKeyName: "digital_products_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      discipline_events: {
        Row: {
          created_at: string | null
          discipline_id: string
          event_type: string
          id: string
          recorded_at: string
          source: string
          user_id: string
          value_json: Json
        }
        Insert: {
          created_at?: string | null
          discipline_id: string
          event_type: string
          id?: string
          recorded_at?: string
          source?: string
          user_id: string
          value_json?: Json
        }
        Update: {
          created_at?: string | null
          discipline_id?: string
          event_type?: string
          id?: string
          recorded_at?: string
          source?: string
          user_id?: string
          value_json?: Json
        }
        Relationships: []
      }
      discipline_requests: {
        Row: {
          created_at: string | null
          discipline_name: string
          id: string
          requested_metrics: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          discipline_name: string
          id?: string
          requested_metrics?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          discipline_name?: string
          id?: string
          requested_metrics?: string | null
          user_id?: string
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          email_type: string
          id: string
          recipient_email: string
          resend_id: string | null
          sent_at: string | null
          status: string | null
          subject: string
          user_id: string | null
        }
        Insert: {
          email_type: string
          id?: string
          recipient_email: string
          resend_id?: string | null
          sent_at?: string | null
          status?: string | null
          subject: string
          user_id?: string | null
        }
        Update: {
          email_type?: string
          id?: string
          recipient_email?: string
          resend_id?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          user_id?: string | null
        }
        Relationships: []
      }
      email_preferences: {
        Row: {
          booking_reminders: boolean | null
          created_at: string | null
          id: string
          marketing_emails: boolean | null
          message_notifications: boolean | null
          updated_at: string | null
          user_id: string
          weekly_digest: boolean | null
        }
        Insert: {
          booking_reminders?: boolean | null
          created_at?: string | null
          id?: string
          marketing_emails?: boolean | null
          message_notifications?: boolean | null
          updated_at?: string | null
          user_id: string
          weekly_digest?: boolean | null
        }
        Update: {
          booking_reminders?: boolean | null
          created_at?: string | null
          id?: string
          marketing_emails?: boolean | null
          message_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string
          weekly_digest?: boolean | null
        }
        Relationships: []
      }
      email_verifications: {
        Row: {
          code: string
          created_at: string | null
          email: string
          expires_at: string
          id: string
          verified_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          verified_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          verified_at?: string | null
        }
        Relationships: []
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
          {
            foreignKeyName: "exercises_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      external_calendar_events: {
        Row: {
          calendar_connection_id: string | null
          created_at: string | null
          end_time: string
          external_event_id: string
          id: string
          is_all_day: boolean | null
          last_synced_at: string | null
          source: string | null
          start_time: string
          title: string | null
          user_id: string
        }
        Insert: {
          calendar_connection_id?: string | null
          created_at?: string | null
          end_time: string
          external_event_id: string
          id?: string
          is_all_day?: boolean | null
          last_synced_at?: string | null
          source?: string | null
          start_time: string
          title?: string | null
          user_id: string
        }
        Update: {
          calendar_connection_id?: string | null
          created_at?: string | null
          end_time?: string
          external_event_id?: string
          id?: string
          is_all_day?: boolean | null
          last_synced_at?: string | null
          source?: string | null
          start_time?: string
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_calendar_events_calendar_connection_id_fkey"
            columns: ["calendar_connection_id"]
            isOneToOne: false
            referencedRelation: "calendar_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      external_session_clients: {
        Row: {
          coach_id: string
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          coach_id: string
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          coach_id?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "external_session_clients_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "external_session_clients_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
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
      feedback: {
        Row: {
          admin_notes: string | null
          category: string
          created_at: string | null
          id: string
          message: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          subject: string
          updated_at: string | null
          user_id: string
          user_type: string
        }
        Insert: {
          admin_notes?: string | null
          category?: string
          created_at?: string | null
          id?: string
          message: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          subject: string
          updated_at?: string | null
          user_id: string
          user_type: string
        }
        Update: {
          admin_notes?: string | null
          category?: string
          created_at?: string | null
          id?: string
          message?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          subject?: string
          updated_at?: string | null
          user_id?: string
          user_type?: string
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
      food_diary: {
        Row: {
          calories: number | null
          carbs_g: number | null
          client_id: string
          created_at: string | null
          external_id: string | null
          fat_g: number | null
          fiber_g: number | null
          food_id: string | null
          food_name: string
          food_type: string | null
          id: string
          logged_at: string
          meal_type: string
          notes: string | null
          protein_g: number | null
          serving_size_g: number | null
          servings: number | null
          sodium_mg: number | null
          source: string | null
          sugar_g: number | null
          updated_at: string | null
        }
        Insert: {
          calories?: number | null
          carbs_g?: number | null
          client_id: string
          created_at?: string | null
          external_id?: string | null
          fat_g?: number | null
          fiber_g?: number | null
          food_id?: string | null
          food_name: string
          food_type?: string | null
          id?: string
          logged_at?: string
          meal_type: string
          notes?: string | null
          protein_g?: number | null
          serving_size_g?: number | null
          servings?: number | null
          sodium_mg?: number | null
          source?: string | null
          sugar_g?: number | null
          updated_at?: string | null
        }
        Update: {
          calories?: number | null
          carbs_g?: number | null
          client_id?: string
          created_at?: string | null
          external_id?: string | null
          fat_g?: number | null
          fiber_g?: number | null
          food_id?: string | null
          food_name?: string
          food_type?: string | null
          id?: string
          logged_at?: string
          meal_type?: string
          notes?: string | null
          protein_g?: number | null
          serving_size_g?: number | null
          servings?: number | null
          sodium_mg?: number | null
          source?: string | null
          sugar_g?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "food_diary_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_diary_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_diary_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_diary_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
        ]
      }
      foods: {
        Row: {
          allergens: Json | null
          barcode: string | null
          calories_per_100g: number
          carbs_g: number
          category_id: string | null
          coach_id: string | null
          created_at: string
          dietary_preferences: Json | null
          external_id: string | null
          fat_g: number
          fiber_g: number | null
          id: string
          image_url: string | null
          is_custom: boolean | null
          name: string
          protein_g: number
          saturated_fat_g: number | null
          serving_description: string | null
          serving_size_g: number | null
          sodium_mg: number | null
          source: string | null
          sugar_g: number | null
          updated_at: string
        }
        Insert: {
          allergens?: Json | null
          barcode?: string | null
          calories_per_100g?: number
          carbs_g?: number
          category_id?: string | null
          coach_id?: string | null
          created_at?: string
          dietary_preferences?: Json | null
          external_id?: string | null
          fat_g?: number
          fiber_g?: number | null
          id?: string
          image_url?: string | null
          is_custom?: boolean | null
          name: string
          protein_g?: number
          saturated_fat_g?: number | null
          serving_description?: string | null
          serving_size_g?: number | null
          sodium_mg?: number | null
          source?: string | null
          sugar_g?: number | null
          updated_at?: string
        }
        Update: {
          allergens?: Json | null
          barcode?: string | null
          calories_per_100g?: number
          carbs_g?: number
          category_id?: string | null
          coach_id?: string | null
          created_at?: string
          dietary_preferences?: Json | null
          external_id?: string | null
          fat_g?: number
          fiber_g?: number | null
          id?: string
          image_url?: string | null
          is_custom?: boolean | null
          name?: string
          protein_g?: number
          saturated_fat_g?: number | null
          serving_description?: string | null
          serving_size_g?: number | null
          sodium_mg?: number | null
          source?: string | null
          sugar_g?: number | null
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
          {
            foreignKeyName: "foods_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      foods_autocomplete: {
        Row: {
          allergens: string[] | null
          barcode: string | null
          brand: string | null
          calories_per_100g: number | null
          carbs_g: number | null
          country: string
          created_at: string
          external_id: string
          fat_g: number | null
          food_type: string
          id: string
          image_url: string | null
          language: string
          popularity_score: number
          product_name: string
          protein_g: number | null
          search_text: string
          source: string | null
          updated_at: string
        }
        Insert: {
          allergens?: string[] | null
          barcode?: string | null
          brand?: string | null
          calories_per_100g?: number | null
          carbs_g?: number | null
          country?: string
          created_at?: string
          external_id: string
          fat_g?: number | null
          food_type?: string
          id?: string
          image_url?: string | null
          language?: string
          popularity_score?: number
          product_name: string
          protein_g?: number | null
          search_text: string
          source?: string | null
          updated_at?: string
        }
        Update: {
          allergens?: string[] | null
          barcode?: string | null
          brand?: string | null
          calories_per_100g?: number | null
          carbs_g?: number | null
          country?: string
          created_at?: string
          external_id?: string
          fat_g?: number | null
          food_type?: string
          id?: string
          image_url?: string | null
          language?: string
          popularity_score?: number
          product_name?: string
          protein_g?: number | null
          search_text?: string
          source?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      goal_milestones: {
        Row: {
          celebrated: boolean | null
          created_at: string
          goal_id: string
          id: string
          milestone_label: string | null
          milestone_value: number
          reached_at: string | null
        }
        Insert: {
          celebrated?: boolean | null
          created_at?: string
          goal_id: string
          id?: string
          milestone_label?: string | null
          milestone_value: number
          reached_at?: string | null
        }
        Update: {
          celebrated?: boolean | null
          created_at?: string
          goal_id?: string
          id?: string
          milestone_label?: string | null
          milestone_value?: number
          reached_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_milestones_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "client_goals"
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
            foreignKeyName: "grocery_lists_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grocery_lists_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grocery_lists_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grocery_lists_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_class_waitlist: {
        Row: {
          client_id: string
          group_class_id: string
          id: string
          joined_at: string
          status: string
        }
        Insert: {
          client_id: string
          group_class_id: string
          id?: string
          joined_at?: string
          status?: string
        }
        Update: {
          client_id?: string
          group_class_id?: string
          id?: string
          joined_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_class_waitlist_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_class_waitlist_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_class_waitlist_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_class_waitlist_group_class_id_fkey"
            columns: ["group_class_id"]
            isOneToOne: false
            referencedRelation: "coach_group_classes"
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
          health_data_id: string | null
          id: string
          logged_at: string
          notes: string | null
          verification_type: string | null
        }
        Insert: {
          client_id: string
          completed_count?: number
          created_at?: string
          habit_id: string
          health_data_id?: string | null
          id?: string
          logged_at?: string
          notes?: string | null
          verification_type?: string | null
        }
        Update: {
          client_id?: string
          completed_count?: number
          created_at?: string
          habit_id?: string
          health_data_id?: string | null
          id?: string
          logged_at?: string
          notes?: string | null
          verification_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "client_habits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habit_logs_health_data_id_fkey"
            columns: ["health_data_id"]
            isOneToOne: false
            referencedRelation: "health_data_sync"
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
      health_data_sharing_preferences: {
        Row: {
          client_id: string
          coach_id: string
          created_at: string | null
          data_type: string
          id: string
          is_allowed: boolean
          updated_at: string | null
        }
        Insert: {
          client_id: string
          coach_id: string
          created_at?: string | null
          data_type: string
          id?: string
          is_allowed?: boolean
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          coach_id?: string
          created_at?: string | null
          data_type?: string
          id?: string
          is_allowed?: boolean
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_data_sharing_preferences_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_data_sharing_preferences_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_data_sharing_preferences_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_data_sharing_preferences_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_data_sharing_preferences_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
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
          updated_at: string | null
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
          updated_at?: string | null
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
          updated_at?: string | null
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
            foreignKeyName: "health_data_sync_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_data_sync_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_leaderboard_profiles"
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
      invoice_line_items: {
        Row: {
          created_at: string | null
          description: string
          id: string
          invoice_id: string
          quantity: number | null
          total: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          invoice_id: string
          quantity?: number | null
          total: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number | null
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "coach_invoices"
            referencedColumns: ["id"]
          },
        ]
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
          folder_id: string | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          name: string
          tags: string[] | null
          updated_at: string | null
          usage_count: number | null
          variables: string[] | null
        }
        Insert: {
          category?: string | null
          coach_id: string
          content: string
          created_at?: string | null
          folder_id?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          name: string
          tags?: string[] | null
          updated_at?: string | null
          usage_count?: number | null
          variables?: string[] | null
        }
        Update: {
          category?: string | null
          coach_id?: string
          content?: string
          created_at?: string | null
          folder_id?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          name?: string
          tags?: string[] | null
          updated_at?: string | null
          usage_count?: number | null
          variables?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_templates_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_templates_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "template_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          metadata: Json | null
          read_at: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          read_at?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          read_at?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      milestone_automations: {
        Row: {
          actions: Json
          apply_to_all_clients: boolean
          coach_id: string
          created_at: string
          id: string
          is_enabled: boolean
          message_template: string | null
          milestone_type: string
          threshold_value: number
          updated_at: string
        }
        Insert: {
          actions?: Json
          apply_to_all_clients?: boolean
          coach_id: string
          created_at?: string
          id?: string
          is_enabled?: boolean
          message_template?: string | null
          milestone_type: string
          threshold_value?: number
          updated_at?: string
        }
        Update: {
          actions?: Json
          apply_to_all_clients?: boolean
          coach_id?: string
          created_at?: string
          id?: string
          is_enabled?: boolean
          message_template?: string | null
          milestone_type?: string
          threshold_value?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestone_automations_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestone_automations_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
        ]
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
          dropoff_threshold_days: number | null
          email_bookings: boolean | null
          email_dropoff_alerts: boolean | null
          email_marketing: boolean | null
          email_messages: boolean | null
          email_reminders: boolean | null
          id: string
          push_achievements: boolean | null
          push_bookings: boolean | null
          push_challenges: boolean | null
          push_connections: boolean | null
          push_dropoff_alerts: boolean | null
          push_messages: boolean | null
          push_motivation: boolean | null
          push_onboarding: boolean | null
          push_progress: boolean | null
          push_reengagement: boolean | null
          push_reminders: boolean | null
          push_showcase: boolean | null
          reminder_hours_before: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dropoff_threshold_days?: number | null
          email_bookings?: boolean | null
          email_dropoff_alerts?: boolean | null
          email_marketing?: boolean | null
          email_messages?: boolean | null
          email_reminders?: boolean | null
          id?: string
          push_achievements?: boolean | null
          push_bookings?: boolean | null
          push_challenges?: boolean | null
          push_connections?: boolean | null
          push_dropoff_alerts?: boolean | null
          push_messages?: boolean | null
          push_motivation?: boolean | null
          push_onboarding?: boolean | null
          push_progress?: boolean | null
          push_reengagement?: boolean | null
          push_reminders?: boolean | null
          push_showcase?: boolean | null
          reminder_hours_before?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dropoff_threshold_days?: number | null
          email_bookings?: boolean | null
          email_dropoff_alerts?: boolean | null
          email_marketing?: boolean | null
          email_messages?: boolean | null
          email_reminders?: boolean | null
          id?: string
          push_achievements?: boolean | null
          push_bookings?: boolean | null
          push_challenges?: boolean | null
          push_connections?: boolean | null
          push_dropoff_alerts?: boolean | null
          push_messages?: boolean | null
          push_motivation?: boolean | null
          push_onboarding?: boolean | null
          push_progress?: boolean | null
          push_reengagement?: boolean | null
          push_reminders?: boolean | null
          push_showcase?: boolean | null
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
      oauth_temp_tokens: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          oauth_token: string
          oauth_token_secret: string
          provider: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          oauth_token: string
          oauth_token_secret: string
          provider: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          oauth_token?: string
          oauth_token_secret?: string
          provider?: string
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
            foreignKeyName: "plan_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_leaderboard_profiles"
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
            foreignKeyName: "plan_assignments_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
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
      plan_phase_completions: {
        Row: {
          auto_progressed: boolean | null
          client_id: string
          completed_at: string | null
          completion_percentage: number | null
          created_at: string | null
          id: string
          phase_number: number
          plan_assignment_id: string
          week_number: number
        }
        Insert: {
          auto_progressed?: boolean | null
          client_id: string
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          id?: string
          phase_number: number
          plan_assignment_id: string
          week_number: number
        }
        Update: {
          auto_progressed?: boolean | null
          client_id?: string
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          id?: string
          phase_number?: number
          plan_assignment_id?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "plan_phase_completions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_phase_completions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_phase_completions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_phase_completions_plan_assignment_id_fkey"
            columns: ["plan_assignment_id"]
            isOneToOne: false
            referencedRelation: "plan_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      plateau_history: {
        Row: {
          baseline_value: number | null
          breakthrough_at: string | null
          change_percentage: number | null
          client_id: string
          coach_id: string
          coach_notes: string | null
          created_at: string
          current_value: number | null
          detected_at: string
          duration_weeks: number | null
          end_date: string | null
          id: string
          is_manual: boolean | null
          metric_type: string
          start_date: string
        }
        Insert: {
          baseline_value?: number | null
          breakthrough_at?: string | null
          change_percentage?: number | null
          client_id: string
          coach_id: string
          coach_notes?: string | null
          created_at?: string
          current_value?: number | null
          detected_at?: string
          duration_weeks?: number | null
          end_date?: string | null
          id?: string
          is_manual?: boolean | null
          metric_type: string
          start_date: string
        }
        Update: {
          baseline_value?: number | null
          breakthrough_at?: string | null
          change_percentage?: number | null
          client_id?: string
          coach_id?: string
          coach_notes?: string | null
          created_at?: string
          current_value?: number | null
          detected_at?: string
          duration_weeks?: number | null
          end_date?: string | null
          id?: string
          is_manual?: boolean | null
          metric_type?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "plateau_history_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plateau_history_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plateau_history_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plateau_history_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plateau_history_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_features: {
        Row: {
          category: string | null
          created_at: string | null
          default_value: Json | null
          description: string | null
          feature_key: string
          feature_type: string | null
          id: string
          is_enforced: boolean | null
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          default_value?: Json | null
          description?: string | null
          feature_key: string
          feature_type?: string | null
          id?: string
          is_enforced?: boolean | null
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          default_value?: Json | null
          description?: string | null
          feature_key?: string
          feature_type?: string | null
          id?: string
          is_enforced?: boolean | null
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
          billing_interval: string | null
          coach_id: string
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          current_product_id: string | null
          id: string
          pending_tier: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: string
          updated_at: string
        }
        Insert: {
          billing_interval?: string | null
          coach_id: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          current_product_id?: string | null
          id?: string
          pending_tier?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string
        }
        Update: {
          billing_interval?: string | null
          coach_id?: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          current_product_id?: string | null
          id?: string
          pending_tier?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      platform_tier_stripe: {
        Row: {
          created_at: string | null
          id: string
          is_synced: boolean | null
          last_synced_at: string | null
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
          stripe_product_id: string | null
          tier: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_synced?: boolean | null
          last_synced_at?: string | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          stripe_product_id?: string | null
          tier: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_synced?: boolean | null
          last_synced_at?: string | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          stripe_product_id?: string | null
          tier?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          created_at: string | null
          device_name: string | null
          device_type: string | null
          id: string
          is_active: boolean | null
          player_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_name?: string | null
          device_type?: string | null
          id?: string
          is_active?: boolean | null
          player_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_name?: string | null
          device_type?: string | null
          id?: string
          is_active?: boolean | null
          player_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reminder_templates: {
        Row: {
          category: string
          coach_id: string | null
          created_at: string
          default_frequency: string
          default_time: string
          id: string
          is_active: boolean
          is_system: boolean
          message_template: string
          name: string
        }
        Insert: {
          category: string
          coach_id?: string | null
          created_at?: string
          default_frequency?: string
          default_time?: string
          id?: string
          is_active?: boolean
          is_system?: boolean
          message_template: string
          name: string
        }
        Update: {
          category?: string
          coach_id?: string | null
          created_at?: string
          default_frequency?: string
          default_time?: string
          id?: string
          is_active?: boolean
          is_system?: boolean
          message_template?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminder_templates_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminder_templates_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "review_disputes_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
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
      review_prompts: {
        Row: {
          client_id: string
          coach_id: string
          completed: boolean | null
          id: string
          last_reminder_at: string | null
          reminder_count: number | null
          review_id: string | null
          sent_at: string | null
          session_id: string | null
        }
        Insert: {
          client_id: string
          coach_id: string
          completed?: boolean | null
          id?: string
          last_reminder_at?: string | null
          reminder_count?: number | null
          review_id?: string | null
          sent_at?: string | null
          session_id?: string | null
        }
        Update: {
          client_id?: string
          coach_id?: string
          completed?: boolean | null
          id?: string
          last_reminder_at?: string | null
          reminder_count?: number | null
          review_id?: string | null
          sent_at?: string | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_prompts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_prompts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_prompts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_prompts_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_prompts_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_prompts_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_prompts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "coaching_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          client_id: string
          coach_id: string
          coach_responded_at: string | null
          coach_response: string | null
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
          coach_responded_at?: string | null
          coach_response?: string | null
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
          coach_responded_at?: string | null
          coach_response?: string | null
          created_at?: string
          id?: string
          is_public?: boolean | null
          rating?: number
          review_text?: string | null
          session_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_checkin_assignments: {
        Row: {
          client_id: string
          created_at: string
          id: string
          is_active: boolean
          last_sent_at: string | null
          template_checkin_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_sent_at?: string | null
          template_checkin_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_sent_at?: string | null
          template_checkin_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_checkin_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_checkin_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_checkin_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_checkin_assignments_template_checkin_id_fkey"
            columns: ["template_checkin_id"]
            isOneToOne: false
            referencedRelation: "scheduled_checkins"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_checkin_logs: {
        Row: {
          checkin_id: string
          client_id: string
          coach_id: string
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          notification_sent: boolean | null
          status: string
        }
        Insert: {
          checkin_id: string
          client_id: string
          coach_id: string
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          notification_sent?: boolean | null
          status: string
        }
        Update: {
          checkin_id?: string
          client_id?: string
          coach_id?: string
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          notification_sent?: boolean | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_checkin_logs_checkin_id_fkey"
            columns: ["checkin_id"]
            isOneToOne: false
            referencedRelation: "scheduled_checkins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_checkin_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_checkin_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_checkin_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_checkin_logs_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_checkin_logs_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_checkin_logs_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_checkins: {
        Row: {
          client_id: string
          coach_id: string
          created_at: string | null
          day_of_month: number | null
          day_of_week: number | null
          id: string
          is_active: boolean | null
          is_template: boolean
          last_sent_at: string | null
          linked_template_id: string | null
          message_template: string
          next_run_at: string | null
          schedule_type: string
          scheduled_at: string | null
          time_of_day: string
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          coach_id: string
          created_at?: string | null
          day_of_month?: number | null
          day_of_week?: number | null
          id?: string
          is_active?: boolean | null
          is_template?: boolean
          last_sent_at?: string | null
          linked_template_id?: string | null
          message_template: string
          next_run_at?: string | null
          schedule_type: string
          scheduled_at?: string | null
          time_of_day: string
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          coach_id?: string
          created_at?: string | null
          day_of_month?: number | null
          day_of_week?: number | null
          id?: string
          is_active?: boolean | null
          is_template?: boolean
          last_sent_at?: string | null
          linked_template_id?: string | null
          message_template?: string
          next_run_at?: string | null
          schedule_type?: string
          scheduled_at?: string | null
          time_of_day?: string
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_checkins_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_checkins_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_checkins_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_checkins_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_checkins_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_checkins_linked_template_id_fkey"
            columns: ["linked_template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      session_offers: {
        Row: {
          accepted_at: string | null
          client_id: string
          coach_id: string
          created_at: string
          created_session_id: string | null
          currency: string
          declined_at: string | null
          duration_minutes: number
          expires_at: string | null
          id: string
          is_free: boolean
          is_online: boolean
          location: string | null
          notes: string | null
          payment_mode: string | null
          price: number
          proposed_date: string
          session_type: string
          status: string
        }
        Insert: {
          accepted_at?: string | null
          client_id: string
          coach_id: string
          created_at?: string
          created_session_id?: string | null
          currency?: string
          declined_at?: string | null
          duration_minutes?: number
          expires_at?: string | null
          id?: string
          is_free?: boolean
          is_online?: boolean
          location?: string | null
          notes?: string | null
          payment_mode?: string | null
          price?: number
          proposed_date: string
          session_type: string
          status?: string
        }
        Update: {
          accepted_at?: string | null
          client_id?: string
          coach_id?: string
          created_at?: string
          created_session_id?: string | null
          currency?: string
          declined_at?: string | null
          duration_minutes?: number
          expires_at?: string | null
          id?: string
          is_free?: boolean
          is_online?: boolean
          location?: string | null
          notes?: string | null
          payment_mode?: string | null
          price?: number
          proposed_date?: string
          session_type?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_offers_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_offers_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_offers_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_offers_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_offers_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_offers_created_session_id_fkey"
            columns: ["created_session_id"]
            isOneToOne: false
            referencedRelation: "coaching_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_token_history: {
        Row: {
          action: string
          created_at: string | null
          id: string
          package_purchase_id: string | null
          performed_by: string | null
          reason: string | null
          session_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          package_purchase_id?: string | null
          performed_by?: string | null
          reason?: string | null
          session_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          package_purchase_id?: string | null
          performed_by?: string | null
          reason?: string | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_token_history_package_purchase_id_fkey"
            columns: ["package_purchase_id"]
            isOneToOne: false
            referencedRelation: "client_package_purchases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_token_history_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "coaching_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_types: {
        Row: {
          coach_id: string
          created_at: string | null
          currency: string | null
          deposit_type: string | null
          deposit_value: number | null
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean | null
          is_in_person: boolean | null
          is_online: boolean | null
          name: string
          payment_required: string | null
          price: number
          updated_at: string | null
        }
        Insert: {
          coach_id: string
          created_at?: string | null
          currency?: string | null
          deposit_type?: string | null
          deposit_value?: number | null
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          is_in_person?: boolean | null
          is_online?: boolean | null
          name: string
          payment_required?: string | null
          price: number
          updated_at?: string | null
        }
        Update: {
          coach_id?: string
          created_at?: string | null
          currency?: string | null
          deposit_type?: string | null
          deposit_value?: number | null
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          is_in_person?: boolean | null
          is_online?: boolean | null
          name?: string
          payment_required?: string | null
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
          {
            foreignKeyName: "session_types_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_tier_changes: {
        Row: {
          change_reason: string | null
          change_source: string
          coach_id: string
          created_at: string
          id: string
          metadata: Json | null
          new_tier: string
          old_tier: string | null
        }
        Insert: {
          change_reason?: string | null
          change_source?: string
          coach_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          new_tier: string
          old_tier?: string | null
        }
        Update: {
          change_reason?: string | null
          change_source?: string
          coach_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          new_tier?: string
          old_tier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_tier_changes_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_tier_changes_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
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
          {
            foreignKeyName: "subscriptions_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_cache: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      team_feature_permissions: {
        Row: {
          admin_id: string
          created_at: string | null
          feature_key: string
          id: string
          is_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          admin_id: string
          created_at?: string | null
          feature_key: string
          id?: string
          is_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          admin_id?: string
          created_at?: string | null
          feature_key?: string
          id?: string
          is_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_feature_permissions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      template_folders: {
        Row: {
          coach_id: string
          color: string | null
          created_at: string
          id: string
          name: string
          position: number | null
          updated_at: string
        }
        Insert: {
          coach_id: string
          color?: string | null
          created_at?: string
          id?: string
          name: string
          position?: number | null
          updated_at?: string
        }
        Update: {
          coach_id?: string
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          position?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_folders_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_folders_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
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
      training_log_exercises: {
        Row: {
          created_at: string | null
          exercise_name: string
          id: string
          notes: string | null
          order_index: number
          training_log_id: string
        }
        Insert: {
          created_at?: string | null
          exercise_name: string
          id?: string
          notes?: string | null
          order_index?: number
          training_log_id: string
        }
        Update: {
          created_at?: string | null
          exercise_name?: string
          id?: string
          notes?: string | null
          order_index?: number
          training_log_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_log_exercises_training_log_id_fkey"
            columns: ["training_log_id"]
            isOneToOne: false
            referencedRelation: "training_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      training_log_sets: {
        Row: {
          created_at: string | null
          distance_meters: number | null
          duration_seconds: number | null
          exercise_id: string
          id: string
          is_drop_set: boolean | null
          is_warmup: boolean | null
          notes: string | null
          reps: number | null
          rpe: number | null
          set_number: number
          weight_kg: number | null
        }
        Insert: {
          created_at?: string | null
          distance_meters?: number | null
          duration_seconds?: number | null
          exercise_id: string
          id?: string
          is_drop_set?: boolean | null
          is_warmup?: boolean | null
          notes?: string | null
          reps?: number | null
          rpe?: number | null
          set_number?: number
          weight_kg?: number | null
        }
        Update: {
          created_at?: string | null
          distance_meters?: number | null
          duration_seconds?: number | null
          exercise_id?: string
          id?: string
          is_drop_set?: boolean | null
          is_warmup?: boolean | null
          notes?: string | null
          reps?: number | null
          rpe?: number | null
          set_number?: number
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "training_log_sets_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "training_log_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      training_logs: {
        Row: {
          client_id: string
          created_at: string | null
          duration_minutes: number | null
          fatigue_level: string | null
          id: string
          logged_at: string
          notes: string | null
          rpe: number | null
          updated_at: string | null
          workout_name: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          duration_minutes?: number | null
          fatigue_level?: string | null
          id?: string
          logged_at?: string
          notes?: string | null
          rpe?: number | null
          updated_at?: string | null
          workout_name: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          duration_minutes?: number | null
          fatigue_level?: string | null
          id?: string
          logged_at?: string
          notes?: string | null
          rpe?: number | null
          updated_at?: string | null
          workout_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_leaderboard_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      training_plans: {
        Row: {
          auto_progress_enabled: boolean | null
          coach_id: string
          content: Json | null
          created_at: string
          description: string | null
          duration_weeks: number | null
          id: string
          is_template: boolean | null
          name: string
          plan_type: string
          progression_rules: Json | null
          updated_at: string
        }
        Insert: {
          auto_progress_enabled?: boolean | null
          coach_id: string
          content?: Json | null
          created_at?: string
          description?: string | null
          duration_weeks?: number | null
          id?: string
          is_template?: boolean | null
          name: string
          plan_type: string
          progression_rules?: Json | null
          updated_at?: string
        }
        Update: {
          auto_progress_enabled?: boolean | null
          coach_id?: string
          content?: Json | null
          created_at?: string
          description?: string | null
          duration_weeks?: number | null
          id?: string
          is_template?: boolean | null
          name?: string
          plan_type?: string
          progression_rules?: Json | null
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
          {
            foreignKeyName: "training_plans_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
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
            foreignKeyName: "transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_leaderboard_profiles"
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
            foreignKeyName: "transactions_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
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
      upsell_suggestions: {
        Row: {
          client_id: string
          coach_id: string
          converted_purchase_id: string | null
          created_at: string
          id: string
          outcome: string | null
          outcome_at: string | null
          package_id: string | null
          priority: string | null
          reason: string
          suggested_at: string
          suggestion_type: string
        }
        Insert: {
          client_id: string
          coach_id: string
          converted_purchase_id?: string | null
          created_at?: string
          id?: string
          outcome?: string | null
          outcome_at?: string | null
          package_id?: string | null
          priority?: string | null
          reason: string
          suggested_at?: string
          suggestion_type: string
        }
        Update: {
          client_id?: string
          coach_id?: string
          converted_purchase_id?: string | null
          created_at?: string
          id?: string
          outcome?: string | null
          outcome_at?: string | null
          package_id?: string | null
          priority?: string | null
          reason?: string
          suggested_at?: string
          suggestion_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "upsell_suggestions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upsell_suggestions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upsell_suggestions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upsell_suggestions_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upsell_suggestions_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upsell_suggestions_converted_purchase_id_fkey"
            columns: ["converted_purchase_id"]
            isOneToOne: false
            referencedRelation: "client_package_purchases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upsell_suggestions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "coach_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      user_avatars: {
        Row: {
          avatar_id: string
          id: string
          unlock_source: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          avatar_id: string
          id?: string
          unlock_source?: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          avatar_id?: string
          id?: string
          unlock_source?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_avatars_avatar_id_fkey"
            columns: ["avatar_id"]
            isOneToOne: false
            referencedRelation: "avatars"
            referencedColumns: ["id"]
          },
        ]
      }
      user_connections: {
        Row: {
          addressee_profile_type: string
          addressee_user_id: string
          created_at: string | null
          id: string
          message: string | null
          requester_profile_type: string
          requester_user_id: string
          responded_at: string | null
          status: string
        }
        Insert: {
          addressee_profile_type: string
          addressee_user_id: string
          created_at?: string | null
          id?: string
          message?: string | null
          requester_profile_type: string
          requester_user_id: string
          responded_at?: string | null
          status?: string
        }
        Update: {
          addressee_profile_type?: string
          addressee_user_id?: string
          created_at?: string | null
          id?: string
          message?: string | null
          requester_profile_type?: string
          requester_user_id?: string
          responded_at?: string | null
          status?: string
        }
        Relationships: []
      }
      user_debug_logs: {
        Row: {
          component: string | null
          created_at: string | null
          event_data: Json | null
          event_name: string
          event_type: string
          id: string
          route: string | null
          session_id: string
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          component?: string | null
          created_at?: string | null
          event_data?: Json | null
          event_name: string
          event_type: string
          id?: string
          route?: string | null
          session_id: string
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          component?: string | null
          created_at?: string | null
          event_data?: Json | null
          event_name?: string
          event_type?: string
          id?: string
          route?: string | null
          session_id?: string
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          country: string | null
          country_preference: string | null
          county: string | null
          created_at: string | null
          display_name: string | null
          first_name: string | null
          id: string
          language_preference: string | null
          last_name: string | null
          locale_initialized_at: string | null
          location: string | null
          terms_accepted_at: string | null
          terms_app_version: string | null
          terms_platform: string | null
          terms_version: string | null
          updated_at: string | null
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          country_preference?: string | null
          county?: string | null
          created_at?: string | null
          display_name?: string | null
          first_name?: string | null
          id?: string
          language_preference?: string | null
          last_name?: string | null
          locale_initialized_at?: string | null
          location?: string | null
          terms_accepted_at?: string | null
          terms_app_version?: string | null
          terms_platform?: string | null
          terms_version?: string | null
          updated_at?: string | null
          user_id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          country_preference?: string | null
          county?: string | null
          created_at?: string | null
          display_name?: string | null
          first_name?: string | null
          id?: string
          language_preference?: string | null
          last_name?: string | null
          locale_initialized_at?: string | null
          location?: string | null
          terms_accepted_at?: string | null
          terms_app_version?: string | null
          terms_platform?: string | null
          terms_version?: string | null
          updated_at?: string | null
          user_id?: string
          username?: string
        }
        Relationships: []
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
      user_security_settings: {
        Row: {
          created_at: string | null
          id: string
          two_factor_disabled_at: string | null
          two_factor_enabled: boolean | null
          two_factor_method: string | null
          two_factor_verified_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          two_factor_disabled_at?: string | null
          two_factor_enabled?: boolean | null
          two_factor_method?: string | null
          two_factor_verified_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          two_factor_disabled_at?: string | null
          two_factor_enabled?: boolean | null
          two_factor_method?: string | null
          two_factor_verified_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string | null
          device_info: string | null
          id: string
          ip_country: string | null
          ip_region: string | null
          is_active: boolean | null
          is_current: boolean | null
          last_seen_at: string | null
          platform: string | null
          session_token_hash: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_info?: string | null
          id?: string
          ip_country?: string | null
          ip_region?: string | null
          is_active?: boolean | null
          is_current?: boolean | null
          last_seen_at?: string | null
          platform?: string | null
          session_token_hash: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_info?: string | null
          id?: string
          ip_country?: string | null
          ip_region?: string | null
          is_active?: boolean | null
          is_current?: boolean | null
          last_seen_at?: string | null
          platform?: string | null
          session_token_hash?: string
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
          {
            foreignKeyName: "video_conference_settings_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "public_coach_profiles"
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
          token_secret: string | null
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
          token_secret?: string | null
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
          token_secret?: string | null
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
          {
            foreignKeyName: "wearable_connections_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wearable_connections_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_leaderboard_profiles"
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
      leaderboard_profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          country: string | null
          county: string | null
          current_level: number | null
          first_name: string | null
          id: string | null
          last_name: string | null
          leaderboard_display_name: string | null
          leaderboard_visible: boolean | null
          total_xp: number | null
          username: string | null
        }
        Relationships: []
      }
      public_coach_profiles: {
        Row: {
          bio: string | null
          card_image_url: string | null
          certifications: Json | null
          coach_types: string[] | null
          created_at: string | null
          currency: string | null
          display_name: string | null
          experience_years: number | null
          facebook_url: string | null
          gym_affiliation: string | null
          hourly_rate: number | null
          id: string | null
          in_person_available: boolean | null
          instagram_url: string | null
          is_complete_profile: boolean | null
          is_verified: boolean | null
          linkedin_url: string | null
          location: string | null
          location_city: string | null
          location_country: string | null
          location_country_code: string | null
          location_lat: number | null
          location_lng: number | null
          location_region: string | null
          marketplace_visible: boolean | null
          online_available: boolean | null
          primary_coach_type: string | null
          profile_image_url: string | null
          selected_avatar_id: string | null
          threads_url: string | null
          tiktok_url: string | null
          username: string | null
          verification_status: string | null
          who_i_work_with: string | null
          x_url: string | null
          youtube_url: string | null
        }
        Insert: {
          bio?: string | null
          card_image_url?: string | null
          certifications?: Json | null
          coach_types?: string[] | null
          created_at?: string | null
          currency?: string | null
          display_name?: string | null
          experience_years?: number | null
          facebook_url?: string | null
          gym_affiliation?: string | null
          hourly_rate?: number | null
          id?: string | null
          in_person_available?: boolean | null
          instagram_url?: string | null
          is_complete_profile?: boolean | null
          is_verified?: boolean | null
          linkedin_url?: string | null
          location?: string | null
          location_city?: string | null
          location_country?: string | null
          location_country_code?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_region?: string | null
          marketplace_visible?: boolean | null
          online_available?: boolean | null
          primary_coach_type?: string | null
          profile_image_url?: string | null
          selected_avatar_id?: string | null
          threads_url?: string | null
          tiktok_url?: string | null
          username?: string | null
          verification_status?: string | null
          who_i_work_with?: string | null
          x_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          bio?: string | null
          card_image_url?: string | null
          certifications?: Json | null
          coach_types?: string[] | null
          created_at?: string | null
          currency?: string | null
          display_name?: string | null
          experience_years?: number | null
          facebook_url?: string | null
          gym_affiliation?: string | null
          hourly_rate?: number | null
          id?: string | null
          in_person_available?: boolean | null
          instagram_url?: string | null
          is_complete_profile?: boolean | null
          is_verified?: boolean | null
          linkedin_url?: string | null
          location?: string | null
          location_city?: string | null
          location_country?: string | null
          location_country_code?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_region?: string | null
          marketplace_visible?: boolean | null
          online_available?: boolean | null
          primary_coach_type?: string | null
          profile_image_url?: string | null
          selected_avatar_id?: string | null
          threads_url?: string | null
          tiktok_url?: string | null
          username?: string | null
          verification_status?: string | null
          who_i_work_with?: string | null
          x_url?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_profiles_selected_avatar_id_fkey"
            columns: ["selected_avatar_id"]
            isOneToOne: false
            referencedRelation: "avatars"
            referencedColumns: ["id"]
          },
        ]
      }
      public_leaderboard_profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          country: string | null
          county: string | null
          current_level: number | null
          id: string | null
          leaderboard_display_name: string | null
          total_xp: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      award_xp: {
        Args: {
          p_amount: number
          p_client_id: string
          p_description?: string
          p_source: string
          p_source_id?: string
        }
        Returns: undefined
      }
      calculate_age: { Args: { dob: string }; Returns: number }
      calculate_boost_fee: { Args: { booking_amount: number }; Returns: number }
      calculate_experience_years: {
        Args: { start_date: string }
        Returns: number
      }
      check_and_award_health_badges: {
        Args: { p_client_id: string }
        Returns: {
          badge_id: string
          badge_name: string
          was_awarded: boolean
        }[]
      }
      check_email_exists: { Args: { email_to_check: string }; Returns: boolean }
      client_can_view_client_profile: {
        Args: { target_client_profile_id: string }
        Returns: boolean
      }
      client_has_messaged_coach: {
        Args: { client_profile_id: string }
        Returns: boolean
      }
      client_is_connected_to_coach: {
        Args: { coach_profile_id: string }
        Returns: boolean
      }
      coach_can_view_client_data: {
        Args: {
          p_client_id: string
          p_coach_user_id: string
          p_data_type: string
        }
        Returns: boolean
      }
      coach_can_view_client_profile: {
        Args: { client_profile_id: string }
        Returns: boolean
      }
      coach_can_view_health_data: {
        Args: {
          p_client_id: string
          p_coach_user_id: string
          p_data_type: string
        }
        Returns: boolean
      }
      coach_has_client: {
        Args: { client_profile_id: string }
        Returns: boolean
      }
      coach_has_messaged_client: {
        Args: { coach_profile_id: string }
        Returns: boolean
      }
      coach_is_visible: { Args: { check_coach_id: string }; Returns: boolean }
      delete_orphaned_auth_users: {
        Args: never
        Returns: {
          deleted_email: string
          deleted_user_id: string
        }[]
      }
      find_orphaned_auth_users: { Args: never; Returns: string[] }
      generate_product_slug: {
        Args: { product_id: string; title: string }
        Returns: string
      }
      generate_unique_username: { Args: { base_name: string }; Returns: string }
      get_client_leaderboard_rank: {
        Args: { client_id_param: string }
        Returns: number
      }
      get_leaderboard_locations: {
        Args: { p_location_type: string }
        Returns: {
          location_value: string
          user_count: number
        }[]
      }
      get_public_leaderboard: {
        Args: {
          p_limit?: number
          p_location_type?: string
          p_location_value?: string
          p_offset?: number
        }
        Returns: {
          city: string
          country: string
          county: string
          display_name: string
          level: number
          rank: number
          total_xp: number
        }[]
      }
      get_public_leaderboard_count: {
        Args: { p_location_type?: string; p_location_value?: string }
        Returns: number
      }
      get_ranked_coaches:
        | {
            Args: {
              p_coach_types?: string[]
              p_filter_country_code?: string
              p_in_person_only?: boolean
              p_limit?: number
              p_max_price?: number
              p_min_price?: number
              p_online_only?: boolean
              p_search_term?: string
              p_user_city?: string
              p_user_country_code?: string
              p_user_lat?: number
              p_user_lng?: number
              p_user_region?: string
            }
            Returns: {
              avatar_rarity: string
              avatar_slug: string
              bio: string
              booking_mode: string
              card_image_url: string
              coach_types: string[]
              created_at: string
              currency: string
              display_name: string
              distance_miles: number
              engagement_score: number
              experience_years: number
              facebook_url: string
              gym_affiliation: string
              hourly_rate: number
              id: string
              in_person_available: boolean
              instagram_url: string
              is_sponsored: boolean
              is_verified: boolean
              linkedin_url: string
              location: string
              location_city: string
              location_country: string
              location_country_code: string
              location_region: string
              location_score: number
              location_tier: number
              marketplace_visible: boolean
              onboarding_completed: boolean
              online_available: boolean
              profile_image_url: string
              profile_score: number
              selected_avatar_id: string
              threads_url: string
              tiktok_url: string
              total_score: number
              user_id: string
              username: string
              verified_at: string
              verified_qualification_count: number
              who_i_work_with: string
              x_url: string
              youtube_url: string
            }[]
          }
        | {
            Args: {
              p_country_code?: string
              p_limit?: number
              p_user_city?: string
              p_user_country?: string
              p_user_county?: string
              p_user_lat?: number
              p_user_lng?: number
            }
            Returns: {
              achievements: Json
              availability_status: string
              base_score: number
              bio: string
              boost_expires_at: string
              certifications: Json
              city: string
              coach_types: string[]
              country: string
              county: string
              cover_image_url: string
              created_at: string
              currency: string
              display_name: string
              distance_miles: number
              experience_years: number
              final_score: number
              hourly_rate: number
              id: string
              is_accepting_clients: boolean
              is_boosted: boolean
              is_verified: boolean
              languages_spoken: string[]
              location_lat: number
              location_lng: number
              location_tier: number
              offers_in_person: boolean
              offers_online: boolean
              profile_completeness: number
              profile_image_url: string
              rating_average: number
              rating_count: number
              slug: string
              social_links: Json
              specializations: string[]
              total_clients: number
              travel_radius_miles: number
              updated_at: string
              user_id: string
              verification_status: string
            }[]
          }
      has_role:
        | {
            Args: { _role: Database["public"]["Enums"]["app_role"] }
            Returns: boolean
          }
        | {
            Args: {
              _role: Database["public"]["Enums"]["app_role"]
              _user_id: string
            }
            Returns: boolean
          }
      increment_boost_stats: {
        Args: { p_coach_id: string; p_fee_amount: number }
        Returns: undefined
      }
      increment_food_popularity: {
        Args: { p_country?: string; p_external_id: string }
        Returns: undefined
      }
      is_username_available: {
        Args: { check_username: string }
        Returns: boolean
      }
      notify_admins: {
        Args: {
          p_data?: Json
          p_message: string
          p_title: string
          p_type: string
        }
        Returns: undefined
      }
      notify_client: {
        Args: {
          p_client_id: string
          p_data?: Json
          p_message: string
          p_title: string
          p_type: string
        }
        Returns: undefined
      }
      notify_coach: {
        Args: {
          p_coach_id: string
          p_data?: Json
          p_message: string
          p_title: string
          p_type: string
        }
        Returns: undefined
      }
      search_users_by_email: {
        Args: { search_email: string }
        Returns: {
          avatar_url: string
          display_name: string
          first_name: string
          last_name: string
          location: string
          profile_image_url: string
          profile_type: string
          user_id: string
          username: string
        }[]
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
      wearable_provider:
        | "health_connect"
        | "fitbit"
        | "garmin"
        | "apple_health"
        | "manual"
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
      wearable_provider: [
        "health_connect",
        "fitbit",
        "garmin",
        "apple_health",
        "manual",
      ],
    },
  },
} as const
