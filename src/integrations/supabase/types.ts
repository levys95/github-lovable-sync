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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cpu_catalog: {
        Row: {
          base_clock_ghz: number | null
          boost_clock_ghz: number | null
          brand: Database["public"]["Enums"]["cpu_brand"]
          cores: number | null
          created_at: string
          family: string
          generation: string
          id: string
          model: string
          release_date: string | null
          socket: string | null
          tdp_watts: number | null
          threads: number | null
          updated_at: string
        }
        Insert: {
          base_clock_ghz?: number | null
          boost_clock_ghz?: number | null
          brand: Database["public"]["Enums"]["cpu_brand"]
          cores?: number | null
          created_at?: string
          family: string
          generation: string
          id?: string
          model: string
          release_date?: string | null
          socket?: string | null
          tdp_watts?: number | null
          threads?: number | null
          updated_at?: string
        }
        Update: {
          base_clock_ghz?: number | null
          boost_clock_ghz?: number | null
          brand?: Database["public"]["Enums"]["cpu_brand"]
          cores?: number | null
          created_at?: string
          family?: string
          generation?: string
          id?: string
          model?: string
          release_date?: string | null
          socket?: string | null
          tdp_watts?: number | null
          threads?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      cpu_inventory: {
        Row: {
          base_clock_ghz: number | null
          brand: Database["public"]["Enums"]["cpu_brand"]
          catalog_id: string | null
          created_at: string
          family: string
          files: Json
          generation: string
          id: string
          images: Json
          location: string | null
          model: string
          notes: string | null
          quantity: number
          updated_at: string
          user_id: string
          videos: Json
        }
        Insert: {
          base_clock_ghz?: number | null
          brand: Database["public"]["Enums"]["cpu_brand"]
          catalog_id?: string | null
          created_at?: string
          family: string
          files?: Json
          generation: string
          id?: string
          images?: Json
          location?: string | null
          model: string
          notes?: string | null
          quantity?: number
          updated_at?: string
          user_id: string
          videos?: Json
        }
        Update: {
          base_clock_ghz?: number | null
          brand?: Database["public"]["Enums"]["cpu_brand"]
          catalog_id?: string | null
          created_at?: string
          family?: string
          files?: Json
          generation?: string
          id?: string
          images?: Json
          location?: string | null
          model?: string
          notes?: string | null
          quantity?: number
          updated_at?: string
          user_id?: string
          videos?: Json
        }
        Relationships: [
          {
            foreignKeyName: "cpu_inventory_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "cpu_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          big_bag_weight: number | null
          brand: string | null
          category: string
          condition: string
          created_at: string
          date_added: string
          description: string | null
          id: string
          images: Json
          location: string
          name: string
          pallet_weight: number | null
          quantity: number
          shipment_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          big_bag_weight?: number | null
          brand?: string | null
          category: string
          condition?: string
          created_at?: string
          date_added?: string
          description?: string | null
          id?: string
          images?: Json
          location: string
          name: string
          pallet_weight?: number | null
          quantity?: number
          shipment_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          big_bag_weight?: number | null
          brand?: string | null
          category?: string
          condition?: string
          created_at?: string
          date_added?: string
          description?: string | null
          id?: string
          images?: Json
          location?: string
          name?: string
          pallet_weight?: number | null
          quantity?: number
          shipment_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ram_modules: {
        Row: {
          capacity_gb: number
          created_at: string
          files: Json
          frequency_mhz: number
          generation: Database["public"]["Enums"]["ram_generation"]
          id: string
          images: Json
          location: string | null
          manufacturer: Database["public"]["Enums"]["ram_manufacturer"]
          notes: string | null
          quantity: number
          updated_at: string
          user_id: string
          videos: Json
        }
        Insert: {
          capacity_gb: number
          created_at?: string
          files?: Json
          frequency_mhz: number
          generation: Database["public"]["Enums"]["ram_generation"]
          id?: string
          images?: Json
          location?: string | null
          manufacturer: Database["public"]["Enums"]["ram_manufacturer"]
          notes?: string | null
          quantity?: number
          updated_at?: string
          user_id: string
          videos?: Json
        }
        Update: {
          capacity_gb?: number
          created_at?: string
          files?: Json
          frequency_mhz?: number
          generation?: Database["public"]["Enums"]["ram_generation"]
          id?: string
          images?: Json
          location?: string | null
          manufacturer?: Database["public"]["Enums"]["ram_manufacturer"]
          notes?: string | null
          quantity?: number
          updated_at?: string
          user_id?: string
          videos?: Json
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
      cpu_brand: "INTEL" | "AMD"
      ram_generation: "DDR5" | "DDR4" | "DDR3" | "DDR3L"
      ram_manufacturer: "SAMSUNG" | "HYNIX" | "MICRON" | "KINGSTON"
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
      cpu_brand: ["INTEL", "AMD"],
      ram_generation: ["DDR5", "DDR4", "DDR3", "DDR3L"],
      ram_manufacturer: ["SAMSUNG", "HYNIX", "MICRON", "KINGSTON"],
    },
  },
} as const
