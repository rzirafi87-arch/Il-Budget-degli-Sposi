export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          church_id: string | null
          created_at: string | null
          event_type: string
          id: string
          ip_address: string | null
          location_id: string | null
          referrer: string | null
          session_id: string | null
          supplier_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          church_id?: string | null
          created_at?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          location_id?: string | null
          referrer?: string | null
          session_id?: string | null
          supplier_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          church_id?: string | null
          created_at?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          location_id?: string | null
          referrer?: string | null
          session_id?: string | null
          supplier_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "high_rated_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      atelier: {
        Row: {
          address: string | null
          capacity: number | null
          category: string
          city: string
          country: string | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          price_range: string | null
          province: string | null
          region: string
          services: string[] | null
          source: string | null
          styles: string[] | null
          updated_at: string | null
          verified: boolean | null
          website: string | null
        }
        Insert: {
          address?: string | null
          capacity?: number | null
          category: string
          city: string
          country?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          price_range?: string | null
          province?: string | null
          region: string
          services?: string[] | null
          source?: string | null
          styles?: string[] | null
          updated_at?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Update: {
          address?: string | null
          capacity?: number | null
          category?: string
          city?: string
          country?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          price_range?: string | null
          province?: string | null
          region?: string
          services?: string[] | null
          source?: string | null
          styles?: string[] | null
          updated_at?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Relationships: []
      }
      budget_ideas: {
        Row: {
          category_id: string
          event_id: string
          id: string
          idea_amount: number | null
          inserted_at: string | null
          updated_at: string | null
        }
        Insert: {
          category_id: string
          event_id: string
          id?: string
          idea_amount?: number | null
          inserted_at?: string | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string
          event_id?: string
          id?: string
          idea_amount?: number | null
          inserted_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_ideas_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_ideas_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_items: {
        Row: {
          amount: number | null
          country_code: string
          event_id: string | null
          id: number
          name: string
          saved_supplier_id: string | null
          tradition_id: number | null
          vendor_id: string | null
        }
        Insert: {
          amount?: number | null
          country_code: string
          event_id?: string | null
          id?: number
          name: string
          saved_supplier_id?: string | null
          tradition_id?: number | null
          vendor_id?: string | null
        }
        Update: {
          amount?: number | null
          country_code?: string
          event_id?: string | null
          id?: number
          name?: string
          saved_supplier_id?: string | null
          tradition_id?: number | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_items_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_items_saved_supplier_id_fkey"
            columns: ["saved_supplier_id"]
            isOneToOne: false
            referencedRelation: "saved_suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_items_tradition_id_fkey"
            columns: ["tradition_id"]
            isOneToOne: false
            referencedRelation: "traditions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_items_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_items_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors_with_places"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_provenance: {
        Row: {
          entity_id: string | null
          entity_type: string
          external_id: string
          external_key: string | null
          freshness_status: string
          id: string
          imported_at: string
          last_seen_at: string
          metadata: Json
          missed_observations: number
          raw_fingerprint: string
          source_name: string
          source_type: string
          source_updated_at: string | null
          source_url: string | null
        }
        Insert: {
          entity_id?: string | null
          entity_type: string
          external_id: string
          external_key?: string | null
          freshness_status?: string
          id?: string
          imported_at?: string
          last_seen_at?: string
          metadata?: Json
          missed_observations?: number
          raw_fingerprint: string
          source_name: string
          source_type: string
          source_updated_at?: string | null
          source_url?: string | null
        }
        Update: {
          entity_id?: string | null
          entity_type?: string
          external_id?: string
          external_key?: string | null
          freshness_status?: string
          id?: string
          imported_at?: string
          last_seen_at?: string
          metadata?: Json
          missed_observations?: number
          raw_fingerprint?: string
          source_name?: string
          source_type?: string
          source_updated_at?: string | null
          source_url?: string | null
        }
        Relationships: []
      }
      catalog_review_queue: {
        Row: {
          candidate_entity_id: string | null
          conflict_level: string
          created_at: string
          entity_type: string
          id: string
          incoming_fingerprint: string
          match_score: number
          payload: Json
          reasons: Json
          reviewed_at: string | null
          source: string
          status: string
        }
        Insert: {
          candidate_entity_id?: string | null
          conflict_level: string
          created_at?: string
          entity_type: string
          id?: string
          incoming_fingerprint: string
          match_score: number
          payload?: Json
          reasons?: Json
          reviewed_at?: string | null
          source: string
          status?: string
        }
        Update: {
          candidate_entity_id?: string | null
          conflict_level?: string
          created_at?: string
          entity_type?: string
          id?: string
          incoming_fingerprint?: string
          match_score?: number
          payload?: Json
          reasons?: Json
          reviewed_at?: string | null
          source?: string
          status?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          display_order: number | null
          event_id: string | null
          event_type_id: string | null
          icon: string | null
          id: string
          inserted_at: string | null
          name: string | null
          sort: number
          updated_at: string | null
        }
        Insert: {
          display_order?: number | null
          event_id?: string | null
          event_type_id?: string | null
          icon?: string | null
          id?: string
          inserted_at?: string | null
          name?: string | null
          sort?: number
          updated_at?: string | null
        }
        Update: {
          display_order?: number | null
          event_id?: string | null
          event_type_id?: string | null
          icon?: string | null
          id?: string
          inserted_at?: string | null
          name?: string | null
          sort?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_event_type_id_fkey"
            columns: ["event_type_id"]
            isOneToOne: false
            referencedRelation: "event_types"
            referencedColumns: ["id"]
          },
        ]
      }
      category_translations: {
        Row: {
          category_id: string
          locale: string
          name: string
        }
        Insert: {
          category_id: string
          locale: string
          name: string
        }
        Update: {
          category_id?: string
          locale?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "category_translations_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "category_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "i18n_locales"
            referencedColumns: ["code"]
          },
        ]
      }
      checklist_modules: {
        Row: {
          country_code: string
          id: number
          is_required: boolean | null
          module_name: string
          tradition_id: number | null
        }
        Insert: {
          country_code: string
          id?: number
          is_required?: boolean | null
          module_name: string
          tradition_id?: number | null
        }
        Update: {
          country_code?: string
          id?: number
          is_required?: boolean | null
          module_name?: string
          tradition_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_modules_tradition_id_fkey"
            columns: ["tradition_id"]
            isOneToOne: false
            referencedRelation: "traditions"
            referencedColumns: ["id"]
          },
        ]
      }
      churches: {
        Row: {
          accessibility: string | null
          address: string | null
          address_line: string | null
          capacity: number | null
          church_type: string | null
          city: string
          confidence_score: number
          contact_clicks: number | null
          country: string | null
          country_code: string
          created_at: string
          denomination: string | null
          description: string | null
          email: string | null
          external_id: string | null
          google_place_id: string | null
          google_rating: number | null
          google_rating_count: number | null
          id: string
          inserted_at: string | null
          is_featured: boolean | null
          last_synced_at: string | null
          last_verified_at: string | null
          last_view_at: string | null
          latitude: number | null
          longitude: number | null
          name: string
          normalized_address: string | null
          normalized_name: string
          parking: string | null
          phone: string | null
          place_type: string
          postal_code: string | null
          profile_views: number | null
          province: string
          region: string
          religion: string | null
          requires_baptism: boolean | null
          requires_marriage_course: boolean | null
          source: string
          source_updated_at: string | null
          source_url: string | null
          subscription_expires_at: string | null
          subscription_tier: string | null
          subtype: string | null
          updated_at: string | null
          user_id: string | null
          verification_status: string
          verified: boolean | null
          website: string | null
          website_clicks: number | null
          wedding_ceremony_available: boolean | null
        }
        Insert: {
          accessibility?: string | null
          address?: string | null
          address_line?: string | null
          capacity?: number | null
          church_type?: string | null
          city: string
          confidence_score?: number
          contact_clicks?: number | null
          country?: string | null
          country_code: string
          created_at?: string
          denomination?: string | null
          description?: string | null
          email?: string | null
          external_id?: string | null
          google_place_id?: string | null
          google_rating?: number | null
          google_rating_count?: number | null
          id?: string
          inserted_at?: string | null
          is_featured?: boolean | null
          last_synced_at?: string | null
          last_verified_at?: string | null
          last_view_at?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          normalized_address?: string | null
          normalized_name: string
          parking?: string | null
          phone?: string | null
          place_type: string
          postal_code?: string | null
          profile_views?: number | null
          province: string
          region: string
          religion?: string | null
          requires_baptism?: boolean | null
          requires_marriage_course?: boolean | null
          source: string
          source_updated_at?: string | null
          source_url?: string | null
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          subtype?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string
          verified?: boolean | null
          website?: string | null
          website_clicks?: number | null
          wedding_ceremony_available?: boolean | null
        }
        Update: {
          accessibility?: string | null
          address?: string | null
          address_line?: string | null
          capacity?: number | null
          church_type?: string | null
          city?: string
          confidence_score?: number
          contact_clicks?: number | null
          country?: string | null
          country_code?: string
          created_at?: string
          denomination?: string | null
          description?: string | null
          email?: string | null
          external_id?: string | null
          google_place_id?: string | null
          google_rating?: number | null
          google_rating_count?: number | null
          id?: string
          inserted_at?: string | null
          is_featured?: boolean | null
          last_synced_at?: string | null
          last_verified_at?: string | null
          last_view_at?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          normalized_address?: string | null
          normalized_name?: string
          parking?: string | null
          phone?: string | null
          place_type?: string
          postal_code?: string | null
          profile_views?: number | null
          province?: string
          region?: string
          religion?: string | null
          requires_baptism?: boolean | null
          requires_marriage_course?: boolean | null
          source?: string
          source_updated_at?: string | null
          source_url?: string | null
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          subtype?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string
          verified?: boolean | null
          website?: string | null
          website_clicks?: number | null
          wedding_ceremony_available?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "churches_country_code_geo_countries_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "geo_countries"
            referencedColumns: ["code"]
          },
        ]
      }
      event_timeline_translations: {
        Row: {
          description: string | null
          locale: string
          timeline_id: string
          title: string
        }
        Insert: {
          description?: string | null
          locale: string
          timeline_id: string
          title: string
        }
        Update: {
          description?: string | null
          locale?: string
          timeline_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_timeline_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "i18n_locales"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "event_timeline_translations_timeline_id_fkey"
            columns: ["timeline_id"]
            isOneToOne: false
            referencedRelation: "event_timelines"
            referencedColumns: ["id"]
          },
        ]
      }
      event_timelines: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          event_type_id: string | null
          id: string
          is_critical: boolean | null
          key: string
          offset_days: number
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          event_type_id?: string | null
          id?: string
          is_critical?: boolean | null
          key: string
          offset_days: number
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          event_type_id?: string | null
          id?: string
          is_critical?: boolean | null
          key?: string
          offset_days?: number
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_timelines_event_type_id_fkey"
            columns: ["event_type_id"]
            isOneToOne: false
            referencedRelation: "event_types"
            referencedColumns: ["id"]
          },
        ]
      }
      event_type_categories: {
        Row: {
          created_at: string
          event_type_id: string | null
          icon: string | null
          id: string
          name: string
          sort: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_type_id?: string | null
          icon?: string | null
          id?: string
          name: string
          sort?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_type_id?: string | null
          icon?: string | null
          id?: string
          name?: string
          sort?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_type_categories_event_type_id_fkey"
            columns: ["event_type_id"]
            isOneToOne: false
            referencedRelation: "event_types"
            referencedColumns: ["id"]
          },
        ]
      }
      event_type_subcategories: {
        Row: {
          category_id: string | null
          created_at: string
          default_budget: number | null
          id: string
          name: string
          notes: string | null
          sort: number
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          default_budget?: number | null
          id?: string
          name: string
          notes?: string | null
          sort?: number
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          default_budget?: number | null
          id?: string
          name?: string
          notes?: string | null
          sort?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_type_subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "event_type_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      event_type_translations: {
        Row: {
          event_type_id: string
          locale: string
          name: string
        }
        Insert: {
          event_type_id: string
          locale: string
          name: string
        }
        Update: {
          event_type_id?: string
          locale?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_type_translations_event_type_id_fkey"
            columns: ["event_type_id"]
            isOneToOne: false
            referencedRelation: "event_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_type_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "i18n_locales"
            referencedColumns: ["code"]
          },
        ]
      }
      event_type_variants: {
        Row: {
          country_code: string
          event_type_id: string
          overrides: Json
        }
        Insert: {
          country_code: string
          event_type_id: string
          overrides?: Json
        }
        Update: {
          country_code?: string
          event_type_id?: string
          overrides?: Json
        }
        Relationships: [
          {
            foreignKeyName: "event_type_variants_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "geo_countries"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "event_type_variants_event_type_id_fkey"
            columns: ["event_type_id"]
            isOneToOne: false
            referencedRelation: "event_types"
            referencedColumns: ["id"]
          },
        ]
      }
      event_types: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          locale: string
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          locale?: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          locale?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          bride_email: string | null
          bride_initial_budget: number | null
          color_theme: string | null
          country: string | null
          currency: string | null
          default_rsvp_deadline: string | null
          description: string | null
          event_date: string | null
          event_location: string | null
          event_type: string | null
          groom_email: string | null
          groom_initial_budget: number | null
          id: string
          inserted_at: string | null
          language: string | null
          name: string | null
          owner_id: string
          public_id: string | null
          total_budget: number | null
          updated_at: string | null
        }
        Insert: {
          bride_email?: string | null
          bride_initial_budget?: number | null
          color_theme?: string | null
          country?: string | null
          currency?: string | null
          default_rsvp_deadline?: string | null
          description?: string | null
          event_date?: string | null
          event_location?: string | null
          event_type?: string | null
          groom_email?: string | null
          groom_initial_budget?: number | null
          id?: string
          inserted_at?: string | null
          language?: string | null
          name?: string | null
          owner_id?: string
          public_id?: string | null
          total_budget?: number | null
          updated_at?: string | null
        }
        Update: {
          bride_email?: string | null
          bride_initial_budget?: number | null
          color_theme?: string | null
          country?: string | null
          currency?: string | null
          default_rsvp_deadline?: string | null
          description?: string | null
          event_date?: string | null
          event_location?: string | null
          event_type?: string | null
          groom_email?: string | null
          groom_initial_budget?: number | null
          id?: string
          inserted_at?: string | null
          language?: string | null
          name?: string | null
          owner_id?: string
          public_id?: string | null
          total_budget?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number | null
          category: string | null
          description: string | null
          event_id: string
          expense_date: string | null
          from_dashboard: boolean | null
          id: string
          inserted_at: string | null
          payment_installments: Json | null
          saved_supplier_id: string | null
          spend_type: string | null
          status: string | null
          subcategory: string | null
          subcategory_id: string | null
          supplier: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          category?: string | null
          description?: string | null
          event_id: string
          expense_date?: string | null
          from_dashboard?: boolean | null
          id?: string
          inserted_at?: string | null
          payment_installments?: Json | null
          saved_supplier_id?: string | null
          spend_type?: string | null
          status?: string | null
          subcategory?: string | null
          subcategory_id?: string | null
          supplier?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          category?: string | null
          description?: string | null
          event_id?: string
          expense_date?: string | null
          from_dashboard?: boolean | null
          id?: string
          inserted_at?: string | null
          payment_installments?: Json | null
          saved_supplier_id?: string | null
          spend_type?: string | null
          status?: string | null
          subcategory?: string | null
          subcategory_id?: string | null
          supplier?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_saved_supplier_id_fkey"
            columns: ["saved_supplier_id"]
            isOneToOne: false
            referencedRelation: "saved_suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      family_groups: {
        Row: {
          created_at: string | null
          event_id: string
          family_name: string
          id: string
          main_contact_guest_id: string | null
          notes: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          event_id: string
          family_name: string
          id?: string
          main_contact_guest_id?: string | null
          notes?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string
          family_name?: string
          id?: string
          main_contact_guest_id?: string | null
          notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_groups_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_family_main_contact"
            columns: ["main_contact_guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
        ]
      }
      geo_countries: {
        Row: {
          code: string
          default_locale: string | null
        }
        Insert: {
          code: string
          default_locale?: string | null
        }
        Update: {
          code?: string
          default_locale?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "geo_countries_default_locale_fkey"
            columns: ["default_locale"]
            isOneToOne: false
            referencedRelation: "i18n_locales"
            referencedColumns: ["code"]
          },
        ]
      }
      guests: {
        Row: {
          attending: boolean | null
          created_at: string | null
          event_id: string
          exclude_from_family_table: boolean | null
          family_group_id: string | null
          guest_type: string
          id: string
          invitation_date: string | null
          is_main_contact: boolean | null
          menu_preferences: string[] | null
          name: string
          notes: string | null
          receives_bomboniera: boolean | null
          rsvp_deadline: string | null
          rsvp_received: boolean | null
          updated_at: string | null
        }
        Insert: {
          attending?: boolean | null
          created_at?: string | null
          event_id: string
          exclude_from_family_table?: boolean | null
          family_group_id?: string | null
          guest_type: string
          id?: string
          invitation_date?: string | null
          is_main_contact?: boolean | null
          menu_preferences?: string[] | null
          name: string
          notes?: string | null
          receives_bomboniera?: boolean | null
          rsvp_deadline?: string | null
          rsvp_received?: boolean | null
          updated_at?: string | null
        }
        Update: {
          attending?: boolean | null
          created_at?: string | null
          event_id?: string
          exclude_from_family_table?: boolean | null
          family_group_id?: string | null
          guest_type?: string
          id?: string
          invitation_date?: string | null
          is_main_contact?: boolean | null
          menu_preferences?: string[] | null
          name?: string
          notes?: string | null
          receives_bomboniera?: boolean | null
          rsvp_deadline?: string | null
          rsvp_received?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guests_family_group_id_fkey"
            columns: ["family_group_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      i18n_locales: {
        Row: {
          code: string
          direction: string
          name: string
        }
        Insert: {
          code: string
          direction?: string
          name: string
        }
        Update: {
          code?: string
          direction?: string
          name?: string
        }
        Relationships: []
      }
      incomes: {
        Row: {
          amount: number | null
          date: string
          event_id: string
          id: string
          income_source: string | null
          inserted_at: string | null
          name: string
          notes: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          date?: string
          event_id: string
          id?: string
          income_source?: string | null
          inserted_at?: string | null
          name: string
          notes?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          date?: string
          event_id?: string
          id?: string
          income_source?: string | null
          inserted_at?: string | null
          name?: string
          notes?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incomes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          accessibility: boolean | null
          accommodation_available: boolean | null
          address: string | null
          address_line: string | null
          capacity_max: number | null
          capacity_min: number | null
          catering_external_allowed: boolean | null
          catering_internal: boolean | null
          city: string
          confidence_score: number
          contact_clicks: number | null
          country: string | null
          country_code: string
          created_at: string
          currency: string | null
          description: string | null
          email: string | null
          external_id: string | null
          facebook_url: string | null
          google_place_id: string | null
          google_rating: number | null
          google_rating_count: number | null
          id: string
          indoor_space: boolean | null
          inserted_at: string | null
          instagram_url: string | null
          is_featured: boolean | null
          last_synced_at: string | null
          last_verified_at: string | null
          last_view_at: string | null
          latitude: number | null
          location_type: string | null
          longitude: number | null
          name: string
          normalized_address: string | null
          normalized_name: string
          outdoor_space: boolean | null
          parking: boolean | null
          phone: string | null
          postal_code: string | null
          price_range: string | null
          price_range_max: number | null
          price_range_min: number | null
          price_verified_at: string | null
          profile_views: number | null
          province: string
          region: string
          source: string
          source_updated_at: string | null
          source_url: string | null
          subscription_expires_at: string | null
          subscription_tier: string | null
          subtype: string | null
          updated_at: string | null
          user_id: string | null
          venue_type: string
          verification_status: string
          verified: boolean | null
          website: string | null
          website_clicks: number | null
        }
        Insert: {
          accessibility?: boolean | null
          accommodation_available?: boolean | null
          address?: string | null
          address_line?: string | null
          capacity_max?: number | null
          capacity_min?: number | null
          catering_external_allowed?: boolean | null
          catering_internal?: boolean | null
          city: string
          confidence_score?: number
          contact_clicks?: number | null
          country?: string | null
          country_code: string
          created_at?: string
          currency?: string | null
          description?: string | null
          email?: string | null
          external_id?: string | null
          facebook_url?: string | null
          google_place_id?: string | null
          google_rating?: number | null
          google_rating_count?: number | null
          id?: string
          indoor_space?: boolean | null
          inserted_at?: string | null
          instagram_url?: string | null
          is_featured?: boolean | null
          last_synced_at?: string | null
          last_verified_at?: string | null
          last_view_at?: string | null
          latitude?: number | null
          location_type?: string | null
          longitude?: number | null
          name: string
          normalized_address?: string | null
          normalized_name: string
          outdoor_space?: boolean | null
          parking?: boolean | null
          phone?: string | null
          postal_code?: string | null
          price_range?: string | null
          price_range_max?: number | null
          price_range_min?: number | null
          price_verified_at?: string | null
          profile_views?: number | null
          province: string
          region: string
          source: string
          source_updated_at?: string | null
          source_url?: string | null
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          subtype?: string | null
          updated_at?: string | null
          user_id?: string | null
          venue_type: string
          verification_status?: string
          verified?: boolean | null
          website?: string | null
          website_clicks?: number | null
        }
        Update: {
          accessibility?: boolean | null
          accommodation_available?: boolean | null
          address?: string | null
          address_line?: string | null
          capacity_max?: number | null
          capacity_min?: number | null
          catering_external_allowed?: boolean | null
          catering_internal?: boolean | null
          city?: string
          confidence_score?: number
          contact_clicks?: number | null
          country?: string | null
          country_code?: string
          created_at?: string
          currency?: string | null
          description?: string | null
          email?: string | null
          external_id?: string | null
          facebook_url?: string | null
          google_place_id?: string | null
          google_rating?: number | null
          google_rating_count?: number | null
          id?: string
          indoor_space?: boolean | null
          inserted_at?: string | null
          instagram_url?: string | null
          is_featured?: boolean | null
          last_synced_at?: string | null
          last_verified_at?: string | null
          last_view_at?: string | null
          latitude?: number | null
          location_type?: string | null
          longitude?: number | null
          name?: string
          normalized_address?: string | null
          normalized_name?: string
          outdoor_space?: boolean | null
          parking?: boolean | null
          phone?: string | null
          postal_code?: string | null
          price_range?: string | null
          price_range_max?: number | null
          price_range_min?: number | null
          price_verified_at?: string | null
          profile_views?: number | null
          province?: string
          region?: string
          source?: string
          source_updated_at?: string | null
          source_url?: string | null
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          subtype?: string | null
          updated_at?: string | null
          user_id?: string | null
          venue_type?: string
          verification_status?: string
          verified?: boolean | null
          website?: string | null
          website_clicks?: number | null
        }
        Relationships: []
      }
      musica_cerimonia: {
        Row: {
          city: string
          country: string | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          music_type: string | null
          name: string
          phone: string | null
          price_range: string | null
          province: string
          region: string
          status: string | null
          submitted_by: string | null
          updated_at: string | null
          verified: boolean | null
          website: string | null
        }
        Insert: {
          city: string
          country?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          music_type?: string | null
          name: string
          phone?: string | null
          price_range?: string | null
          province: string
          region: string
          status?: string | null
          submitted_by?: string | null
          updated_at?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Update: {
          city?: string
          country?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          music_type?: string | null
          name?: string
          phone?: string | null
          price_range?: string | null
          province?: string
          region?: string
          status?: string | null
          submitted_by?: string | null
          updated_at?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Relationships: []
      }
      musica_ricevimento: {
        Row: {
          city: string
          country: string | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          music_type: string | null
          name: string
          phone: string | null
          price_range: string | null
          province: string
          region: string
          status: string | null
          submitted_by: string | null
          updated_at: string | null
          verified: boolean | null
          website: string | null
        }
        Insert: {
          city: string
          country?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          music_type?: string | null
          name: string
          phone?: string | null
          price_range?: string | null
          province: string
          region: string
          status?: string | null
          submitted_by?: string | null
          updated_at?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Update: {
          city?: string
          country?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          music_type?: string | null
          name?: string
          phone?: string | null
          price_range?: string | null
          province?: string
          region?: string
          status?: string | null
          submitted_by?: string | null
          updated_at?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Relationships: []
      }
      non_invited_recipients: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          name: string
          notes: string | null
          receives_bomboniera: boolean | null
          receives_confetti: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          name: string
          notes?: string | null
          receives_bomboniera?: boolean | null
          receives_confetti?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          name?: string
          notes?: string | null
          receives_bomboniera?: boolean | null
          receives_confetti?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "non_invited_recipients_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_reminders: {
        Row: {
          amount: number
          created_at: string | null
          due_date: string
          expense_id: string
          id: string
          is_paid: boolean | null
          notes: string | null
          paid_date: string | null
          reminder_date: string | null
          reminder_sent: boolean | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          due_date: string
          expense_id: string
          id?: string
          is_paid?: boolean | null
          notes?: string | null
          paid_date?: string | null
          reminder_date?: string | null
          reminder_sent?: boolean | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          due_date?: string
          expense_id?: string
          id?: string
          is_paid?: boolean | null
          notes?: string | null
          paid_date?: string | null
          reminder_date?: string | null
          reminder_sent?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_reminders_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
        ]
      }
      places: {
        Row: {
          address: string | null
          city: string
          country: string | null
          created_at: string | null
          google_place_id: string | null
          id: string
          lat: number
          lng: number
          osm_id: string | null
          postal_code: string | null
          province: string
          region: string
          updated_at: string | null
          wikidata_qid: string | null
        }
        Insert: {
          address?: string | null
          city: string
          country?: string | null
          created_at?: string | null
          google_place_id?: string | null
          id?: string
          lat: number
          lng: number
          osm_id?: string | null
          postal_code?: string | null
          province: string
          region: string
          updated_at?: string | null
          wikidata_qid?: string | null
        }
        Update: {
          address?: string | null
          city?: string
          country?: string | null
          created_at?: string | null
          google_place_id?: string | null
          id?: string
          lat?: number
          lng?: number
          osm_id?: string | null
          postal_code?: string | null
          province?: string
          region?: string
          updated_at?: string | null
          wikidata_qid?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          country_code: string | null
          created_at: string
          full_name: string | null
          id: string
          last_event_type: string | null
          preferred_locale: string | null
          updated_at: string
        }
        Insert: {
          country_code?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          last_event_type?: string | null
          preferred_locale?: string | null
          updated_at?: string
        }
        Update: {
          country_code?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          last_event_type?: string | null
          preferred_locale?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      saved_churches: {
        Row: {
          church_id: string
          contacted: boolean
          created_at: string
          event_id: string
          favorite: boolean
          id: string
          personal_contact_notes: string | null
          personal_notes: string | null
          quoted_price: number | null
          selected: boolean
          status: string
          updated_at: string
        }
        Insert: {
          church_id: string
          contacted?: boolean
          created_at?: string
          event_id: string
          favorite?: boolean
          id?: string
          personal_contact_notes?: string | null
          personal_notes?: string | null
          quoted_price?: number | null
          selected?: boolean
          status?: string
          updated_at?: string
        }
        Update: {
          church_id?: string
          contacted?: boolean
          created_at?: string
          event_id?: string
          favorite?: boolean
          id?: string
          personal_contact_notes?: string | null
          personal_notes?: string | null
          quoted_price?: number | null
          selected?: boolean
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_churches_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_churches_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_locations: {
        Row: {
          agreed_cost: number | null
          contact_notes: string | null
          contacted: boolean
          created_at: string
          event_id: string
          favorite: boolean
          id: string
          location_id: string
          location_role: string
          personal_notes: string | null
          quote_amount: number | null
          quote_currency: string | null
          quote_received_at: string | null
          selected: boolean
          shortlisted: boolean
          status: string
          updated_at: string
          visited: boolean
        }
        Insert: {
          agreed_cost?: number | null
          contact_notes?: string | null
          contacted?: boolean
          created_at?: string
          event_id: string
          favorite?: boolean
          id?: string
          location_id: string
          location_role?: string
          personal_notes?: string | null
          quote_amount?: number | null
          quote_currency?: string | null
          quote_received_at?: string | null
          selected?: boolean
          shortlisted?: boolean
          status?: string
          updated_at?: string
          visited?: boolean
        }
        Update: {
          agreed_cost?: number | null
          contact_notes?: string | null
          contacted?: boolean
          created_at?: string
          event_id?: string
          favorite?: boolean
          id?: string
          location_id?: string
          location_role?: string
          personal_notes?: string | null
          quote_amount?: number | null
          quote_currency?: string | null
          quote_received_at?: string | null
          selected?: boolean
          shortlisted?: boolean
          status?: string
          updated_at?: string
          visited?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "saved_locations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_locations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "high_rated_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_locations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_suppliers: {
        Row: {
          agreed_amount: number | null
          balance_amount: number | null
          contact_notes: string | null
          contract_signed: boolean
          created_at: string
          currency: string | null
          deposit_amount: number | null
          deposit_paid: boolean
          event_id: string
          favorite: boolean
          id: string
          personal_notes: string | null
          quote_amount: number | null
          status: string
          supplier_id: string
          updated_at: string
        }
        Insert: {
          agreed_amount?: number | null
          balance_amount?: number | null
          contact_notes?: string | null
          contract_signed?: boolean
          created_at?: string
          currency?: string | null
          deposit_amount?: number | null
          deposit_paid?: boolean
          event_id: string
          favorite?: boolean
          id?: string
          personal_notes?: string | null
          quote_amount?: number | null
          status?: string
          supplier_id: string
          updated_at?: string
        }
        Update: {
          agreed_amount?: number | null
          balance_amount?: number | null
          contact_notes?: string | null
          contract_signed?: boolean
          created_at?: string
          currency?: string | null
          deposit_amount?: number | null
          deposit_paid?: boolean
          event_id?: string
          favorite?: boolean
          id?: string
          personal_notes?: string | null
          quote_amount?: number | null
          status?: string
          supplier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_suppliers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_suppliers_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      subcategories: {
        Row: {
          category_id: string
          default_budget: number | null
          description: string | null
          display_order: number | null
          estimated_cost: number | null
          id: string
          inserted_at: string | null
          name: string | null
          notes: string | null
          sort: number
          updated_at: string | null
        }
        Insert: {
          category_id: string
          default_budget?: number | null
          description?: string | null
          display_order?: number | null
          estimated_cost?: number | null
          id?: string
          inserted_at?: string | null
          name?: string | null
          notes?: string | null
          sort?: number
          updated_at?: string | null
        }
        Update: {
          category_id?: string
          default_budget?: number | null
          description?: string | null
          display_order?: number | null
          estimated_cost?: number | null
          id?: string
          inserted_at?: string | null
          name?: string | null
          notes?: string | null
          sort?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      subcategory_translations: {
        Row: {
          locale: string
          name: string
          subcategory_id: string
        }
        Insert: {
          locale: string
          name: string
          subcategory_id: string
        }
        Update: {
          locale?: string
          name?: string
          subcategory_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategory_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "i18n_locales"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "subcategory_translations_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_packages: {
        Row: {
          created_at: string | null
          description_it: string | null
          display_order: number | null
          features: Json | null
          id: string
          is_active: boolean | null
          name_it: string
          price_monthly: number
          price_yearly: number
          tier: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description_it?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name_it: string
          price_monthly?: number
          price_yearly?: number
          tier: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description_it?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name_it?: string
          price_monthly?: number
          price_yearly?: number
          tier?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_transactions: {
        Row: {
          amount: number
          billing_period: string | null
          church_id: string | null
          created_at: string | null
          currency: string | null
          expires_at: string | null
          id: string
          location_id: string | null
          payment_id: string | null
          payment_provider: string | null
          starts_at: string | null
          status: string | null
          supplier_id: string | null
          tier: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          billing_period?: string | null
          church_id?: string | null
          created_at?: string | null
          currency?: string | null
          expires_at?: string | null
          id?: string
          location_id?: string | null
          payment_id?: string | null
          payment_provider?: string | null
          starts_at?: string | null
          status?: string | null
          supplier_id?: string | null
          tier: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          billing_period?: string | null
          church_id?: string | null
          created_at?: string | null
          currency?: string | null
          expires_at?: string | null
          id?: string
          location_id?: string | null
          payment_id?: string | null
          payment_provider?: string | null
          starts_at?: string | null
          status?: string | null
          supplier_id?: string | null
          tier?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_transactions_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_transactions_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "high_rated_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_transactions_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_transactions_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_locations: {
        Row: {
          created_at: string
          location_id: string
          relationship_type: string
          source: string
          source_url: string | null
          supplier_id: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          location_id: string
          relationship_type: string
          source: string
          source_url?: string | null
          supplier_id: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          location_id?: string
          relationship_type?: string
          source?: string
          source_url?: string | null
          supplier_id?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_locations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "high_rated_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_locations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_locations_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          address_line: string | null
          category: string | null
          city: string
          confidence_score: number
          contact_clicks: number | null
          country: string | null
          country_code: string
          created_at: string
          currency: string | null
          description: string | null
          email: string | null
          external_id: string | null
          facebook_url: string | null
          google_place_id: string | null
          google_rating: number | null
          google_rating_count: number | null
          id: string
          inserted_at: string | null
          instagram_url: string | null
          is_featured: boolean | null
          last_synced_at: string | null
          last_verified_at: string | null
          last_view_at: string | null
          latitude: number | null
          legal_name: string | null
          longitude: number | null
          name: string
          normalized_name: string
          phone: string | null
          postal_code: string | null
          price_range_max: number | null
          price_range_min: number | null
          profile_views: number | null
          province: string
          region: string
          regions_served: string[] | null
          service_area: string | null
          source: string
          source_updated_at: string | null
          source_url: string | null
          starting_price: number | null
          state: string | null
          subcategory: string | null
          subscription_expires_at: string | null
          subscription_tier: string | null
          tiktok_url: string | null
          travel_available: boolean | null
          updated_at: string | null
          user_id: string | null
          verification_status: string
          verified: boolean | null
          website: string | null
          website_clicks: number | null
        }
        Insert: {
          address?: string | null
          address_line?: string | null
          category?: string | null
          city: string
          confidence_score?: number
          contact_clicks?: number | null
          country?: string | null
          country_code: string
          created_at?: string
          currency?: string | null
          description?: string | null
          email?: string | null
          external_id?: string | null
          facebook_url?: string | null
          google_place_id?: string | null
          google_rating?: number | null
          google_rating_count?: number | null
          id?: string
          inserted_at?: string | null
          instagram_url?: string | null
          is_featured?: boolean | null
          last_synced_at?: string | null
          last_verified_at?: string | null
          last_view_at?: string | null
          latitude?: number | null
          legal_name?: string | null
          longitude?: number | null
          name: string
          normalized_name: string
          phone?: string | null
          postal_code?: string | null
          price_range_max?: number | null
          price_range_min?: number | null
          profile_views?: number | null
          province: string
          region: string
          regions_served?: string[] | null
          service_area?: string | null
          source: string
          source_updated_at?: string | null
          source_url?: string | null
          starting_price?: number | null
          state?: string | null
          subcategory?: string | null
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          tiktok_url?: string | null
          travel_available?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string
          verified?: boolean | null
          website?: string | null
          website_clicks?: number | null
        }
        Update: {
          address?: string | null
          address_line?: string | null
          category?: string | null
          city?: string
          confidence_score?: number
          contact_clicks?: number | null
          country?: string | null
          country_code?: string
          created_at?: string
          currency?: string | null
          description?: string | null
          email?: string | null
          external_id?: string | null
          facebook_url?: string | null
          google_place_id?: string | null
          google_rating?: number | null
          google_rating_count?: number | null
          id?: string
          inserted_at?: string | null
          instagram_url?: string | null
          is_featured?: boolean | null
          last_synced_at?: string | null
          last_verified_at?: string | null
          last_view_at?: string | null
          latitude?: number | null
          legal_name?: string | null
          longitude?: number | null
          name?: string
          normalized_name?: string
          phone?: string | null
          postal_code?: string | null
          price_range_max?: number | null
          price_range_min?: number | null
          profile_views?: number | null
          province?: string
          region?: string
          regions_served?: string[] | null
          service_area?: string | null
          source?: string
          source_updated_at?: string | null
          source_url?: string | null
          starting_price?: number | null
          state?: string | null
          subcategory?: string | null
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          tiktok_url?: string | null
          travel_available?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string
          verified?: boolean | null
          website?: string | null
          website_clicks?: number | null
        }
        Relationships: []
      }
      sync_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          duplicate_candidates: number
          error_message: string | null
          errors_count: number
          id: string
          province: string | null
          records_inserted: number
          records_read: number
          records_skipped: number
          records_updated: number
          region: string | null
          results_count: number | null
          source: string
          started_at: string | null
          status: string
          type: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          duplicate_candidates?: number
          error_message?: string | null
          errors_count?: number
          id?: string
          province?: string | null
          records_inserted?: number
          records_read?: number
          records_skipped?: number
          records_updated?: number
          region?: string | null
          results_count?: number | null
          source: string
          started_at?: string | null
          status: string
          type: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          duplicate_candidates?: number
          error_message?: string | null
          errors_count?: number
          id?: string
          province?: string | null
          records_inserted?: number
          records_read?: number
          records_skipped?: number
          records_updated?: number
          region?: string | null
          results_count?: number | null
          source?: string
          started_at?: string | null
          status?: string
          type?: string
        }
        Relationships: []
      }
      table_assignments: {
        Row: {
          assigned_at: string | null
          guest_id: string
          id: string
          seat_number: number | null
          table_id: string
        }
        Insert: {
          assigned_at?: string | null
          guest_id: string
          id?: string
          seat_number?: number | null
          table_id: string
        }
        Update: {
          assigned_at?: string | null
          guest_id?: string
          id?: string
          seat_number?: number | null
          table_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "table_assignments_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: true
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_assignments_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
        ]
      }
      tables: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          notes: string | null
          table_name: string | null
          table_number: number
          table_type: string
          total_seats: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          notes?: string | null
          table_name?: string | null
          table_number: number
          table_type?: string
          total_seats?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          notes?: string | null
          table_name?: string | null
          table_number?: number
          table_type?: string
          total_seats?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tables_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      timeline_items: {
        Row: {
          category: string | null
          completed: boolean | null
          days_before: number | null
          description: string | null
          display_order: number | null
          due_date: string | null
          event_id: string
          id: string
          inserted_at: string | null
          phase: string | null
          saved_supplier_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          completed?: boolean | null
          days_before?: number | null
          description?: string | null
          display_order?: number | null
          due_date?: string | null
          event_id: string
          id?: string
          inserted_at?: string | null
          phase?: string | null
          saved_supplier_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          completed?: boolean | null
          days_before?: number | null
          description?: string | null
          display_order?: number | null
          due_date?: string | null
          event_id?: string
          id?: string
          inserted_at?: string | null
          phase?: string | null
          saved_supplier_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "timeline_items_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timeline_items_saved_supplier_id_fkey"
            columns: ["saved_supplier_id"]
            isOneToOne: false
            referencedRelation: "saved_suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      traditions: {
        Row: {
          country_code: string
          description: string | null
          id: number
          name: string
        }
        Insert: {
          country_code: string
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          country_code?: string
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      user_event_timeline: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string
          event_id: string | null
          id: string
          is_completed: boolean | null
          timeline_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date: string
          event_id?: string | null
          id?: string
          is_completed?: boolean | null
          timeline_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string
          event_id?: string | null
          id?: string
          is_completed?: boolean | null
          timeline_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_event_timeline_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_event_timeline_timeline_id_fkey"
            columns: ["timeline_id"]
            isOneToOne: false
            referencedRelation: "event_timelines"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_places: {
        Row: {
          created_at: string | null
          is_primary: boolean | null
          place_id: string
          vendor_id: string
        }
        Insert: {
          created_at?: string | null
          is_primary?: boolean | null
          place_id: string
          vendor_id: string
        }
        Update: {
          created_at?: string | null
          is_primary?: boolean | null
          place_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_places_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_places_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_places_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors_with_places"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          last_synced_at: string | null
          metadata: Json | null
          name: string
          phone: string | null
          price_range: string | null
          rating: number | null
          rating_count: number | null
          source: string
          source_id: string | null
          type: string
          updated_at: string | null
          verified: boolean | null
          website: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          last_synced_at?: string | null
          metadata?: Json | null
          name: string
          phone?: string | null
          price_range?: string | null
          rating?: number | null
          rating_count?: number | null
          source: string
          source_id?: string | null
          type: string
          updated_at?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          last_synced_at?: string | null
          metadata?: Json | null
          name?: string
          phone?: string | null
          price_range?: string | null
          rating?: number | null
          rating_count?: number | null
          source?: string
          source_id?: string | null
          type?: string
          updated_at?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Relationships: []
      }
      wedding_cards: {
        Row: {
          account_holder: string | null
          background_image: string | null
          bank_name: string | null
          bride_name: string
          ceremony_time: string | null
          church_address: string | null
          church_id: string | null
          church_name: string | null
          color_scheme: string | null
          custom_message: string | null
          dress_code: string | null
          event_id: string
          font_family: string | null
          groom_name: string
          iban: string | null
          id: string
          inserted_at: string | null
          last_generated_at: string | null
          location_address: string | null
          location_id: string | null
          location_name: string | null
          pdf_url: string | null
          reception_time: string | null
          rsvp_info: string | null
          template_style: string | null
          updated_at: string | null
          wedding_date: string
        }
        Insert: {
          account_holder?: string | null
          background_image?: string | null
          bank_name?: string | null
          bride_name: string
          ceremony_time?: string | null
          church_address?: string | null
          church_id?: string | null
          church_name?: string | null
          color_scheme?: string | null
          custom_message?: string | null
          dress_code?: string | null
          event_id: string
          font_family?: string | null
          groom_name: string
          iban?: string | null
          id?: string
          inserted_at?: string | null
          last_generated_at?: string | null
          location_address?: string | null
          location_id?: string | null
          location_name?: string | null
          pdf_url?: string | null
          reception_time?: string | null
          rsvp_info?: string | null
          template_style?: string | null
          updated_at?: string | null
          wedding_date: string
        }
        Update: {
          account_holder?: string | null
          background_image?: string | null
          bank_name?: string | null
          bride_name?: string
          ceremony_time?: string | null
          church_address?: string | null
          church_id?: string | null
          church_name?: string | null
          color_scheme?: string | null
          custom_message?: string | null
          dress_code?: string | null
          event_id?: string
          font_family?: string | null
          groom_name?: string
          iban?: string | null
          id?: string
          inserted_at?: string | null
          last_generated_at?: string | null
          location_address?: string | null
          location_id?: string | null
          location_name?: string | null
          pdf_url?: string | null
          reception_time?: string | null
          rsvp_info?: string | null
          template_style?: string | null
          updated_at?: string | null
          wedding_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "wedding_cards_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wedding_cards_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wedding_cards_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "high_rated_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wedding_cards_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      wedding_planners: {
        Row: {
          city: string
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          price_range: string | null
          province: string
          region: string
          services: string | null
          status: string | null
          submitted_by: string | null
          updated_at: string | null
          verified: boolean | null
          website: string | null
        }
        Insert: {
          city: string
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          price_range?: string | null
          province: string
          region: string
          services?: string | null
          status?: string | null
          submitted_by?: string | null
          updated_at?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Update: {
          city?: string
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          price_range?: string | null
          province?: string
          region?: string
          services?: string | null
          status?: string | null
          submitted_by?: string | null
          updated_at?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      high_rated_locations: {
        Row: {
          city: string | null
          google_rating: number | null
          google_rating_count: number | null
          id: string | null
          location_type: string | null
          name: string | null
          province: string | null
          region: string | null
          verified: boolean | null
        }
        Insert: {
          city?: string | null
          google_rating?: number | null
          google_rating_count?: number | null
          id?: string | null
          location_type?: string | null
          name?: string | null
          province?: string | null
          region?: string | null
          verified?: boolean | null
        }
        Update: {
          city?: string | null
          google_rating?: number | null
          google_rating_count?: number | null
          id?: string | null
          location_type?: string | null
          name?: string | null
          province?: string | null
          region?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      location_stats_by_region: {
        Row: {
          avg_rating: number | null
          region: string | null
          total_locations: number | null
          total_reviews: number | null
          verified_count: number | null
        }
        Relationships: []
      }
      sync_stats: {
        Row: {
          failed: number | null
          last_sync: string | null
          source: string | null
          successful: number | null
          total_results: number | null
          total_syncs: number | null
          type: string | null
        }
        Relationships: []
      }
      top_vendors_by_region: {
        Row: {
          avg_rating: number | null
          region: string | null
          total_reviews: number | null
          type: string | null
          vendor_count: number | null
        }
        Relationships: []
      }
      vendors_with_places: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          description: string | null
          email: string | null
          google_place_id: string | null
          id: string | null
          last_synced_at: string | null
          lat: number | null
          lng: number | null
          metadata: Json | null
          name: string | null
          osm_id: string | null
          phone: string | null
          postal_code: string | null
          price_range: string | null
          province: string | null
          rating: number | null
          rating_count: number | null
          region: string | null
          source: string | null
          source_id: string | null
          type: string | null
          updated_at: string | null
          verified: boolean | null
          website: string | null
          wikidata_qid: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_table_availability: {
        Args: { p_table_id: string }
        Returns: boolean
      }
      ensure_subcategory: {
        Args: { p_category: string; p_name: string }
        Returns: undefined
      }
      find_or_create_place: {
        Args: {
          p_address: string
          p_city: string
          p_google_place_id: string
          p_lat: number
          p_lng: number
          p_osm_id: string
          p_postal_code?: string
          p_province: string
          p_region: string
          p_wikidata_qid: string
        }
        Returns: string
      }
      get_or_create_category: {
        Args: { p_event: string; p_name: string }
        Returns: string
      }
      get_table_stats: {
        Args: { p_event_id: string }
        Returns: {
          assigned_seats: number
          available_seats: number
          total_seats: number
          total_tables: number
        }[]
      }
      get_visible_suppliers: {
        Args: {
          p_category?: string
          p_is_demo?: boolean
          p_province?: string
          p_region?: string
        }
        Returns: {
          address: string
          category: string
          city: string
          description: string
          email: string
          id: string
          is_featured: boolean
          name: string
          phone: string
          province: string
          region: string
          subscription_tier: string
          verified: boolean
          website: string
        }[]
      }
      increment_analytics_counter: {
        Args: {
          p_counter_type: string
          p_entity_id: string
          p_entity_type: string
        }
        Returns: undefined
      }
      is_subscription_active: {
        Args: { p_expires_at: string; p_subscription_tier: string }
        Returns: boolean
      }
      normalize_catalog_text: { Args: { value: string }; Returns: string }
      normalize_phone: { Args: { phone_input: string }; Returns: string }
      normalize_url: { Args: { url_input: string }; Returns: string }
      regenerate_event_data: { Args: { p_event_id: string }; Returns: string }
      regenerate_event_timeline: {
        Args: { p_event_id: string }
        Returns: string
      }
      search_global_catalog: {
        Args: {
          p_category?: string
          p_city?: string
          p_country?: string
          p_entity_type: string
          p_latitude?: number
          p_limit?: number
          p_longitude?: number
          p_offset?: number
          p_province?: string
          p_query?: string
          p_radius_km?: number
          p_region?: string
          p_sort?: string
          p_verification_status?: string
        }
        Returns: {
          category: string
          city: string
          confidence_score: number
          country: string
          details: Json
          distance_km: number
          entity_type: string
          id: string
          latitude: number
          longitude: number
          name: string
          province: string
          region: string
          relevance_score: number
          total_count: number
          verification_status: string
        }[]
      }
      seed_categories: { Args: { p_event: string }; Returns: undefined }
      seed_full_event: { Args: { p_event: string }; Returns: undefined }
      seed_subcategories: {
        Args: { p_category: string; p_names: string[] }
        Returns: undefined
      }
      upsert_vendor: {
        Args: {
          p_address?: string
          p_city?: string
          p_description?: string
          p_email?: string
          p_google_place_id?: string
          p_lat?: number
          p_lng?: number
          p_metadata?: Json
          p_name: string
          p_osm_id?: string
          p_phone?: string
          p_postal_code?: string
          p_price_range?: string
          p_province?: string
          p_rating?: number
          p_rating_count?: number
          p_region?: string
          p_source: string
          p_source_id: string
          p_type: string
          p_website?: string
          p_wikidata_qid?: string
        }
        Returns: string
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
