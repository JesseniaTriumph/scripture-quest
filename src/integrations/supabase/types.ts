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
      collections: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          order_index: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          order_index: number
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          order_index?: number
        }
        Relationships: []
      }
      path_nodes: {
        Row: {
          character_appearance: string | null
          collection_id: string | null
          created_at: string | null
          description: string | null
          id: string
          node_type: string
          position: number
          title: string | null
          unlock_requirements: Json | null
          verse_id: string | null
        }
        Insert: {
          character_appearance?: string | null
          collection_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          node_type: string
          position: number
          title?: string | null
          unlock_requirements?: Json | null
          verse_id?: string | null
        }
        Update: {
          character_appearance?: string | null
          collection_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          node_type?: string
          position?: number
          title?: string | null
          unlock_requirements?: Json | null
          verse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "path_nodes_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "path_nodes_verse_id_fkey"
            columns: ["verse_id"]
            isOneToOne: false
            referencedRelation: "verses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_config: Json | null
          coins: number
          created_at: string
          current_path_position: number | null
          display_name: string | null
          goal_type: string | null
          grace_pass_auto_use: boolean | null
          grace_pass_refill_day: string | null
          grace_passes_remaining: number | null
          hearts: number
          hearts_updated_at: string
          id: string
          is_premium: boolean
          last_active_date: string | null
          last_grace_pass_used_at: string | null
          level: number
          path_completed_nodes: string[] | null
          reminder_time: string | null
          streak_count: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          avatar_config?: Json | null
          coins?: number
          created_at?: string
          current_path_position?: number | null
          display_name?: string | null
          goal_type?: string | null
          grace_pass_auto_use?: boolean | null
          grace_pass_refill_day?: string | null
          grace_passes_remaining?: number | null
          hearts?: number
          hearts_updated_at?: string
          id: string
          is_premium?: boolean
          last_active_date?: string | null
          last_grace_pass_used_at?: string | null
          level?: number
          path_completed_nodes?: string[] | null
          reminder_time?: string | null
          streak_count?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          avatar_config?: Json | null
          coins?: number
          created_at?: string
          current_path_position?: number | null
          display_name?: string | null
          goal_type?: string | null
          grace_pass_auto_use?: boolean | null
          grace_pass_refill_day?: string | null
          grace_passes_remaining?: number | null
          hearts?: number
          hearts_updated_at?: string
          id?: string
          is_premium?: boolean
          last_active_date?: string | null
          last_grace_pass_used_at?: string | null
          level?: number
          path_completed_nodes?: string[] | null
          reminder_time?: string | null
          streak_count?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      verse_progress: {
        Row: {
          created_at: string
          id: string
          last_played_at: string
          mastery_level: number
          times_correct: number
          times_wrong: number
          user_id: string
          verse_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_played_at?: string
          mastery_level?: number
          times_correct?: number
          times_wrong?: number
          user_id: string
          verse_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_played_at?: string
          mastery_level?: number
          times_correct?: number
          times_wrong?: number
          user_id?: string
          verse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verse_progress_verse_id_fkey"
            columns: ["verse_id"]
            isOneToOne: false
            referencedRelation: "verses"
            referencedColumns: ["id"]
          },
        ]
      }
      verses: {
        Row: {
          collection_id: string | null
          created_at: string
          difficulty: string
          id: string
          keywords: string[]
          reference: string
          text: string
          translation: string
          xp_reward: number
        }
        Insert: {
          collection_id?: string | null
          created_at?: string
          difficulty: string
          id?: string
          keywords?: string[]
          reference: string
          text: string
          translation?: string
          xp_reward?: number
        }
        Update: {
          collection_id?: string | null
          created_at?: string
          difficulty?: string
          id?: string
          keywords?: string[]
          reference?: string
          text?: string
          translation?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "verses_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_verse_progress: {
        Args: {
          p_coins_earned?: number
          p_correct: boolean
          p_user_id: string
          p_verse_id: string
          p_xp_earned?: number
        }
        Returns: undefined
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
  public: {
    Enums: {},
  },
} as const
