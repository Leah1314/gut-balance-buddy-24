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
      food_logs: {
        Row: {
          analysis_result: Json | null
          created_at: string
          description: string | null
          food_name: string
          id: string
          image_url: string | null
          user_id: string
        }
        Insert: {
          analysis_result?: Json | null
          created_at?: string
          description?: string | null
          food_name: string
          id?: string
          image_url?: string | null
          user_id: string
        }
        Update: {
          analysis_result?: Json | null
          created_at?: string
          description?: string | null
          food_name?: string
          id?: string
          image_url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      stool_logs: {
        Row: {
          bristol_type: number | null
          color: string | null
          consistency: string | null
          created_at: string
          id: string
          image_url: string | null
          notes: string | null
          user_id: string
        }
        Insert: {
          bristol_type?: number | null
          color?: string | null
          consistency?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          notes?: string | null
          user_id: string
        }
        Update: {
          bristol_type?: number | null
          color?: string | null
          consistency?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      test_results: {
        Row: {
          concern_level: string | null
          created_at: string
          file_name: string
          file_type: string
          id: string
          key_findings: string[] | null
          raw_analysis: Json | null
          recommendations: string[] | null
          summary: string | null
          test_type: string | null
          test_values: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          concern_level?: string | null
          created_at?: string
          file_name: string
          file_type: string
          id?: string
          key_findings?: string[] | null
          raw_analysis?: Json | null
          recommendations?: string[] | null
          summary?: string | null
          test_type?: string | null
          test_values?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          concern_level?: string | null
          created_at?: string
          file_name?: string
          file_type?: string
          id?: string
          key_findings?: string[] | null
          raw_analysis?: Json | null
          recommendations?: string[] | null
          summary?: string | null
          test_type?: string | null
          test_values?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_health_profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          created_at: string
          custom_restrictions: string | null
          dietary_restrictions: Json | null
          gender: string | null
          height_cm: number | null
          id: string
          latest_test_results_id: string | null
          medical_conditions: string[] | null
          medications: string[] | null
          recent_tests: Json | null
          symptoms_notes: string | null
          updated_at: string
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          created_at?: string
          custom_restrictions?: string | null
          dietary_restrictions?: Json | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          latest_test_results_id?: string | null
          medical_conditions?: string[] | null
          medications?: string[] | null
          recent_tests?: Json | null
          symptoms_notes?: string | null
          updated_at?: string
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          created_at?: string
          custom_restrictions?: string | null
          dietary_restrictions?: Json | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          latest_test_results_id?: string | null
          medical_conditions?: string[] | null
          medications?: string[] | null
          recent_tests?: Json | null
          symptoms_notes?: string | null
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_health_profiles_latest_test_results_id_fkey"
            columns: ["latest_test_results_id"]
            isOneToOne: false
            referencedRelation: "test_results"
            referencedColumns: ["id"]
          },
        ]
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
