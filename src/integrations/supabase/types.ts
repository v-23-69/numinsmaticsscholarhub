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
      admin_stories: {
        Row: {
          id: string
          created_at: string
          media_url: string
          media_type: "image" | "video"
          caption: string | null
          cta_link: string | null
          cta_text: string | null
          start_time: string | null
          end_time: string | null
          views_count: number | null
          is_active: boolean | null
        }
        Insert: {
          id?: string
          created_at?: string
          media_url: string
          media_type: "image" | "video"
          caption?: string | null
          cta_link?: string | null
          cta_text?: string | null
          start_time?: string | null
          end_time?: string | null
          views_count?: number | null
          is_active?: boolean | null
        }
        Update: {
          id?: string
          created_at?: string
          media_url?: string
          media_type?: "image" | "video"
          caption?: string | null
          cta_link?: string | null
          cta_text?: string | null
          start_time?: string | null
          end_time?: string | null
          views_count?: number | null
          is_active?: boolean | null
        }
        Relationships: []
      }
      home_feed_items: {
        Row: {
          id: string
          created_at: string
          type: "featured_coin" | "expert_promo" | "seasonal_offer" | "educational"
          title: string
          subtitle: string | null
          image_url: string | null
          reference_id: string | null
          priority: number | null
          is_visible: boolean | null
          display_duration_start: string | null
          display_duration_end: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          type: "featured_coin" | "expert_promo" | "seasonal_offer" | "educational"
          title: string
          subtitle?: string | null
          image_url?: string | null
          reference_id?: string | null
          priority?: number | null
          is_visible?: boolean | null
          display_duration_start?: string | null
          display_duration_end?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          type?: "featured_coin" | "expert_promo" | "seasonal_offer" | "educational"
          title?: string
          subtitle?: string | null
          image_url?: string | null
          reference_id?: string | null
          priority?: number | null
          is_visible?: boolean | null
          display_duration_start?: string | null
          display_duration_end?: string | null
        }
        Relationships: []
      }
      featured_coin_configs: {
        Row: {
          id: string
          created_at: string
          coin_id: string
          priority: number | null
          start_date: string | null
          end_date: string | null
          promo_banner_text: string | null
          is_active: boolean | null
        }
        Insert: {
          id?: string
          created_at?: string
          coin_id: string
          priority?: number | null
          start_date?: string | null
          end_date?: string | null
          promo_banner_text?: string | null
          is_active?: boolean | null
        }
        Update: {
          id?: string
          created_at?: string
          coin_id?: string
          priority?: number | null
          start_date?: string | null
          end_date?: string | null
          promo_banner_text?: string | null
          is_active?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "featured_coin_configs_coin_id_fkey"
            columns: ["coin_id"]
            isOneToOne: false
            referencedRelation: "coin_listings"
            referencedColumns: ["id"]
          }
        ]
      }
      nsh_wallet_transactions: {
        Row: {
          id: string
          created_at: string
          user_id: string | null
          amount: number
          transaction_type: "credit" | "debit"
          description: string | null
          reference_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id?: string | null
          amount: number
          transaction_type: "credit" | "debit"
          description?: string | null
          reference_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string | null
          amount?: number
          transaction_type?: "credit" | "debit"
          description?: string | null
          reference_id?: string | null
        }
        Relationships: []
      }
      discounts: {
        Row: {
          id: string
          created_at: string
          code: string
          percentage: number
          start_date: string | null
          end_date: string | null
          min_order_amount: number | null
          applicable_coin_ids: string[] | null
          is_active: boolean | null
        }
        Insert: {
          id?: string
          created_at?: string
          code: string
          percentage: number
          start_date?: string | null
          end_date?: string | null
          min_order_amount?: number | null
          applicable_coin_ids?: string[] | null
          is_active?: boolean | null
        }
        Update: {
          id?: string
          created_at?: string
          code?: string
          percentage?: number
          start_date?: string | null
          end_date?: string | null
          min_order_amount?: number | null
          applicable_coin_ids?: string[] | null
          is_active?: boolean | null
        }
        Relationships: []
      }
      auth_requests: {
        Row: {
          assigned_expert_id: string | null
          authenticity_verdict: string | null
          created_at: string | null
          estimated_value: number | null
          expert_notes: string | null
          id: string
          images: Json
          paid: boolean | null
          paid_amount: number | null
          period_assessment: string | null
          rarity_assessment: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_expert_id?: string | null
          authenticity_verdict?: string | null
          created_at?: string | null
          estimated_value?: number | null
          expert_notes?: string | null
          id?: string
          images?: Json
          paid?: boolean | null
          paid_amount?: number | null
          period_assessment?: string | null
          rarity_assessment?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_expert_id?: string | null
          authenticity_verdict?: string | null
          created_at?: string | null
          estimated_value?: number | null
          expert_notes?: string | null
          id?: string
          images?: Json
          paid?: boolean | null
          paid_amount?: number | null
          period_assessment?: string | null
          rarity_assessment?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          coin_id: string
          created_at: string | null
          id: string
          quantity: number | null
          user_id: string
        }
        Insert: {
          coin_id: string
          created_at?: string | null
          id?: string
          quantity?: number | null
          user_id: string
        }
        Update: {
          coin_id?: string
          created_at?: string | null
          id?: string
          quantity?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_coin_id_fkey"
            columns: ["coin_id"]
            isOneToOne: false
            referencedRelation: "coin_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      coin_categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      coin_images: {
        Row: {
          alt_text: string | null
          coin_id: string
          created_at: string | null
          display_order: number | null
          id: string
          side: string | null
          url: string
        }
        Insert: {
          alt_text?: string | null
          coin_id: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          side?: string | null
          url: string
        }
        Update: {
          alt_text?: string | null
          coin_id?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          side?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "coin_images_coin_id_fkey"
            columns: ["coin_id"]
            isOneToOne: false
            referencedRelation: "coin_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      coin_listings: {
        Row: {
          category_id: string | null
          condition: string | null
          created_at: string | null
          description: string | null
          diameter: number | null
          era: string | null
          id: string
          is_featured: boolean | null
          is_verified: boolean | null
          metal: string | null
          mint: string | null
          price: number
          provenance: Json | null
          seller_id: string
          status: string | null
          stock_count: number | null
          title: string
          updated_at: string | null
          views: number | null
          weight: number | null
          wishlist_count: number | null
          year_estimated: string | null
        }
        Insert: {
          category_id?: string | null
          condition?: string | null
          created_at?: string | null
          description?: string | null
          diameter?: number | null
          era?: string | null
          id?: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          metal?: string | null
          mint?: string | null
          price: number
          provenance?: Json | null
          seller_id: string
          status?: string | null
          stock_count?: number | null
          title: string
          updated_at?: string | null
          views?: number | null
          weight?: number | null
          wishlist_count?: number | null
          year_estimated?: string | null
        }
        Update: {
          category_id?: string | null
          condition?: string | null
          created_at?: string | null
          description?: string | null
          diameter?: number | null
          era?: string | null
          id?: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          metal?: string | null
          mint?: string | null
          price?: number
          provenance?: Json | null
          seller_id?: string
          status?: string | null
          stock_count?: number | null
          title?: string
          updated_at?: string | null
          views?: number | null
          weight?: number | null
          wishlist_count?: number | null
          year_estimated?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coin_listings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "coin_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      coin_tags: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      coin_tags_join: {
        Row: {
          coin_id: string
          tag_id: string
        }
        Insert: {
          coin_id: string
          tag_id: string
        }
        Update: {
          coin_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coin_tags_join_coin_id_fkey"
            columns: ["coin_id"]
            isOneToOne: false
            referencedRelation: "coin_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coin_tags_join_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "coin_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_items: {
        Row: {
          coin_id: string
          collection_id: string
          created_at: string | null
          id: string
        }
        Insert: {
          coin_id: string
          collection_id: string
          created_at?: string | null
          id?: string
        }
        Update: {
          coin_id?: string
          collection_id?: string
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_items_coin_id_fkey"
            columns: ["coin_id"]
            isOneToOne: false
            referencedRelation: "coin_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          cover_image: string | null
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          user_id: string
        }
        Insert: {
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          user_id: string
        }
        Update: {
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachments: Json | null
          content: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          sender_id: string
          thread_id: string
        }
        Insert: {
          attachments?: Json | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id: string
          thread_id: string
        }
        Update: {
          attachments?: Json | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "threads"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string | null
          payload: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          payload?: Json | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          payload?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          coin_id: string
          created_at: string | null
          id: string
          order_id: string
          price_at_purchase: number
          quantity: number | null
          seller_id: string
        }
        Insert: {
          coin_id: string
          created_at?: string | null
          id?: string
          order_id: string
          price_at_purchase: number
          quantity?: number | null
          seller_id: string
        }
        Update: {
          coin_id?: string
          created_at?: string | null
          id?: string
          order_id?: string
          price_at_purchase?: number
          quantity?: number | null
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_coin_id_fkey"
            columns: ["coin_id"]
            isOneToOne: false
            referencedRelation: "coin_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          agent_fee: number | null
          created_at: string | null
          escrow_status: string | null
          id: string
          notes: string | null
          platform_fee: number | null
          requires_escrow: boolean | null
          shipping_address_id: string | null
          status: string | null
          subtotal: number
          total_amount: number
          tracking_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agent_fee?: number | null
          created_at?: string | null
          escrow_status?: string | null
          id?: string
          notes?: string | null
          platform_fee?: number | null
          requires_escrow?: boolean | null
          shipping_address_id?: string | null
          status?: string | null
          subtotal: number
          total_amount: number
          tracking_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agent_fee?: number | null
          created_at?: string | null
          escrow_status?: string | null
          id?: string
          notes?: string | null
          platform_fee?: number | null
          requires_escrow?: boolean | null
          shipping_address_id?: string | null
          status?: string | null
          subtotal?: number
          total_amount?: number
          tracking_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_shipping_address_id_fkey"
            columns: ["shipping_address_id"]
            isOneToOne: false
            referencedRelation: "shipping_addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          coin_id: string | null
          comment_count: number | null
          content: string | null
          created_at: string | null
          id: string
          images: Json | null
          is_pinned: boolean | null
          like_count: number | null
          share_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          coin_id?: string | null
          comment_count?: number | null
          content?: string | null
          created_at?: string | null
          id?: string
          images?: Json | null
          is_pinned?: boolean | null
          like_count?: number | null
          share_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          coin_id?: string | null
          comment_count?: number | null
          content?: string | null
          created_at?: string | null
          id?: string
          images?: Json | null
          is_pinned?: boolean | null
          like_count?: number | null
          share_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_coin_id_fkey"
            columns: ["coin_id"]
            isOneToOne: false
            referencedRelation: "coin_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          auth_images_used: number | null
          avatar_url: string | null
          badges: Json | null
          bio: string | null
          role: "user" | "expert" | "admin" // Added role
          created_at: string | null
          display_name: string | null
          follower_count: number | null
          following_count: number | null
          gst_number: string | null
          id: string
          is_verified: boolean | null
          kyc_status: string | null
          pan_number: string | null
          phone: string | null
          post_count: number | null
          trust_score: number | null
          updated_at: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          auth_images_used?: number | null
          avatar_url?: string | null
          badges?: Json | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          follower_count?: number | null
          following_count?: number | null
          gst_number?: string | null
          id?: string
          is_verified?: boolean | null
          kyc_status?: string | null
          pan_number?: string | null
          phone?: string | null
          post_count?: number | null
          trust_score?: number | null
          updated_at?: string | null
          user_id: string
          username?: string | null
        }
        Update: {
          auth_images_used?: number | null
          avatar_url?: string | null
          badges?: Json | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          follower_count?: number | null
          following_count?: number | null
          gst_number?: string | null
          id?: string
          is_verified?: boolean | null
          kyc_status?: string | null
          pan_number?: string | null
          phone?: string | null
          post_count?: number | null
          trust_score?: number | null
          updated_at?: string | null
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          coin_id: string | null
          comment: string | null
          created_at: string | null
          id: string
          rating: number
          seller_id: string | null
          user_id: string
        }
        Insert: {
          coin_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          rating: number
          seller_id?: string | null
          user_id: string
        }
        Update: {
          coin_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          seller_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_coin_id_fkey"
            columns: ["coin_id"]
            isOneToOne: false
            referencedRelation: "coin_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          country: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string
          phone: string
          postal_code: string
          state: string
          user_id: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          country?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          phone: string
          postal_code: string
          state: string
          user_id: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          country?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          phone?: string
          postal_code?: string
          state?: string
          user_id?: string
        }
        Relationships: []
      }
      stories: {
        Row: {
          caption: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_live: boolean | null
          media_type: string | null
          media_url: string
          user_id: string
          view_count: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_live?: boolean | null
          media_type?: string | null
          media_url: string
          user_id: string
          view_count?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_live?: boolean | null
          media_type?: string | null
          media_url?: string
          user_id?: string
          view_count?: number | null
        }
        Relationships: []
      }
      story_views: {
        Row: {
          id: string
          story_id: string
          viewed_at: string | null
          viewer_id: string
        }
        Insert: {
          id?: string
          story_id: string
          viewed_at?: string | null
          viewer_id: string
        }
        Update: {
          id?: string
          story_id?: string
          viewed_at?: string | null
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_views_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      threads: {
        Row: {
          auth_request_id: string | null
          created_at: string | null
          id: string
          last_message_at: string | null
          participant_ids: string[]
          type: string | null
        }
        Insert: {
          auth_request_id?: string | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          participant_ids: string[]
          type?: string | null
        }
        Update: {
          auth_request_id?: string | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          participant_ids?: string[]
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "threads_auth_request_id_fkey"
            columns: ["auth_request_id"]
            isOneToOne: false
            referencedRelation: "auth_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          auth_request_id: string | null
          created_at: string | null
          id: string
          order_id: string | null
          provider: string | null
          provider_id: string | null
          status: string | null
          type: string
          user_id: string
          webinar_id: string | null
        }
        Insert: {
          amount: number
          auth_request_id?: string | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          provider?: string | null
          provider_id?: string | null
          status?: string | null
          type: string
          user_id: string
          webinar_id?: string | null
        }
        Update: {
          amount?: number
          auth_request_id?: string | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          provider?: string | null
          provider_id?: string | null
          status?: string | null
          type?: string
          user_id?: string
          webinar_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_auth_request_id_fkey"
            columns: ["auth_request_id"]
            isOneToOne: false
            referencedRelation: "auth_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_webinar_id_fkey"
            columns: ["webinar_id"]
            isOneToOne: false
            referencedRelation: "webinars"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webinar_enrollments: {
        Row: {
          created_at: string | null
          id: string
          paid: boolean | null
          user_id: string
          webinar_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          paid?: boolean | null
          user_id: string
          webinar_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          paid?: boolean | null
          user_id?: string
          webinar_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webinar_enrollments_webinar_id_fkey"
            columns: ["webinar_id"]
            isOneToOne: false
            referencedRelation: "webinars"
            referencedColumns: ["id"]
          },
        ]
      }
      webinars: {
        Row: {
          created_at: string | null
          date: string
          description: string | null
          enrolled_count: number | null
          host_id: string | null
          id: string
          is_live: boolean | null
          price: number | null
          replay_url: string | null
          seats: number | null
          thumbnail_url: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          date: string
          description?: string | null
          enrolled_count?: number | null
          host_id?: string | null
          id?: string
          is_live?: boolean | null
          price?: number | null
          replay_url?: string | null
          seats?: number | null
          thumbnail_url?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string | null
          enrolled_count?: number | null
          host_id?: string | null
          id?: string
          is_live?: boolean | null
          price?: number | null
          replay_url?: string | null
          seats?: number | null
          thumbnail_url?: string | null
          title?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          coin_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          coin_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          coin_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_coin_id_fkey"
            columns: ["coin_id"]
            isOneToOne: false
            referencedRelation: "coin_listings"
            referencedColumns: ["id"]
          },
        ]
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
      app_role: "buyer" | "seller" | "expert" | "admin_market" | "master_admin"
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
      app_role: ["buyer", "seller", "expert", "admin_market", "master_admin"],
    },
  },
} as const
