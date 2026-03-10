// User and Authentication Types
export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
  lastLogin: Date;
}

// Character and Progression Types
export interface CharacterStats {
  level: number;
  experience: number;
  health: number;
  maxHealth: number;
  strength: number;
  endurance: number;
  wisdom: number;
  agility: number;
}

// Game Session Performance Tracking
export interface GameSession {
  id: string;
  questId: string;
  questType: QuestType;
  completionTime: number; // seconds
  score: number;
  rank: 'S' | 'A' | 'B' | 'C' | 'D';
  accuracy?: number; // percentage
  isPerfect: boolean;
  isPersonalBest: boolean;
  date: Date;
  rewards?: {
    experience: number;
    gold: number;
    bonus?: string;
  };
}

export interface PersonalBests {
  fitness: {
    bestTime: number;
    bestScore: number;
    totalClears: number;
    avgTime: number;
  };
  mindfulness: {
    bestTime: number;
    bestScore: number;
    totalClears: number;
    avgTime: number;
  };
  nutrition: {
    bestTime: number;
    bestScore: number;
    totalClears: number;
    avgTime: number;
  };
  sleep: {
    bestTime: number;
    bestScore: number;
    totalClears: number;
    avgTime: number;
  };
}

// Equipment Buffs
export interface EquipmentBuffs {
  xpMultiplier: number;
  goldMultiplier: number;
  speedBoost: number; // percentage
  accuracyBoost: number; // percentage
}

export interface Character {
  id: string;
  name: string;
  stats: CharacterStats;
  gold: number;
  inventory: InventoryItem[];
  equippedItems: EquippedItems;
  equippedCustomizations: EquippedCustomizations;
  questsCompleted: number;
  questionsAnswered: number;
  joinedDate: Date;
  achievements: Achievement[];
  activities: Activity[];
  weeklyGoal?: number;
  currentStreak: number;
  longestStreak: number;
  assessmentResult?: AssessmentResult;
  wellnessProfile?: WellnessProfile;
  activeChallenges?: Challenge[];
  gameSessions: GameSession[];
  personalBests: PersonalBests;
  dailyQuestRefreshDate?: Date;
  // Challenge tracking
  currentComboStreak: number; // Consecutive S/A rank clears
  maxComboStreak: number;
  comboMultiplier: number; // XP/Gold multiplier from combo
  activeTierChallenges: Challenge[]; // Currently active challenge tiers
}

// Activity Types (Strava-inspired)
export interface Activity {
  id: string;
  title: string;
  type: QuestType;
  description: string;
  distance?: number;
  duration: number;
  calories?: number;
  date: Date;
  kudos: number;
  comments: Comment[];
  stats: ActivityStats;
  sessionId?: string; // Link to GameSession for detailed performance
  rank?: 'S' | 'A' | 'B' | 'C' | 'D';
  score?: number;
}

export interface ActivityStats {
  heartRate?: number;
  pace?: string;
  elevation?: number;
  performance: 'personal-best' | 'excellent' | 'good' | 'normal';
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  date: Date;
}

// Achievement Types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'distance' | 'streak' | 'quest' | 'level' | 'special';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  unlockedDate?: Date;
  progress?: number;
  target?: number;
}

// Challenge Question Types
export interface ChallengeQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct answer
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Challenge Types
export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: QuestType;
  tier: 'daily' | 'weekly' | 'seasonal' | 'elite';
  difficulty: 'normal' | 'hard' | 'extreme';
  target: number;
  current: number;
  unit: string;
  startDate: Date;
  endDate: Date;
  reward: {
    experience: number;
    gold: number;
    achievement?: string;
    comboBonus?: number; // Bonus for consecutive perfect clears
  };
  participants: number;
  completed: boolean;
  claimed?: boolean; // Rewards have been claimed
  accepted?: boolean; // User must accept before starting
  inProgress?: boolean; // User is currently playing
  questions?: ChallengeQuestion[]; // Questions for this challenge
  questionsAnswered?: number; // Track progress
  correctAnswers?: number; // Track correct answers
  milestones?: {
    progress: number; // e.g., 25%, 50%, 75%
    reward: number; // gold or XP
  }[];
  leaderboard?: {
    playerName: string;
    score: number;
    rank: 'S' | 'A' | 'B' | 'C' | 'D';
    timestamp: Date;
  }[];
  modifier?: 'speed-run' | 'hardcore' | 'no-boost' | 'perfect-only' | 'combo-chain';
  comboBonus?: number;
}

// Quest Types
export type QuestType = 'fitness' | 'nutrition' | 'mindfulness' | 'sleep';

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  rewards: {
    experience: number;
    gold: number;
    item?: string;
  };
  requirements: string;
  completed: boolean;
  completedDate?: Date;
  progress?: number;
  target?: number;
  recommendedFor?: WellnessProfile[];
  questions?: ChallengeQuestion[]; // For question-based quests
}

// Assessment Types
export type WellnessProfile = 'beginner' | 'active' | 'athlete' | 'health-focused' | 'balanced';

export interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'scale' | 'multi-select';
  options: AssessmentOption[];
  category: QuestType;
}

export interface AssessmentOption {
  id: string;
  text: string;
  value: number;
  profile: WellnessProfile[];
}

export interface AssessmentAnswer {
  questionId: string;
  selectedOptions: string[];
  value: number;
}

export interface AssessmentResult {
  profile: WellnessProfile;
  scores: {
    fitness: number;
    nutrition: number;
    mindfulness: number;
    sleep: number;
  };
  recommendedQuests: Quest[];
  completedDate: Date;
}

// Inventory Types
export interface InventoryItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory' | 'consumable' | 'customization';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  stats?: Partial<CharacterStats>;
  buffs?: Partial<EquipmentBuffs>;
  quantity: number;
  description: string;
}

export interface EquippedItems {
  weapon?: string;
  armor?: string;
  accessory?: string;
}

// Customization Types
export interface Customization {
  id: string;
  name: string;
  description: string;
  category: 'armor-color' | 'armor-style' | 'helmet' | 'cloak' | 'aura' | 'other';
  rarity: InventoryItem['rarity'];
  price: number;
  stats?: Partial<CharacterStats>;
  buffs?: Partial<EquipmentBuffs>;
  visual: {
    color?: string;
    icon?: string;
  };
}

export interface EquippedCustomizations {
  armorColor?: string;
  armorStyle?: string;
  helmet?: string;
  cloak?: string;
  aura?: string;
}

// Shop Types
export interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: InventoryItem['type'] | 'customization';
  rarity: InventoryItem['rarity'];
  price: number;
  stats?: Partial<CharacterStats>;
  buffs?: Partial<EquipmentBuffs>;
  customization?: Customization;
}

// Game State
export interface GameState {
  character: Character;
  availableQuests: Quest[];
  activeQuests: Quest[];
  completedQuests: Quest[];
  shopInventory: ShopItem[];
  currentGameQuest?: Quest;
  availableChallenges: Challenge[];
  availableAchievements: Achievement[];
  assessmentQuestions?: AssessmentQuestion[];
}

export interface PlayerProgress {
  totalXP: number;
  questsCompletedAllTime: number;
  averageGoldPerQuest: number;
  currentStreak: number;
  lastActiveDate: Date;
}
