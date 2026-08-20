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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action: string
          admin_uid: string | null
          created_at: string
          details: Json
          id: string
          target_uid: string | null
        }
        Insert: {
          action: string
          admin_uid?: string | null
          created_at?: string
          details?: Json
          id?: string
          target_uid?: string | null
        }
        Update: {
          action?: string
          admin_uid?: string | null
          created_at?: string
          details?: Json
          id?: string
          target_uid?: string | null
        }
        Relationships: []
      }
      chats: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          language: string | null
          platform: string
          role: string
          text: string
          user_id: string
        }
        Insert: {
          conversation_id?: string
          created_at?: string
          id?: string
          language?: string | null
          platform?: string
          role: string
          text: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          language?: string | null
          platform?: string
          role?: string
          text?: string
          user_id?: string
        }
        Relationships: []
      }
      devices: {
        Row: {
          created_at: string
          device_id: string
          id: string
          last_active: string
          name: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_id: string
          id?: string
          last_active?: string
          name?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_id?: string
          id?: string
          last_active?: string
          name?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_inr: number
          created_at: string
          expires_at: string | null
          id: string
          plan: Database["public"]["Enums"]["plan_tier"]
          provider: string
          provider_payment_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount_inr?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          plan: Database["public"]["Enums"]["plan_tier"]
          provider?: string
          provider_payment_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount_inr?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["plan_tier"]
          provider?: string
          provider_payment_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          daily_limit: number
          id: Database["public"]["Enums"]["plan_tier"]
          languages: string[]
          name: string
          platforms: string[]
          price_inr: number
          sort_order: number
          speed: string
          updated_at: string
        }
        Insert: {
          daily_limit: number
          id: Database["public"]["Enums"]["plan_tier"]
          languages?: string[]
          name: string
          platforms?: string[]
          price_inr?: number
          sort_order?: number
          speed?: string
          updated_at?: string
        }
        Update: {
          daily_limit?: number
          id?: Database["public"]["Enums"]["plan_tier"]
          languages?: string[]
          name?: string
          platforms?: string[]
          price_inr?: number
          sort_order?: number
          speed?: string
          updated_at?: string
        }
        Relationships: []
      }
      platform_connections: {
        Row: {
          config: Json
          created_at: string
          external_id: string | null
          id: string
          platform: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          config?: Json
          created_at?: string
          external_id?: string | null
          id?: string
          platform: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string
          external_id?: string | null
          id?: string
          platform?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      premium_keys: {
        Row: {
          created_at: string
          created_by: string | null
          daily_limit: number
          device_limit: number
          duration_days: number
          expires_at: string | null
          key_hash: string
          label: string | null
          plan: Database["public"]["Enums"]["plan_tier"]
          redeemed_at: string | null
          redeemed_by: string | null
          status: Database["public"]["Enums"]["key_status"]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          daily_limit: number
          device_limit?: number
          duration_days?: number
          expires_at?: string | null
          key_hash: string
          label?: string | null
          plan: Database["public"]["Enums"]["plan_tier"]
          redeemed_at?: string | null
          redeemed_by?: string | null
          status?: Database["public"]["Enums"]["key_status"]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          daily_limit?: number
          device_limit?: number
          duration_days?: number
          expires_at?: string | null
          key_hash?: string
          label?: string | null
          plan?: Database["public"]["Enums"]["plan_tier"]
          redeemed_at?: string | null
          redeemed_by?: string | null
          status?: Database["public"]["Enums"]["key_status"]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bot_enabled: boolean
          business_description: string | null
          business_hours: string | null
          business_name: string | null
          business_prices: string | null
          business_products: string | null
          contact_info: string | null
          created_at: string
          daily_limit: number
          delivery_info: string | null
          device_limit: number
          display_name: string | null
          email: string | null
          expires_at: string | null
          id: string
          instructions: string | null
          language_mode: string
          last_active: string
          photo_url: string | null
          plan: Database["public"]["Enums"]["plan_tier"]
          refund_policy: string | null
          status: string
          tone: string
          updated_at: string
          usage_count: number
          usage_date: string
        }
        Insert: {
          bot_enabled?: boolean
          business_description?: string | null
          business_hours?: string | null
          business_name?: string | null
          business_prices?: string | null
          business_products?: string | null
          contact_info?: string | null
          created_at?: string
          daily_limit?: number
          delivery_info?: string | null
          device_limit?: number
          display_name?: string | null
          email?: string | null
          expires_at?: string | null
          id: string
          instructions?: string | null
          language_mode?: string
          last_active?: string
          photo_url?: string | null
          plan?: Database["public"]["Enums"]["plan_tier"]
          refund_policy?: string | null
          status?: string
          tone?: string
          updated_at?: string
          usage_count?: number
          usage_date?: string
        }
        Update: {
          bot_enabled?: boolean
          business_description?: string | null
          business_hours?: string | null
          business_name?: string | null
          business_prices?: string | null
          business_products?: string | null
          contact_info?: string | null
          created_at?: string
          daily_limit?: number
          delivery_info?: string | null
          device_limit?: number
          display_name?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string
          instructions?: string | null
          language_mode?: string
          last_active?: string
          photo_url?: string | null
          plan?: Database["public"]["Enums"]["plan_tier"]
          refund_policy?: string | null
          status?: string
          tone?: string
          updated_at?: string
          usage_count?: number
          usage_date?: string
        }
        Relationships: []
      }
      usage_events: {
        Row: {
          cached: boolean
          created_at: string
          id: string
          language: string | null
          platform: string
          user_id: string
        }
        Insert: {
          cached?: boolean
          created_at?: string
          id?: string
          language?: string | null
          platform?: string
          user_id: string
        }
        Update: {
          cached?: boolean
          created_at?: string
          id?: string
          language?: string | null
          platform?: string
          user_id?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_create_key: {
        Args: {
          _daily_limit: number
          _device_limit: number
          _duration_days: number
          _key_hash: string
          _label: string
          _plan: Database["public"]["Enums"]["plan_tier"]
          _valid_days: number
        }
        Returns: Json
      }
      admin_log: {
        Args: { _action: string; _details: Json; _target: string }
        Returns: undefined
      }
      admin_revoke_key: { Args: { _key_hash: string }; Returns: Json }
      admin_stats: { Args: never; Returns: Json }
      admin_update_plan: {
        Args: {
          _daily_limit: number
          _languages: string[]
          _plan: Database["public"]["Enums"]["plan_tier"]
          _platforms: string[]
          _price_inr: number
          _speed: string
        }
        Returns: Json
      }
      admin_update_user: {
        Args: {
          _daily_limit?: number
          _device_limit?: number
          _extend_days?: number
          _force_expire?: boolean
          _plan?: Database["public"]["Enums"]["plan_tier"]
          _reset_usage?: boolean
          _status?: string
          _target: string
        }
        Returns: Json
      }
      consume_usage: {
        Args: { _cached?: boolean; _language?: string; _platform?: string }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      redeem_premium_key: { Args: { _key_hash: string }; Returns: Json }
      register_device: {
        Args: { _device_id: string; _name: string }
        Returns: Json
      }
      revoke_device: { Args: { _id: string }; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "user"
      key_status: "active" | "redeemed" | "expired" | "revoked"
      plan_tier: "free" | "low" | "high" | "ultra"
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
      app_role: ["admin", "user"],
      key_status: ["active", "redeemed", "expired", "revoked"],
      plan_tier: ["free", "low", "high", "ultra"],
    },
  },
} as const
