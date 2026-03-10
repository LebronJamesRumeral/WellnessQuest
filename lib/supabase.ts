import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for TypeScript
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          username: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          username: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          username?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      characters: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          level: number;
          experience: number;
          health: number;
          max_health: number;
          strength: number;
          endurance: number;
          wisdom: number;
          agility: number;
          gold: number;
          quests_completed: number;
          questions_answered: number;
          current_streak: number;
          longest_streak: number;
          current_combo_streak: number;
          max_combo_streak: number;
          combo_multiplier: number;
          weekly_goal: number | null;
          joined_date: string;
          daily_quest_refresh_date: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      inventory_items: {
        Row: {
          id: string;
          character_id: string;
          item_id: string;
          name: string;
          type: string;
          rarity: string;
          quantity: number;
          description: string;
          stats: any;
          buffs: any;
          created_at: string;
        };
      };
      equipped_items: {
        Row: {
          id: string;
          character_id: string;
          weapon: string | null;
          armor: string | null;
          accessory: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      equipped_customizations: {
        Row: {
          id: string;
          character_id: string;
          armor_color: string | null;
          armor_style: string | null;
          helmet: string | null;
          cloak: string | null;
          aura: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      achievements: {
        Row: {
          id: string;
          character_id: string;
          achievement_id: string;
          name: string;
          description: string;
          icon: string;
          category: string;
          tier: string;
          progress: number | null;
          target: number | null;
          unlocked_date: string | null;
          created_at: string;
        };
      };
      activities: {
        Row: {
          id: string;
          character_id: string;
          title: string;
          type: string;
          description: string;
          distance: number | null;
          duration: number;
          calories: number | null;
          date: string;
          kudos: number;
          session_id: string | null;
          rank: string | null;
          score: number | null;
          stats: any;
          created_at: string;
        };
      };
      activity_comments: {
        Row: {
          id: string;
          activity_id: string;
          user_id: string;
          user_name: string;
          text: string;
          date: string;
          created_at: string;
        };
      };
      game_sessions: {
        Row: {
          id: string;
          character_id: string;
          quest_id: string;
          quest_type: string;
          completion_time: number;
          score: number;
          rank: string;
          accuracy: number | null;
          is_perfect: boolean;
          is_personal_best: boolean;
          date: string;
          rewards: any;
          created_at: string;
        };
      };
      personal_bests: {
        Row: {
          id: string;
          character_id: string;
          quest_type: string;
          best_time: number;
          best_score: number;
          total_clears: number;
          avg_time: number;
          created_at: string;
          updated_at: string;
        };
      };
      challenges: {
        Row: {
          id: string;
          character_id: string;
          challenge_id: string;
          name: string;
          description: string;
          type: string;
          tier: string;
          difficulty: string;
          target: number;
          current: number;
          unit: string;
          start_date: string;
          end_date: string;
          reward: any;
          participants: number;
          completed: boolean;
          claimed: boolean;
          accepted: boolean;
          in_progress: boolean;
          questions_answered: number | null;
          correct_answers: number | null;
          milestones: any | null;
          leaderboard: any | null;
          modifier: string | null;
          combo_bonus: number | null;
          created_at: string;
          updated_at: string;
        };
      };
      assessment_results: {
        Row: {
          id: string;
          character_id: string;
          profile: string;
          scores: any;
          recommended_quests: any;
          completed_date: string;
          created_at: string;
        };
      };
      quests: {
        Row: {
          id: string;
          character_id: string;
          quest_id: string;
          title: string;
          description: string;
          type: string;
          difficulty: string;
          rewards: any;
          requirements: string;
          completed: boolean;
          completed_date: string | null;
          progress: number | null;
          target: number | null;
          created_at: string;
          updated_at: string;
        };
      };
      leaderboard: {
        Row: {
          id: string;
          character_id: string;
          character_name: string;
          quest_type: string;
          score: number;
          rank: string;
          completion_time: number;
          date: string;
          created_at: string;
        };
      };
    };
  };
};
