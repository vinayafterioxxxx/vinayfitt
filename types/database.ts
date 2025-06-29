export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: 'client' | 'trainer' | 'nutritionist' | 'admin' | 'hr';
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: 'client' | 'trainer' | 'nutritionist' | 'admin' | 'hr';
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: 'client' | 'trainer' | 'nutritionist' | 'admin' | 'hr';
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      workout_templates: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: string;
          duration: number;
          exercises: any;
          created_by: string;
          created_at: string;
          updated_at: string;
          is_public: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category: string;
          duration: number;
          exercises: any;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          is_public?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          category?: string;
          duration?: number;
          exercises?: any;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
          is_public?: boolean;
        };
      };
      workout_plans: {
        Row: {
          id: string;
          client_id: string;
          trainer_id: string;
          name: string;
          start_date: string;
          end_date: string;
          schedule: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          trainer_id: string;
          name: string;
          start_date: string;
          end_date: string;
          schedule: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          trainer_id?: string;
          name?: string;
          start_date?: string;
          end_date?: string;
          schedule?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      workout_sessions: {
        Row: {
          id: string;
          client_id: string;
          template_id: string;
          plan_id: string | null;
          date: string;
          start_time: string | null;
          end_time: string | null;
          exercises: any;
          notes: string | null;
          completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          template_id: string;
          plan_id?: string | null;
          date: string;
          start_time?: string | null;
          end_time?: string | null;
          exercises: any;
          notes?: string | null;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          template_id?: string;
          plan_id?: string | null;
          date?: string;
          start_time?: string | null;
          end_time?: string | null;
          exercises?: any;
          notes?: string | null;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      exercises: {
        Row: {
          id: string;
          name: string;
          category: string;
          muscle_groups: string[];
          instructions: string | null;
          equipment: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          muscle_groups: string[];
          instructions?: string | null;
          equipment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          muscle_groups?: string[];
          instructions?: string | null;
          equipment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      metrics: {
        Row: {
          id: string;
          user_id: string;
          metric_type: string;
          value: number;
          unit: string;
          date: string;
          time: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          metric_type: string;
          value: number;
          unit: string;
          date: string;
          time: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          metric_type?: string;
          value?: number;
          unit?: string;
          date?: string;
          time?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'client' | 'trainer' | 'nutritionist' | 'admin' | 'hr';
    };
  };
}