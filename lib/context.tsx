'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { 
  Character, 
  Quest, 
  ShopItem, 
  InventoryItem, 
  GameState, 
  AssessmentAnswer, 
  AssessmentResult, 
  WellnessProfile,
  Activity,
  Challenge,
  Achievement,
  GameSession,
  EquipmentBuffs,
  QuestType,
  User
} from './types';
import { assessmentQuestions, sampleChallenges, gameTierChallenges, allAchievements, enhancedQuests, questionBasedQuests, createPersonalizedStartingItem } from './gameData';
import { applyExperienceGain } from './progression';
import { supabase } from './supabase';
import { 
  authApi, 
  characterApi, 
  inventoryApi, 
  achievementsApi, 
  activitiesApi, 
  gameSessionsApi,
  challengesApi,
  assessmentApi,
  questsApi,
  leaderboardApi
} from './api';

interface GameContextType {
  // Authentication
  user: User | null;
  isLoggedIn: boolean;
  isAuthLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  // Game
  character: Character | null;
  gameState: GameState | null;
  createCharacter: (name: string, primaryWellnessStat?: 'fitness' | 'nutrition' | 'mindfulness' | 'sleep') => void;
  completeQuest: (questId: string, sessionData?: GameSession) => void;
  acceptQuest: (questId: string) => void;
  startGame: (questId: string) => void;
  finishGame: (questId: string, sessionData: GameSession) => void;
  cancelGame: () => void;
  addGold: (amount: number) => void;
  addExperience: (amount: number) => void;
  buyItem: (shopItemId: string) => void;
  equipItem: (itemId: string, slot: 'weapon' | 'armor' | 'accessory') => void;
  unequipItem: (slot: 'weapon' | 'armor' | 'accessory') => void;
  equipCustomization: (customizationId: string, category: keyof import('./types').EquippedCustomizations) => void;
  unequipCustomization: (category: keyof import('./types').EquippedCustomizations) => void;
  useConsumable: (itemId: string) => void;
  completeAssessment: (answers: AssessmentAnswer[]) => Promise<void>;
  giveKudos: (activityId: string) => void;
  joinChallenge: (challengeId: string) => void;
  acceptChallenge: (challengeId: string) => void;
  startChallenge: (challengeId: string) => void;
  completeChallenge: (challengeId: string, correctAnswers: number, totalQuestions: number) => void;
  claimTierChallengeReward: (challengeId: string) => void;
  getEquipmentBuffs: (questType?: QuestType) => EquipmentBuffs;
  calculateRank: (score: number, type: QuestType) => 'S' | 'A' | 'B' | 'C' | 'D';
  saveGame: () => void;
  loadGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Initial character factory
const createDefaultCharacter = (name: string): Character => ({
  id: Math.random().toString(36).substr(2, 9),
  name,
  stats: {
    level: 1,
    experience: 0,
    health: 100,
    maxHealth: 100,
    strength: 10,
    endurance: 10,
    wisdom: 10,
    agility: 10,
  },
  gold: 50,
  inventory: [],
  equippedItems: {},
  equippedCustomizations: {},
  questsCompleted: 0,
  questionsAnswered: 0,
  joinedDate: new Date(),
  gameSessions: [],
  personalBests: {
    fitness: { bestTime: Infinity, bestScore: 0, totalClears: 0, avgTime: 0 },
    mindfulness: { bestTime: Infinity, bestScore: 0, totalClears: 0, avgTime: 0 },
    nutrition: { bestTime: Infinity, bestScore: 0, totalClears: 0, avgTime: 0 },
    sleep: { bestTime: Infinity, bestScore: 0, totalClears: 0, avgTime: 0 },
  },
  dailyQuestRefreshDate: new Date(),
  currentComboStreak: 0,
  maxComboStreak: 0,
  comboMultiplier: 1.0,
  activeTierChallenges: [],
  achievements: [],
  activities: [],
  weeklyGoal: 5,
  currentStreak: 0,
  longestStreak: 0,
});

// Sample quests
const createSampleQuests = (): Quest[] => [
  {
    id: 'quest-1',
    title: 'Morning Run',
    description: 'Complete a 3km morning run to start your day with energy',
    type: 'fitness',
    difficulty: 'easy',
    rewards: { experience: 50, gold: 25 },
    requirements: '3km running distance',
    completed: false,
  },
  {
    id: 'quest-2',
    title: 'Meditation Session',
    description: 'Spend 20 minutes in guided meditation',
    type: 'mindfulness',
    difficulty: 'easy',
    rewards: { experience: 40, gold: 20 },
    requirements: '20 minutes of meditation',
    completed: false,
  },
  {
    id: 'quest-3',
    title: 'Healthy Meal Plan',
    description: 'Prepare 3 balanced meals with vegetables',
    type: 'nutrition',
    difficulty: 'medium',
    rewards: { experience: 75, gold: 40 },
    requirements: '3 meals with at least 3 vegetables each',
    completed: false,
  },
  {
    id: 'quest-4',
    title: 'Sleep Quest',
    description: 'Get 8 hours of quality sleep',
    type: 'sleep',
    difficulty: 'medium',
    rewards: { experience: 60, gold: 35 },
    requirements: '8 hours of sleep',
    completed: false,
  },
  {
    id: 'quest-5',
    title: 'Strength Training',
    description: 'Complete a full body workout session',
    type: 'fitness',
    difficulty: 'hard',
    rewards: { experience: 100, gold: 60 },
    requirements: 'Full body strength training',
    completed: false,
  },
];

// Sample shop items
const createSampleShop = (): ShopItem[] => [
  {
    id: 'item-1',
    name: 'Iron Dumbbell',
    description: 'Training weapon • Increases Strength +2 • Perfect for Physical Activities',
    type: 'weapon',
    rarity: 'common',
    price: 25,
    stats: { strength: 2 },
  },
  {
    id: 'item-2',
    name: 'Leather Gym Wear',
    description: 'Protective Gear • Increases Endurance +3 • Boosts Fitness Activity Stamina',
    type: 'armor',
    rarity: 'uncommon',
    price: 50,
    stats: { endurance: 3 },
  },
  {
    id: 'item-3',
    name: 'Health Potion',
    description: 'Restores 50 health points',
    type: 'consumable',
    rarity: 'common',
    price: 15,
  },
  {
    id: 'item-4',
    name: 'Headband of Focus',
    description: 'Increases wisdom by 5',
    type: 'accessory',
    rarity: 'rare',
    price: 100,
    stats: { wisdom: 5 },
  },
  {
    id: 'item-5',
    name: 'Titan Kettlebell',
    description: 'Heavy training weapon that boosts strength and endurance for intense sessions',
    type: 'weapon',
    rarity: 'uncommon',
    price: 85,
    stats: { strength: 4, endurance: 1 },
  },
  {
    id: 'item-6',
    name: 'Ranger Training Vest',
    description: 'Flexible armor designed for balanced workouts and daily mobility',
    type: 'armor',
    rarity: 'rare',
    price: 120,
    stats: { endurance: 3, agility: 2 },
  },
  {
    id: 'item-7',
    name: 'Mindful Charm',
    description: 'A calming accessory that improves wisdom and focus during mental quests',
    type: 'accessory',
    rarity: 'uncommon',
    price: 95,
    stats: { wisdom: 3 },
  },
  {
    id: 'item-8',
    name: 'Stamina Elixir',
    description: 'A restorative tonic for long adventure days and training sessions',
    type: 'consumable',
    rarity: 'uncommon',
    price: 30,
  },
  {
    id: 'item-9',
    name: 'Focus Tonic',
    description: 'A sharpness potion for question quests and concentration challenges',
    type: 'consumable',
    rarity: 'rare',
    price: 45,
  },
  // Gameplay Buff Items
  {
    id: 'item-boost-1',
    name: 'XP Amplifier Ring',
    description: 'Mystical Accessory • Grants +20% XP on ALL quests • Accelerates level progression',
    type: 'accessory',
    rarity: 'rare',
    price: 150,
    buffs: { xpMultiplier: 1.2, goldMultiplier: 1, speedBoost: 0, accuracyBoost: 0 },
  },
  {
    id: 'item-boost-2',
    name: 'Fortune Coin',
    description: 'Golden Treasure • Gives +30% Gold from ALL quests • Wealth accumulation boost',
    type: 'accessory',
    rarity: 'rare',
    price: 180,
    buffs: { xpMultiplier: 1, goldMultiplier: 1.3, speedBoost: 0, accuracyBoost: 0 },
  },
  {
    id: 'item-boost-3',
    name: 'Swift Boots',
    description: 'Legendary Footwear • Grants +15% Speed in all mini-games • Agility +3 • Complete challenges faster',
    type: 'armor',
    rarity: 'epic',
    price: 220,
    stats: { agility: 3 },
    buffs: { xpMultiplier: 1, goldMultiplier: 1, speedBoost: 15, accuracyBoost: 0 },
  },
  {
    id: 'item-boost-4',
    name: 'Precision Gloves',
    description: 'Epic Combat Gear • Gives +20% Accuracy in mini-games • Perfect for Question Quests • Agility +2',
    type: 'weapon',
    rarity: 'epic',
    price: 250,
    stats: { agility: 2 },
    buffs: { xpMultiplier: 1, goldMultiplier: 1, speedBoost: 0, accuracyBoost: 20 },
  },
  {
    id: 'item-boost-5',
    name: 'Champion\'s Amulet',
    description: 'Legendary Artifact • Grants +50% XP & +50% Gold on ALL quests • Ultimate progression tool • Strength +3, Wisdom +3',
    type: 'accessory',
    rarity: 'legendary',
    price: 500,
    stats: { strength: 3, wisdom: 3 },
    buffs: { xpMultiplier: 1.5, goldMultiplier: 1.5, speedBoost: 0, accuracyBoost: 0 },
  },
  {
    id: 'item-boost-6',
    name: 'Stormrunner Greaves',
    description: 'Advanced armor that dramatically improves movement speed in mini-games',
    type: 'armor',
    rarity: 'epic',
    price: 320,
    stats: { agility: 4, endurance: 2 },
    buffs: { xpMultiplier: 1, goldMultiplier: 1, speedBoost: 25, accuracyBoost: 0 },
  },
  {
    id: 'item-boost-7',
    name: 'Sage Lens',
    description: 'Mystic accessory that boosts accuracy and grants a modest XP increase',
    type: 'accessory',
    rarity: 'epic',
    price: 340,
    stats: { wisdom: 4 },
    buffs: { xpMultiplier: 1.1, goldMultiplier: 1, speedBoost: 0, accuracyBoost: 30 },
  },
  {
    id: 'item-boost-8',
    name: 'Guild Banner Sigil',
    description: 'Rare emblem that improves both XP and gold gains for efficient progression',
    type: 'accessory',
    rarity: 'legendary',
    price: 620,
    stats: { endurance: 2, wisdom: 2 },
    buffs: { xpMultiplier: 1.35, goldMultiplier: 1.35, speedBoost: 0, accuracyBoost: 10 },
  },
  // Customizations
  {
    id: 'custom-1',
    name: 'Azure Armor Set',
    description: 'A sleek blue armor that increases endurance',
    type: 'customization',
    rarity: 'uncommon',
    price: 75,
    stats: { endurance: 2 },
    customization: {
      id: 'custom-1',
      name: 'Azure Armor Set',
      description: 'A sleek blue armor that increases endurance',
      category: 'armor-style',
      rarity: 'uncommon',
      price: 75,
      stats: { endurance: 2 },
      visual: { color: '#0ea5e9' },
    },
  },
  {
    id: 'custom-2',
    name: 'Crimson Cloak',
    description: 'A flowing red cloak that boosts strength and agility',
    type: 'customization',
    rarity: 'rare',
    price: 120,
    stats: { strength: 1, agility: 3 },
    customization: {
      id: 'custom-2',
      name: 'Crimson Cloak',
      description: 'A flowing red cloak that boosts strength and agility',
      category: 'cloak',
      rarity: 'rare',
      price: 120,
      stats: { strength: 1, agility: 3 },
      visual: { color: '#ef4444' },
    },
  },
  {
    id: 'custom-3',
    name: 'Crown of Wisdom',
    description: 'A golden helmet that increases wisdom significantly',
    type: 'customization',
    rarity: 'epic',
    price: 200,
    stats: { wisdom: 5 },
    customization: {
      id: 'custom-3',
      name: 'Crown of Wisdom',
      description: 'A golden helmet that increases wisdom significantly',
      category: 'helmet',
      rarity: 'epic',
      price: 200,
      stats: { wisdom: 5 },
      visual: { color: '#fbbf24' },
    },
  },
  {
    id: 'custom-4',
    name: 'Emerald Tunic',
    description: 'A natural green tunic enhancing health and wisdom',
    type: 'customization',
    rarity: 'rare',
    price: 90,
    stats: { wisdom: 2, endurance: 1 },
    customization: {
      id: 'custom-4',
      name: 'Emerald Tunic',
      description: 'A natural green tunic enhancing health and wisdom',
      category: 'armor-color',
      rarity: 'rare',
      price: 90,
      stats: { wisdom: 2, endurance: 1 },
      visual: { color: '#10b981' },
    },
  },
  {
    id: 'custom-5',
    name: 'Radiant Aura',
    description: 'A shimmering aura effect that boosts all stats slightly',
    type: 'customization',
    rarity: 'legendary',
    price: 300,
    stats: { strength: 2, endurance: 2, wisdom: 2, agility: 2 },
    customization: {
      id: 'custom-5',
      name: 'Radiant Aura',
      description: 'A shimmering aura effect that boosts all stats slightly',
      category: 'aura',
      rarity: 'legendary',
      price: 300,
      stats: { strength: 2, endurance: 2, wisdom: 2, agility: 2 },
      visual: { color: '#a78bfa' },
    },
  },
  {
    id: 'custom-6',
    name: 'Midnight Cloak',
    description: 'A dark flowing cloak favored by elite night runners',
    type: 'customization',
    rarity: 'epic',
    price: 240,
    stats: { agility: 3, wisdom: 1 },
    customization: {
      id: 'custom-6',
      name: 'Midnight Cloak',
      description: 'A dark flowing cloak favored by elite night runners',
      category: 'cloak',
      rarity: 'epic',
      price: 240,
      stats: { agility: 3, wisdom: 1 },
      visual: { color: '#1f2937' },
    },
  },
  {
    id: 'custom-7',
    name: 'Sunfire Helm',
    description: 'A bright helm that signals confidence and determination',
    type: 'customization',
    rarity: 'rare',
    price: 160,
    stats: { strength: 2, endurance: 1 },
    customization: {
      id: 'custom-7',
      name: 'Sunfire Helm',
      description: 'A bright helm that signals confidence and determination',
      category: 'helmet',
      rarity: 'rare',
      price: 160,
      stats: { strength: 2, endurance: 1 },
      visual: { color: '#f97316' },
    },
  },
  {
    id: 'custom-8',
    name: 'Verdant Aura',
    description: 'A nature-themed aura for heroes focused on recovery and balance',
    type: 'customization',
    rarity: 'epic',
    price: 260,
    stats: { endurance: 2, wisdom: 2 },
    customization: {
      id: 'custom-8',
      name: 'Verdant Aura',
      description: 'A nature-themed aura for heroes focused on recovery and balance',
      category: 'aura',
      rarity: 'epic',
      price: 260,
      stats: { endurance: 2, wisdom: 2 },
      visual: { color: '#22c55e' },
    },
  },
];

export function GameProvider({ children }: { children: ReactNode }) {
  // Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  // Game state
  const [character, setCharacter] = useState<Character | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const authHydrationInProgressRef = useRef(false);

  const toDate = (value: unknown, fallback: Date = new Date()) => {
    if (!value) return fallback;
    const date = new Date(value as string | number | Date);
    return Number.isNaN(date.getTime()) ? fallback : date;
  };

  const DAY_MS = 24 * 60 * 60 * 1000;
  const QUEST_COOLDOWN_MS: Record<Quest['difficulty'], number> = {
    easy: 5 * 60 * 1000,
    medium: 10 * 60 * 1000,
    hard: 15 * 60 * 1000,
    legendary: 20 * 60 * 1000,
  };

  const getQuestCooldownMs = (difficulty: Quest['difficulty']) => QUEST_COOLDOWN_MS[difficulty] ?? QUEST_COOLDOWN_MS.medium;

  const getStartOfDayTimestamp = (value: Date | string | number) => {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  };

  const hydrateAuthenticatedUser = async (
    authUser: {
      id: string;
      email?: string | null;
      created_at?: string;
    },
    fallbackUsername?: string,
  ) => {
    if (authHydrationInProgressRef.current) return;

    authHydrationInProgressRef.current = true;
    setIsAuthLoading(true);

    try {
      const profile = await authApi.getProfile(authUser.id);
      const userData: User = {
        id: authUser.id,
        email: authUser.email || '',
        username: profile.username || fallbackUsername || 'Hero',
        createdAt: new Date(authUser.created_at || Date.now()),
        lastLogin: new Date(),
      };

      setUser(userData);
      setIsLoggedIn(true);

      const characterData = await characterApi.getCharacter(authUser.id);
      if (characterData) {
        const [
          inventory,
          equippedItems,
          equippedCustomizations,
          achievements,
          activities,
          gameSessions,
          personalBests,
          challenges,
          assessmentResult,
          quests,
        ] = await Promise.all([
          inventoryApi.getInventory(characterData.id),
          inventoryApi.getEquippedItems(characterData.id),
          inventoryApi.getEquippedCustomizations(characterData.id),
          achievementsApi.getAchievements(characterData.id),
          activitiesApi.getActivities(characterData.id),
          gameSessionsApi.getGameSessions(characterData.id),
          gameSessionsApi.getPersonalBests(characterData.id),
          challengesApi.getChallenges(characterData.id),
          assessmentApi.getAssessmentResult(characterData.id),
          questsApi.getQuests(characterData.id),
        ]);

        const fullCharacter: Character = {
          ...characterData,
          inventory,
          equippedItems,
          equippedCustomizations,
          achievements,
          activities,
          gameSessions,
          personalBests,
          activeTierChallenges: challenges,
          assessmentResult: assessmentResult ?? undefined,
        };

        const migratedCharacter = migrateCharacter(fullCharacter);
        const focusCharacter = await backfillStarterFocusBuff(migratedCharacter);

        const gameStateData: GameState = {
          character: focusCharacter,
          availableQuests: [...enhancedQuests, ...questionBasedQuests],
          activeQuests: quests.filter(q => !q.completed),
          completedQuests: quests.filter(q => q.completed),
          shopInventory: createSampleShop(),
          availableChallenges: sampleChallenges,
          availableAchievements: allAchievements,
          assessmentQuestions: assessmentQuestions,
        };

        const migratedGameState = migrateGameState(gameStateData, focusCharacter);
        setCharacter(focusCharacter);
        setGameState(migratedGameState);
        return;
      }

      const autoCharacter = await characterApi.createCharacter(authUser.id, userData.username);
      const starterChallenges = gameTierChallenges.filter(c => c.tier === 'daily').slice(0, 3);

      await Promise.all(
        starterChallenges.map(challenge => challengesApi.addChallenge(autoCharacter.id, challenge))
      );

      const populatedCharacter = {
        ...autoCharacter,
        activeTierChallenges: starterChallenges,
      };

      const allInitialQuests = [...enhancedQuests, ...questionBasedQuests];
      const newGameState: GameState = {
        character: populatedCharacter,
        availableQuests: allInitialQuests,
        activeQuests: [],
        completedQuests: [],
        shopInventory: createSampleShop(),
        availableChallenges: sampleChallenges,
        availableAchievements: allAchievements,
        assessmentQuestions: assessmentQuestions,
      };

      const focusCharacter = await backfillStarterFocusBuff(populatedCharacter);
      const focusGameState = {
        ...newGameState,
        character: focusCharacter,
      };

      setCharacter(focusCharacter);
      setGameState(focusGameState);
    } finally {
      authHydrationInProgressRef.current = false;
      setIsAuthLoading(false);
    }
  };

  const bootstrapAuthState = async () => {
    if (authHydrationInProgressRef.current) return;

    try {
      const session = await authApi.getSession();
      if (session?.user) {
        await hydrateAuthenticatedUser(session.user, session.user.user_metadata?.username as string | undefined);
      } else {
        setUser(null);
        setIsLoggedIn(false);
        setCharacter(null);
        setGameState(null);
        setIsAuthLoading(false);
      }
    } catch (error) {
      console.error('Auth bootstrap error:', error);
      setIsAuthLoading(false);
    }
  };

  const calculateStreakStats = (activities: Activity[]) => {
    if (!activities || activities.length === 0) {
      return { current: 0, best: 0 };
    }

    const uniqueDaysDesc = Array.from(
      new Set(activities.map((activity) => getStartOfDayTimestamp(activity.date)))
    ).sort((a, b) => b - a);

    if (uniqueDaysDesc.length === 0) {
      return { current: 0, best: 0 };
    }

    let best = 1;
    let runningBest = 1;

    for (let index = 1; index < uniqueDaysDesc.length; index += 1) {
      if (uniqueDaysDesc[index - 1] - uniqueDaysDesc[index] === DAY_MS) {
        runningBest += 1;
      } else {
        best = Math.max(best, runningBest);
        runningBest = 1;
      }
    }
    best = Math.max(best, runningBest);

    const today = getStartOfDayTimestamp(new Date());
    const yesterday = today - DAY_MS;
    const anchorDay = uniqueDaysDesc.includes(today)
      ? today
      : uniqueDaysDesc.includes(yesterday)
        ? yesterday
        : null;

    if (!anchorDay) {
      return { current: 0, best };
    }

    let current = 0;
    let cursor = anchorDay;

    while (uniqueDaysDesc.includes(cursor)) {
      current += 1;
      cursor -= DAY_MS;
    }

    return { current, best: Math.max(best, current) };
  };

  const calculateComboStats = (sessions: GameSession[]) => {
    if (!sessions || sessions.length === 0) {
      return { current: 0, max: 0, multiplier: 1.0 };
    }

    const ordered = [...sessions].sort(
      (left, right) => toDate(left.date).getTime() - toDate(right.date).getTime()
    );

    let current = 0;
    let max = 0;

    for (const session of ordered) {
      if (session.rank === 'S' || session.rank === 'A') {
        current += 1;
      } else {
        current = 0;
      }
      max = Math.max(max, current);
    }

    return {
      current,
      max,
      multiplier: Math.min(1.0 + (current * 0.1), 1.5),
    };
  };

  const inferPrimaryWellnessStat = (char: Character): 'fitness' | 'nutrition' | 'mindfulness' | 'sleep' => {
    if (char.primaryWellnessStat) {
      return char.primaryWellnessStat;
    }

    if (char.assessmentResult) {
      return Object.entries(char.assessmentResult.scores)
        .sort(([, left], [, right]) => right - left)[0][0] as 'fitness' | 'nutrition' | 'mindfulness' | 'sleep';
    }

    if (char.wellnessProfile === 'health-focused') {
      return 'nutrition';
    }

    if (char.wellnessProfile === 'balanced') {
      return 'fitness';
    }

    const statEntries: Array<['fitness' | 'nutrition' | 'mindfulness' | 'sleep', number]> = [
      ['fitness', (char.stats.strength || 0) + (char.stats.endurance || 0) + (char.stats.agility || 0)],
      ['mindfulness', char.stats.wisdom || 0],
      ['nutrition', Math.max(char.gold || 0, char.stats.level || 0)],
      ['sleep', Math.max(char.stats.health || 0, char.stats.maxHealth || 0) - 100],
    ];

    return statEntries.sort(([, left], [, right]) => right - left)[0][0];
  };

  // Migrate character data to add missing properties
  const migrateCharacter = (char: Character): Character => {
    const defaultCharacter = createDefaultCharacter(char.name || 'Hero');
    const migratedActivities = char.activities && char.activities.length > 0
      ? char.activities.map((activity) => ({
          ...activity,
          date: toDate(activity.date),
          comments: (activity.comments || []).map((comment) => ({
            ...comment,
            date: toDate(comment.date),
          })),
        }))
      : [];

    const migratedSessions = (char.gameSessions || []).map((session) => ({
      ...session,
      date: toDate(session.date),
    }));

    const streakStats = calculateStreakStats(migratedActivities);
    const comboStats = calculateComboStats(migratedSessions);

    // Get starter challenges if none exist
    const starterChallenges = (!char.activeTierChallenges || char.activeTierChallenges.length === 0)
      ? gameTierChallenges.filter(c => c.tier === 'daily').slice(0, 3)
      : char.activeTierChallenges;

    return {
      ...char,
      joinedDate: toDate(char.joinedDate, defaultCharacter.joinedDate),
      equippedCustomizations: char.equippedCustomizations || {},
      gameSessions: migratedSessions,
      personalBests: char.personalBests || defaultCharacter.personalBests,
      currentComboStreak: comboStats.current,
      maxComboStreak: Math.max(char.maxComboStreak ?? 0, comboStats.max),
      comboMultiplier: comboStats.multiplier,
      activeTierChallenges: starterChallenges,
      dailyQuestRefreshDate: char.dailyQuestRefreshDate ? toDate(char.dailyQuestRefreshDate) : defaultCharacter.dailyQuestRefreshDate,
      achievements: char.achievements && char.achievements.length > 0
        ? char.achievements.map((achievement) => ({
            ...achievement,
            unlockedDate: achievement.unlockedDate ? toDate(achievement.unlockedDate) : undefined,
          }))
        : [],
      activities: migratedActivities,
      currentStreak: streakStats.current,
      longestStreak: streakStats.best,
      weeklyGoal: char.weeklyGoal ?? defaultCharacter.weeklyGoal,
      activeChallenges: char.activeChallenges?.map((challenge) => ({
        ...challenge,
        startDate: toDate(challenge.startDate),
        endDate: toDate(challenge.endDate),
      })) || [],
      primaryWellnessStat: char.primaryWellnessStat ?? inferPrimaryWellnessStat(char),
    };
  };

  const backfillStarterFocusBuff = async (char: Character): Promise<Character> => {
    const primaryWellnessStat = inferPrimaryWellnessStat(char);
    const starterItemNames: Record<'fitness' | 'nutrition' | 'mindfulness' | 'sleep', string> = {
      fitness: '⚡ Fitness Ring',
      nutrition: '🥗 Nutritionist\'s Badge',
      mindfulness: '🧘 Serenity Amulet',
      sleep: '😴 Dream Weaver\'s Charm',
    };

    const existingStarterItem = char.inventory.find((item) => item.name === starterItemNames[primaryWellnessStat]);
    let updatedCharacter: Character = {
      ...char,
      primaryWellnessStat,
    };

    if (!existingStarterItem) {
      const starterItem = createPersonalizedStartingItem(primaryWellnessStat);
      const insertedItemId = await inventoryApi.addItem(char.id, starterItem);

      const shouldEquip = !char.equippedItems?.accessory;
      if (shouldEquip) {
        await inventoryApi.updateEquippedItems(char.id, 'accessory', insertedItemId);
      }

      updatedCharacter = {
        ...updatedCharacter,
        inventory: [
          ...char.inventory,
          {
            id: insertedItemId,
            ...starterItem,
          },
        ],
        equippedItems: shouldEquip
          ? {
              ...char.equippedItems,
              accessory: insertedItemId,
            }
          : char.equippedItems,
      };
    }

    return updatedCharacter;
  };

  const migrateGameState = (state: GameState, migratedCharacter: Character): GameState => {
    // Always include all quests (both game and question-based)
    const allQuests = [...enhancedQuests, ...questionBasedQuests];
    const existingQuestIds = new Set((state.availableQuests || []).map(q => q.id));
    
    // Merge with existing quests to preserve any customizations, add missing question quests
    const mergedQuests = [
      ...allQuests.filter(q => !existingQuestIds.has(q.id)), // Add new question quests
      ...(state.availableQuests || []), // Keep existing quests
    ];

    const defaultShopItems = createSampleShop();
    const existingShopItems = state.shopInventory || [];
    const existingShopItemIds = new Set(existingShopItems.map((item) => item.id));
    const mergedShopInventory = [
      ...existingShopItems,
      ...defaultShopItems.filter((item) => !existingShopItemIds.has(item.id)),
    ];

    const normalizeQuestDates = (quest: Quest): Quest => ({
      ...quest,
      completedDate: quest.completedDate ? toDate(quest.completedDate) : undefined,
      cooldownUntil: quest.cooldownUntil ? toDate(quest.cooldownUntil) : undefined,
    });
    
    return {
      ...state,
      character: migratedCharacter,
      availableQuests: (mergedQuests.length > 0 ? mergedQuests : allQuests).map(normalizeQuestDates),
      activeQuests: (state.activeQuests || []).map(normalizeQuestDates),
      completedQuests: (state.completedQuests || []).map(normalizeQuestDates),
      shopInventory: mergedShopInventory.length > 0 ? mergedShopInventory : defaultShopItems,
      availableChallenges: (state.availableChallenges && state.availableChallenges.length > 0
        ? state.availableChallenges
        : sampleChallenges
      ).map((challenge) => ({
        ...challenge,
        startDate: toDate(challenge.startDate),
        endDate: toDate(challenge.endDate),
      })),
      availableAchievements: state.availableAchievements && state.availableAchievements.length > 0
        ? state.availableAchievements
        : allAchievements,
      assessmentQuestions: state.assessmentQuestions && state.assessmentQuestions.length > 0
        ? state.assessmentQuestions
        : assessmentQuestions,
      currentGameQuest: state.currentGameQuest,
    };
  };

  // Authentication Methods
  const login = async (email: string, password: string) => {
    try {
      await authApi.signIn(email, password);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, username: string, password: string) => {
    try {
      const { session } = await authApi.signUp(email, password, username);

      if (!session) {
        // If email confirmation is enabled, let user sign in after confirming.
        setIsAuthLoading(false);
      }
    } catch (error: any) {
      const errorMessage = error?.message || error?.error_description || 'Registration failed';
      console.error('Registration error:', errorMessage, error);
      setIsAuthLoading(false);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await authApi.signOut();
      setUser(null);
      setIsLoggedIn(false);
      setCharacter(null);
      setGameState(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!cancelled) {
        await bootstrapAuthState();
      }
    })();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !cancelled) {
        void bootstrapAuthState();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
        try {
          await hydrateAuthenticatedUser(session.user, session.user.user_metadata?.username as string | undefined);
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : typeof error === 'string'
                ? error
                : JSON.stringify(error);
          console.error('Error loading user profile:', errorMessage, error);
        } finally {
          setIsAuthLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoggedIn(false);
        setCharacter(null);
        setGameState(null);
        setIsAuthLoading(false);
      } else if (event === 'INITIAL_SESSION' && !session?.user) {
        setUser(null);
        setIsLoggedIn(false);
        setCharacter(null);
        setGameState(null);
        setIsAuthLoading(false);
      }
    });

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      subscription.unsubscribe();
    };
  }, []);

  const saveGame = async () => {
    if (!character || !gameState || !user) return;
    
    try {
      // Save character data
      await characterApi.updateCharacter(character.id, character);

      // Note: Inventory, achievements, activities, etc. are saved individually when changed
      // This function is mainly for character stats updates
    } catch (error) {
      console.error('Error saving game:', error);
    }
  };

  useEffect(() => {
    if (character && gameState && user) {
      // Auto-save character data when it changes
      saveGame();
    }
  }, [character?.stats, character?.gold, character?.questsCompleted, character?.currentStreak]);

  useEffect(() => {
    if (!character || !gameState) return;

    const seededCharacter = createDefaultCharacter(character.name || 'Hero');
    let normalizedCharacter = character;
    let normalizedGameState = gameState;
    let hasChanges = false;

    if (!normalizedCharacter.activities) {
      normalizedCharacter = {
        ...normalizedCharacter,
        activities: seededCharacter.activities,
      };
      hasChanges = true;
    }

    if (!normalizedCharacter.achievements) {
      normalizedCharacter = {
        ...normalizedCharacter,
        achievements: seededCharacter.achievements,
      };
      hasChanges = true;
    }

    if (!normalizedCharacter.activeChallenges) {
      normalizedCharacter = {
        ...normalizedCharacter,
        activeChallenges: [],
      };
      hasChanges = true;
    }

    const derivedStreaks = calculateStreakStats(normalizedCharacter.activities || []);
    if (
      normalizedCharacter.currentStreak !== derivedStreaks.current ||
      normalizedCharacter.longestStreak !== derivedStreaks.best
    ) {
      normalizedCharacter = {
        ...normalizedCharacter,
        currentStreak: derivedStreaks.current,
        longestStreak: derivedStreaks.best,
      };
      hasChanges = true;
    }

    const derivedCombo = calculateComboStats(normalizedCharacter.gameSessions || []);
    if (
      normalizedCharacter.currentComboStreak !== derivedCombo.current ||
      normalizedCharacter.maxComboStreak < derivedCombo.max ||
      normalizedCharacter.comboMultiplier !== derivedCombo.multiplier
    ) {
      normalizedCharacter = {
        ...normalizedCharacter,
        currentComboStreak: derivedCombo.current,
        maxComboStreak: Math.max(normalizedCharacter.maxComboStreak || 0, derivedCombo.max),
        comboMultiplier: derivedCombo.multiplier,
      };
      hasChanges = true;
    }

    if (!normalizedGameState.availableChallenges || normalizedGameState.availableChallenges.length === 0) {
      normalizedGameState = {
        ...normalizedGameState,
        availableChallenges: sampleChallenges,
      };
      hasChanges = true;
    }

    if (!normalizedGameState.availableAchievements || normalizedGameState.availableAchievements.length === 0) {
      normalizedGameState = {
        ...normalizedGameState,
        availableAchievements: allAchievements,
      };
      hasChanges = true;
    } else if (normalizedGameState.availableAchievements.length < allAchievements.length) {
      // Merge new achievements that weren't in the saved state
      const existingIds = new Set(normalizedGameState.availableAchievements.map(a => a.id));
      const newAchievements = allAchievements.filter(a => !existingIds.has(a.id));
      if (newAchievements.length > 0) {
        normalizedGameState = {
          ...normalizedGameState,
          availableAchievements: [...normalizedGameState.availableAchievements, ...newAchievements],
        };
        hasChanges = true;
      }
    }

    const latestShopItems = createSampleShop();
    const currentShopItems = normalizedGameState.shopInventory || [];
    if (currentShopItems.length === 0) {
      normalizedGameState = {
        ...normalizedGameState,
        shopInventory: latestShopItems,
      };
      hasChanges = true;
    } else {
      const currentShopItemIds = new Set(currentShopItems.map((item) => item.id));
      const missingShopItems = latestShopItems.filter((item) => !currentShopItemIds.has(item.id));
      if (missingShopItems.length > 0) {
        normalizedGameState = {
          ...normalizedGameState,
          shopInventory: [...currentShopItems, ...missingShopItems],
        };
        hasChanges = true;
      }
    }

    if (hasChanges) {
      const syncedGameState = {
        ...normalizedGameState,
        character: normalizedCharacter,
      };

      setCharacter(normalizedCharacter);
      setGameState(syncedGameState);
    }
  }, [character, gameState]);

  useEffect(() => {
    if (!gameState || !character) return;

    const reactivateExpiredQuests = (expiredQuests: Quest[]) => {
      if (expiredQuests.length === 0) return;

      setGameState((previousState) => {
        if (!previousState) return previousState;

        const activeQuestIds = new Set(previousState.activeQuests.map((quest) => quest.id));
        const questsToReactivate = expiredQuests.filter((quest) => !activeQuestIds.has(quest.id));
        const reactivatedQuestIds = new Set(questsToReactivate.map((quest) => quest.id));

        if (questsToReactivate.length === 0) return previousState;

        return {
          ...previousState,
          availableQuests: previousState.availableQuests.filter((quest) => !reactivatedQuestIds.has(quest.id)),
          activeQuests: [...previousState.activeQuests, ...questsToReactivate],
        };
      });

      if (user) {
        (async () => {
          try {
            await Promise.all(
              expiredQuests.map((quest) =>
                questsApi.upsertQuest(character.id, quest, { completed: false, completedDate: undefined })
              )
            );
          } catch (error) {
            console.error('Error reactivating expired cooldown quests:', error);
          }
        })();
      }
    };

    const now = Date.now();
    const expiredNow = gameState.availableQuests
      .filter((quest) => quest.cooldownUntil && new Date(quest.cooldownUntil).getTime() <= now)
      .map((quest) => ({
        ...quest,
        completed: false,
        completedDate: undefined,
        cooldownUntil: undefined,
      }));

    if (expiredNow.length > 0) {
      reactivateExpiredQuests(expiredNow);
    }

    const questsOnCooldown = gameState.availableQuests.filter((quest) => {
      if (!quest.cooldownUntil) return false;
      return new Date(quest.cooldownUntil).getTime() > Date.now();
    });

    if (questsOnCooldown.length === 0) return;

    const nextExpiryTime = Math.min(
      ...questsOnCooldown.map((quest) => new Date(quest.cooldownUntil as Date).getTime())
    );

    const timeoutMs = Math.max(nextExpiryTime - Date.now(), 0) + 50;

    const timer = window.setTimeout(() => {
      const runAt = Date.now();
      const expiredAtRunTime = gameState.availableQuests
        .filter((quest) => quest.cooldownUntil && new Date(quest.cooldownUntil).getTime() <= runAt)
        .map((quest) => ({
          ...quest,
          completed: false,
          completedDate: undefined,
          cooldownUntil: undefined,
        }));

      reactivateExpiredQuests(expiredAtRunTime);
    }, timeoutMs);

    return () => window.clearTimeout(timer);
  }, [gameState, character, user]);

  const createCharacter = async (name: string, primaryWellnessStat?: 'fitness' | 'nutrition' | 'mindfulness' | 'sleep') => {
    if (!user) {
      console.error('No user logged in');
      return;
    }

    try {
      // Create character in Supabase
      const newCharacter = await characterApi.createCharacter(user.id, name);
      
      // Populate with starter daily challenges
      const starterChallenges = gameTierChallenges.filter(c => c.tier === 'daily').slice(0, 3);
      
      // Save challenges to database
      await Promise.all(
        starterChallenges.map(challenge => 
          challengesApi.addChallenge(newCharacter.id, challenge)
        )
      );

      // Create personalized starting item if wellness stat was selected
      let populatedCharacter = {
        ...newCharacter,
        activeTierChallenges: starterChallenges,
        primaryWellnessStat: primaryWellnessStat,
      } as Character;

      // Add personalized starting item to inventory and equip it by default
      if (primaryWellnessStat) {
        const startingItem = createPersonalizedStartingItem(primaryWellnessStat);
        const insertedItemId = await inventoryApi.addItem(newCharacter.id, startingItem);
        await inventoryApi.updateEquippedItems(newCharacter.id, 'accessory', insertedItemId);

        populatedCharacter = {
          ...populatedCharacter,
          inventory: [
            ...(populatedCharacter.inventory || []),
            {
              id: insertedItemId,
              ...startingItem,
            },
          ],
          equippedItems: {
            ...populatedCharacter.equippedItems,
            accessory: insertedItemId,
          },
        };
      }
      
      setCharacter(populatedCharacter);
      
      // Initialize with all available quests (both game and question-based)
      const allInitialQuests = [...enhancedQuests, ...questionBasedQuests];
      const newGameState: GameState = {
        character: populatedCharacter,
        availableQuests: allInitialQuests,
        activeQuests: [],
        completedQuests: [],
        shopInventory: createSampleShop(),
        availableChallenges: sampleChallenges,
        availableAchievements: allAchievements,
        assessmentQuestions: assessmentQuestions,
      };
      setGameState(newGameState);
    } catch (error) {
      console.error('Error creating character:', error);
      throw error;
    }
  };

  const acceptQuest = (questId: string) => {
    if (!gameState || !character) return;
    const quest = gameState.availableQuests.find(q => q.id === questId);
    if (!quest) return;

    const cooldownUntilMs = quest.cooldownUntil ? new Date(quest.cooldownUntil).getTime() : 0;
    if (cooldownUntilMs > Date.now()) {
      return;
    }

    if (quest) {
      const updated = {
        ...gameState,
        availableQuests: gameState.availableQuests.filter(q => q.id !== questId),
        activeQuests: [...gameState.activeQuests, { ...quest, cooldownUntil: undefined }],
      };
      setGameState(updated);
      saveGame();

      if (user) {
        (async () => {
          try {
            await questsApi.upsertQuest(character.id, { ...quest, completed: false, completedDate: undefined });
          } catch (error) {
            console.error('Error saving accepted quest state:', error);
          }
        })();
      }
    }
  };

  const completeQuest = (questId: string, sessionData?: GameSession) => {
    if (!character || !gameState) return;
    const quest = gameState.activeQuests.find(q => q.id === questId);
    if (!quest) return;

    // Update personal bests if session data provided
    const personalBests = { ...character.personalBests };
    let session: GameSession;
    let isPersonalBest = false;

    if (sessionData) {
      session = { ...sessionData };
      const typeBest = personalBests[quest.type];

      // Check for personal bests
      if (session.score > typeBest.bestScore) {
        typeBest.bestScore = session.score;
        isPersonalBest = true;
      }
      if (session.completionTime < typeBest.bestTime) {
        typeBest.bestTime = session.completionTime;
        isPersonalBest = true;
      }

      // Update averages
      const newTotalClears = typeBest.totalClears + 1;
      typeBest.avgTime = ((typeBest.avgTime * typeBest.totalClears) + session.completionTime) / newTotalClears;
      typeBest.totalClears = newTotalClears;

      personalBests[quest.type] = typeBest;
      session.isPersonalBest = isPersonalBest;
    } else {
      // Generate default session data if not provided
      const defaultTime = quest.difficulty === 'easy' ? 45 : quest.difficulty === 'medium' ? 60 : 90;
      const defaultScore = quest.difficulty === 'easy' ? 7000 : quest.difficulty === 'medium' ? 7500 : 8000;
      session = {
        id: crypto.randomUUID(),
        questId,
        questType: quest.type,
        completionTime: defaultTime,
        score: defaultScore,
        rank: calculateRank(defaultScore, quest.type),
        isPerfect: false,
        isPersonalBest: false,
        date: new Date(),
      };
    }

    const sessionsWithCurrent = [session, ...(character.gameSessions || [])];
    const comboStats = calculateComboStats(sessionsWithCurrent);

    // Calculate rewards with buffs and combo
    const buffs = getEquipmentBuffs(quest.type);
    
    // Use rewards from session if available (from mini-games), otherwise use quest base rewards
    let finalXpGain: number;
    let finalGoldGain: number;
    
    if (sessionData?.rewards) {
      // Game provided rewards (already includes rank bonuses)
      finalXpGain = Math.round(sessionData.rewards.experience * buffs.xpMultiplier * comboStats.multiplier);
      finalGoldGain = Math.round(sessionData.rewards.gold * buffs.goldMultiplier * comboStats.multiplier);
    } else {
      // No session rewards, use quest base rewards
      const baseXpGain = quest.rewards.experience;
      const baseGoldGain = quest.rewards.gold;
      const xpWithBuffs = Math.round(baseXpGain * buffs.xpMultiplier);
      const goldWithBuffs = Math.round(baseGoldGain * buffs.goldMultiplier);
      
      // Apply combo multiplier on top of equipment buffs
      finalXpGain = Math.round(xpWithBuffs * comboStats.multiplier);
      finalGoldGain = Math.round(goldWithBuffs * comboStats.multiplier);
    }
    
    // Update stats with final XP gain
    const newStats = applyExperienceGain(character.stats, finalXpGain);

    // Create activity from quest
    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      title: quest.title,
      type: quest.type,
      description: quest.description,
      duration: session.completionTime,
      date: new Date(),
      kudos: 0,
      comments: [],
      stats: {
        performance: session.isPersonalBest ? 'personal-best' : session.rank === 'S' || session.rank === 'A' ? 'excellent' : session.rank === 'B' ? 'good' : 'normal',
      },
      sessionId: session.id,
      rank: session.rank,
      score: session.score,
    };

    // Add distance for fitness activities
    if (quest.type === 'fitness') {
      newActivity.distance = quest.difficulty === 'easy' ? 3 : quest.difficulty === 'medium' ? 5 : 8;
      newActivity.calories = Math.round(newActivity.distance * 50);
      newActivity.stats.pace = '5:30 /km';
    }

    const completionTimestamp = new Date();
    const completedQuest = { ...quest, completed: true, completedDate: completionTimestamp, cooldownUntil: undefined };
    const cooldownUntil = new Date(completionTimestamp.getTime() + getQuestCooldownMs(quest.difficulty));
    const cooledDownQuest = {
      ...quest,
      completed: false,
      completedDate: undefined,
      cooldownUntil,
    };
    
    const activitiesWithCurrent = [newActivity, ...(character.activities || [])];
    const streakStats = calculateStreakStats(activitiesWithCurrent);

    let updatedCharacter: Character = {
      ...character,
      stats: newStats,
      gold: character.gold + finalGoldGain,
      questsCompleted: character.questsCompleted + 1,
      activities: activitiesWithCurrent,
      gameSessions: sessionsWithCurrent,
      personalBests,
      currentStreak: streakStats.current,
      longestStreak: Math.max(character.longestStreak, streakStats.best),
      currentComboStreak: comboStats.current,
      maxComboStreak: Math.max(character.maxComboStreak, comboStats.max),
      comboMultiplier: comboStats.multiplier,
    };

    // Update challenge progress
    updatedCharacter = updateChallengeProgress(updatedCharacter, newActivity);

    // Normalize any bonus XP from challenge milestones/rewards.
    updatedCharacter = {
      ...updatedCharacter,
      stats: applyExperienceGain({ ...updatedCharacter.stats, experience: 0 }, updatedCharacter.stats.experience),
    };

    // Check and unlock achievements
    updatedCharacter = checkAchievements(updatedCharacter);

    const updated = {
      ...gameState,
      character: updatedCharacter,
      availableQuests: [...gameState.availableQuests.filter(q => q.id !== questId), cooledDownQuest],
      activeQuests: gameState.activeQuests.filter(q => q.id !== questId),
      completedQuests: [...gameState.completedQuests, completedQuest],
      currentGameQuest: undefined,
    };

    setCharacter(updatedCharacter);
    setGameState(updated);

    // Save all data to Supabase
    if (user) {
      (async () => {
        try {
          // Persist core progression first so XP/level/gold are not lost if optional writes fail.
          await characterApi.updateCharacter(updatedCharacter.id, updatedCharacter);

          const writeResults = await Promise.allSettled([
            activitiesApi.addActivity(updatedCharacter.id, newActivity),
            gameSessionsApi.addGameSession(updatedCharacter.id, session),
            gameSessionsApi.updatePersonalBests(updatedCharacter.id, quest.type, personalBests[quest.type]),
            questsApi.upsertQuest(updatedCharacter.id, completedQuest, { completed: true, completedDate: completionTimestamp }),
            leaderboardApi.addEntry(
              updatedCharacter.id,
              updatedCharacter.name,
              quest.type,
              session.score,
              session.rank,
              session.completionTime
            ),
          ]);

          const failedWrites = writeResults.filter((result): result is PromiseRejectedResult => result.status === 'rejected');
          if (failedWrites.length > 0) {
            console.error('Some quest completion writes failed:', failedWrites.map((failure) => failure.reason));
          }

          // Save new achievements if any
          const newAchievements = updatedCharacter.achievements.filter(
            a => !character.achievements.find(ca => ca.id === a.id)
          );
          if (newAchievements.length > 0) {
            await Promise.all(
              newAchievements.map(ach => achievementsApi.addAchievement(updatedCharacter.id, ach))
            );
          }

          // Update challenges that changed
          const changedChallenges = updatedCharacter.activeTierChallenges.filter((ch, idx) => {
            const oldCh = character.activeTierChallenges[idx];
            return oldCh && (ch.current !== oldCh.current || ch.completed !== oldCh.completed);
          });
          if (changedChallenges.length > 0) {
            await Promise.all(
              changedChallenges.map(ch => challengesApi.updateChallenge(ch.id, ch))
            );
          }
        } catch (error) {
          console.error('Error saving quest completion:', error);
        }
      })();
    }
  };

  const addGold = (amount: number) => {
    if (!character || !gameState) return;
    const updated = {
      ...character,
      gold: character.gold + amount,
    };
    setCharacter(updated);
    setGameState({ ...gameState, character: updated });
    saveGame();
  };

  const addExperience = (amount: number) => {
    if (!character || !gameState) return;
    const stats = applyExperienceGain(character.stats, amount);
    const updated = { ...character, stats };
    setCharacter(updated);
    setGameState({ ...gameState, character: updated });
    saveGame();
  };

  const buyItem = (shopItemId: string) => {
    if (!character || !gameState) return;
    const shopItem = gameState.shopInventory.find(i => i.id === shopItemId);
    if (!shopItem || character.gold < shopItem.price) return;

    const existingItem = character.inventory.find(i => i.id === shopItemId);
    let newInventory: InventoryItem[];

    if (existingItem) {
      newInventory = character.inventory.map(i =>
        i.id === shopItemId ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      newInventory = [
        ...character.inventory,
        {
          id: shopItemId,
          name: shopItem.name,
          type: shopItem.type as 'weapon' | 'armor' | 'accessory' | 'consumable' | 'customization',
          rarity: shopItem.rarity,
          stats: shopItem.stats,
          buffs: shopItem.buffs,
          quantity: 1,
          description: shopItem.description,
        },
      ];
    }

    const updated = {
      ...character,
      gold: character.gold - shopItem.price,
      inventory: newInventory,
    };

    setCharacter(updated);
    setGameState({ ...gameState, character: updated });
    saveGame();
  };

  const equipItem = (itemId: string, slot: 'weapon' | 'armor' | 'accessory') => {
    if (!character || !gameState) return;
    const item = character.inventory.find(i => i.id === itemId);
    if (!item) return;

    const updated = {
      ...character,
      equippedItems: {
        ...character.equippedItems,
        [slot]: itemId,
      },
    };

    setCharacter(updated);
    setGameState({ ...gameState, character: updated });
    saveGame();
  };

  const unequipItem = (slot: 'weapon' | 'armor' | 'accessory') => {
    if (!character || !gameState) return;

    const updated = {
      ...character,
      equippedItems: {
        ...character.equippedItems,
        [slot]: undefined,
      },
    };

    setCharacter(updated);
    setGameState({ ...gameState, character: updated });
    saveGame();
  };

  const useConsumable = (itemId: string) => {
    if (!character || !gameState) return;
    const item = character.inventory.find(i => i.id === itemId);
    if (!item || item.type !== 'consumable') return;

    let updatedStats = { ...character.stats };
    if (item.name === 'Health Potion') {
      updatedStats.health = Math.min(updatedStats.health + 50, updatedStats.maxHealth);
    }

    let newInventory = character.inventory;
    if (item.quantity > 1) {
      newInventory = newInventory.map(i =>
        i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
      );
    } else {
      newInventory = newInventory.filter(i => i.id !== itemId);
    }

    const updated = {
      ...character,
      stats: updatedStats,
      inventory: newInventory,
    };

    setCharacter(updated);
    setGameState({ ...gameState, character: updated });
    saveGame();
  };

  const equipCustomization = (customizationId: string, category: keyof import('./types').EquippedCustomizations) => {
    if (!character || !gameState) return;
    const shopItem = gameState.shopInventory.find(i => i.id === customizationId);
    if (!shopItem || !shopItem.customization) return;

    const updated = {
      ...character,
      equippedCustomizations: {
        ...character.equippedCustomizations,
        [category]: customizationId,
      },
    };

    setCharacter(updated);
    setGameState({ ...gameState, character: updated });
    saveGame();
  };

  const unequipCustomization = (category: keyof import('./types').EquippedCustomizations) => {
    if (!character || !gameState) return;

    const updated = {
      ...character,
      equippedCustomizations: {
        ...character.equippedCustomizations,
        [category]: undefined,
      },
    };

    setCharacter(updated);
    setGameState({ ...gameState, character: updated });
    saveGame();
  };

  const startGame = (questId: string) => {
    if (!gameState) return;
    const quest = gameState.activeQuests.find(q => q.id === questId);
    if (!quest) return;

    const updated = {
      ...gameState,
      currentGameQuest: quest,
    };

    setGameState(updated);
    saveGame();
  };

  const cancelGame = () => {
    if (!gameState) return;

    const updated = {
      ...gameState,
      currentGameQuest: undefined,
    };

    setGameState(updated);
    saveGame();
  };

  const finishGame = (questId: string, sessionData: GameSession) => {
    // completeQuest handles clearing current game quest to avoid stale-state overwrites.
    completeQuest(questId, sessionData);
  };

  const loadGame = async () => {
    // Load from Supabase - called on login, not needed separately
    console.log('loadGame called - data already loaded from Supabase on login');
  };

  // Complete Assessment and Generate Recommendations
  const completeAssessment = async (answers: AssessmentAnswer[]) => {
    if (!character || !gameState) return;

    // Calculate scores by category
    const scores = {
      fitness: 0,
      nutrition: 0,
      mindfulness: 0,
      sleep: 0,
    };

    const profileCounts: Record<WellnessProfile, number> = {
      beginner: 0,
      active: 0,
      athlete: 0,
      'health-focused': 0,
      balanced: 0,
    };

    // Process answers
    answers.forEach(answer => {
      const question = assessmentQuestions.find(q => q.id === answer.questionId);
      if (!question) return;

      scores[question.category] += answer.value * 25;

      answer.selectedOptions.forEach(optionId => {
        const option = question.options.find(o => o.id === optionId);
        if (option) {
          option.profile.forEach(prof => {
            profileCounts[prof]++;
          });
        }
      });
    });

    // Determine primary profile
    const profile = Object.entries(profileCounts)
      .sort(([, a], [, b]) => b - a)[0][0] as WellnessProfile;

    // Get recommended quests (both game-based and question-based)
    const allQuests = [...enhancedQuests, ...questionBasedQuests];
    const recommendedQuests = allQuests.filter(quest => 
      quest.recommendedFor?.includes(profile)
    );

    // Get recommended tier challenges based on profile
    const getRecommendedChallenges = (prof: WellnessProfile): Challenge[] => {
      const allChallenges = gameState?.availableChallenges || sampleChallenges;
      
      switch(prof) {
        case 'beginner':
          // Start with daily challenges only
          return allChallenges.filter(c => c.tier === 'daily');
        case 'active':
          // Daily + Weekly challenges
          return allChallenges.filter(c => c.tier === 'daily' || c.tier === 'weekly');
        case 'athlete':
          // All challenges available
          return allChallenges;
        case 'health-focused':
          // Mindfulness and sleep focused
          return allChallenges.filter(c => 
            c.type === 'mindfulness' || c.type === 'sleep' || c.tier === 'daily'
          );
        case 'balanced':
          // Mix of tiers and types
          return allChallenges.filter(c => 
            c.tier === 'daily' || c.tier === 'weekly' || 
            c.type === 'mindfulness' || c.type === 'nutrition'
          );
        default:
          return allChallenges.filter(c => c.tier === 'daily');
      }
    };

    const recommendedChallenges = getRecommendedChallenges(profile);

    const result: AssessmentResult = {
      profile,
      scores,
      recommendedQuests,
      completedDate: new Date(),
    };

    // Update character and game state with recommended challenges
    const updatedCharacter: Character = {
      ...character,
      assessmentResult: result,
      wellnessProfile: profile,
      activeTierChallenges: recommendedChallenges,
    };

    const updatedGameState: GameState = {
      ...gameState,
      character: updatedCharacter,
      availableQuests: allQuests, // Show all quests (both game and question-based)
    };

    setCharacter(updatedCharacter);
    setGameState(updatedGameState);

    try {
      await assessmentApi.saveAssessmentResult(character.id, result);
    } catch (error) {
      console.error('Error saving assessment result:', error);
    }

    saveGame();
  };

  // Give Kudos to Activity
  const giveKudos = (activityId: string) => {
    if (!character || !gameState) return;

    const activityIndex = character.activities?.findIndex(a => a.id === activityId);
    if (activityIndex === undefined || activityIndex === -1) return;

    const updatedActivities = [...(character.activities || [])];
    updatedActivities[activityIndex] = {
      ...updatedActivities[activityIndex],
      kudos: updatedActivities[activityIndex].kudos + 1,
    };

    const updatedCharacter = {
      ...character,
      activities: updatedActivities,
    };

    setCharacter(updatedCharacter);
    setGameState({ ...gameState, character: updatedCharacter });
    saveGame();
  };

  // Join Challenge
  const joinChallenge = (challengeId: string) => {
    if (!character || !gameState) return;

    const challenge = gameState.availableChallenges.find(c => c.id === challengeId);
    if (!challenge) return;

    const activeChallenges = character.activeChallenges || [];
    if (activeChallenges.find(c => c.id === challengeId)) return; // Already joined

    const updatedCharacter = {
      ...character,
      activeChallenges: [...activeChallenges, challenge],
    };

    setCharacter(updatedCharacter);
    setGameState({ ...gameState, character: updatedCharacter });
    saveGame();
  };

  // Accept Challenge - User must accept before starting
  const acceptChallenge = (challengeId: string) => {
    if (!character || !gameState) return;

    const challengeIndex = character.activeTierChallenges?.findIndex(c => c.id === challengeId);
    if (challengeIndex === undefined || challengeIndex === -1) return;

    const updatedChallenges = [...(character.activeTierChallenges || [])];
    updatedChallenges[challengeIndex] = {
      ...updatedChallenges[challengeIndex],
      accepted: true,
    };

    const updatedCharacter = {
      ...character,
      activeTierChallenges: updatedChallenges,
    };

    setCharacter(updatedCharacter);
    setGameState({ ...gameState, character: updatedCharacter });
    saveGame();
  };

  // Start Challenge - Marks challenge as in progress
  const startChallenge = (challengeId: string) => {
    if (!character || !gameState) return;

    const challengeIndex = character.activeTierChallenges?.findIndex(c => c.id === challengeId);
    if (challengeIndex === undefined || challengeIndex === -1) return;

    const challenge = character.activeTierChallenges[challengeIndex];
    if (!challenge.accepted) return; // Must be accepted first

    const updatedChallenges = [...(character.activeTierChallenges || [])];
    updatedChallenges[challengeIndex] = {
      ...updatedChallenges[challengeIndex],
      inProgress: true,
    };

    const updatedCharacter = {
      ...character,
      activeTierChallenges: updatedChallenges,
    };

    setCharacter(updatedCharacter);
    setGameState({ ...gameState, character: updatedCharacter });
    saveGame();
  };

  // Complete Challenge - Calculate rewards based on performance
  const completeChallenge = (challengeId: string, correctAnswers: number, totalQuestions: number) => {
    if (!character || !gameState) return;

    const challengeIndex = character.activeTierChallenges?.findIndex(c => c.id === challengeId);
    if (challengeIndex === undefined || challengeIndex === -1) return;

    const challenge = character.activeTierChallenges[challengeIndex];
    if (!challenge.inProgress) return;

    // Calculate score percentage
    const scorePercentage = (correctAnswers / totalQuestions) * 100;
    
    // Determine rank based on score
    let rank: 'S' | 'A' | 'B' | 'C' | 'D' = 'D';
    if (scorePercentage >= 95) rank = 'S';
    else if (scorePercentage >= 85) rank = 'A';
    else if (scorePercentage >= 70) rank = 'B';
    else if (scorePercentage >= 50) rank = 'C';

    // Calculate combo multiplier
    let newComboStreak = character.currentComboStreak;
    let newComboMultiplier = character.comboMultiplier;

    if (rank === 'S' || rank === 'A') {
      newComboStreak += 1;
      newComboMultiplier = Math.min(1.0 + (newComboStreak * 0.1), 1.5);
    } else {
      newComboStreak = 0;
      newComboMultiplier = 1.0;
    }

    const maxComboStreak = Math.max(character.maxComboStreak, newComboStreak);

    // Calculate rewards with multiplier
    const baseExperience = challenge.reward.experience;
    const baseGold = challenge.reward.gold;
    const experienceReward = Math.round(baseExperience * newComboMultiplier);
    const goldReward = Math.round(baseGold * newComboMultiplier);

    // Update challenge progress
    const updatedChallenges = [...(character.activeTierChallenges || [])];
    const progressIncrement = correctAnswers; // Each correct answer counts as progress
    const newCurrent = challenge.current + progressIncrement;
    const isCompleted = newCurrent >= challenge.target;

    updatedChallenges[challengeIndex] = {
      ...updatedChallenges[challengeIndex],
      current: newCurrent,
      questionsAnswered: (challenge.questionsAnswered || 0) + totalQuestions,
      correctAnswers: (challenge.correctAnswers || 0) + correctAnswers,
      completed: isCompleted,
      inProgress: false,
    };

    // Update character
    const updatedCharacter = {
      ...character,
      activeTierChallenges: updatedChallenges,
      stats: {
        ...character.stats,
        experience: character.stats.experience + experienceReward,
      },
      gold: character.gold + goldReward,
      currentComboStreak: newComboStreak,
      maxComboStreak,
      comboMultiplier: newComboMultiplier,
    };

    updatedCharacter.stats = applyExperienceGain({ ...updatedCharacter.stats, experience: 0 }, updatedCharacter.stats.experience);

    const achievementSyncedCharacter = checkAchievements(updatedCharacter);

    setCharacter(achievementSyncedCharacter);
    setGameState({ ...gameState, character: achievementSyncedCharacter });
    saveGame();
  };

  // Claim Tier Challenge Reward
  const claimTierChallengeReward = (challengeId: string) => {
    if (!character || !gameState) return;

    const challengeIndex = character.activeTierChallenges?.findIndex(c => c.id === challengeId);
    if (challengeIndex === undefined || challengeIndex === -1) return;

    const challenge = character.activeTierChallenges[challengeIndex];
    if (!challenge.completed || challenge.claimed) return;

    // Award full challenge rewards + combo bonus
    const challengeBonus = Math.round(challenge.reward.experience * ((challenge.reward.comboBonus ?? challenge.comboBonus) || 1.0));
    const totalExperience = challenge.reward.experience + challengeBonus;
    const totalGold = challenge.reward.gold;

    const updatedChallenges = [...(character.activeTierChallenges || [])];
    updatedChallenges[challengeIndex] = {
      ...updatedChallenges[challengeIndex],
      claimed: true,
    };

    // Update character with rewards
    const updatedCharacter = {
      ...character,
      activeTierChallenges: updatedChallenges,
      stats: {
        ...character.stats,
        experience: character.stats.experience + totalExperience,
      },
      gold: character.gold + totalGold,
    };

    updatedCharacter.stats = applyExperienceGain({ ...updatedCharacter.stats, experience: 0 }, updatedCharacter.stats.experience);

    // Check for achievement
    if (challenge.reward.achievement) {
      const achievements = [...(updatedCharacter.achievements || [])];
      const allAchievements = gameState.availableAchievements || [];
      const achievement = allAchievements.find(a => a.id === challenge.reward.achievement);
      if (achievement && !achievements.find(a => a.id === achievement.id)) {
        achievements.push({
          ...achievement,
          unlockedDate: new Date(),
        });
        updatedCharacter.achievements = achievements;
      }
    }

    const achievementSyncedCharacter = checkAchievements(updatedCharacter);

    setCharacter(achievementSyncedCharacter);
    setGameState({ ...gameState, character: achievementSyncedCharacter });
    saveGame();
  };

  // Check and Unlock Achievements
  const checkAchievements = (updatedCharacter: Character): Character => {
    const achievements = [...(updatedCharacter.achievements || [])];
    const questsCompleted = updatedCharacter.questsCompleted;
    const currentStreak = updatedCharacter.currentStreak;
    const totalDistance = updatedCharacter.activities?.reduce((sum, act) => sum + (act.distance || 0), 0) || 0;

    const unlockAchievement = (achievementId: string) => {
      if (achievements.find(a => a.id === achievementId)) return;
      const achievementTemplate = allAchievements.find(a => a.id === achievementId);
      if (!achievementTemplate) return;
      achievements.push({
        ...achievementTemplate,
        unlockedDate: new Date(),
      });
    };

    // Check quest achievements
    if (questsCompleted >= 1) unlockAchievement('ach-first-quest');
    if (questsCompleted >= 5) unlockAchievement('ach-5-quests');
    if (questsCompleted >= 25) unlockAchievement('ach-25-quests');
    if (questsCompleted >= 100) unlockAchievement('ach-100-quests');

    // Check question-based achievements
    const questionsAnswered = updatedCharacter.questionsAnswered || 0;
    if (questionsAnswered >= 1) unlockAchievement('ach-first-question');
    if (questionsAnswered >= 5) unlockAchievement('ach-5-questions');
    if (questionsAnswered >= 25) unlockAchievement('ach-25-questions');
    if (questionsAnswered >= 100) unlockAchievement('ach-100-questions');

    // Check streak achievements
    if (currentStreak >= 3) unlockAchievement('ach-3-streak');
    if (currentStreak >= 7) unlockAchievement('ach-7-streak');
    if (currentStreak >= 30) unlockAchievement('ach-streak-30');
    if (currentStreak >= 100) unlockAchievement('ach-100-streak');

    // Check distance achievements
    if (totalDistance >= 10) unlockAchievement('ach-10km');
    if (totalDistance >= 50) unlockAchievement('ach-50km');
    if (totalDistance >= 100) unlockAchievement('ach-100km');

    // Check level achievements
    const level = updatedCharacter.stats.level;
    if (level >= 5) unlockAchievement('ach-level-5');
    if (level >= 10) unlockAchievement('ach-level-10');
    if (level >= 25) unlockAchievement('ach-level-25');
    if (level >= 50) unlockAchievement('ach-level-50');

    // Check mindfulness clears
    const mindfulnessClears = updatedCharacter.activities?.filter(a => a.type === 'mindfulness').length || 0;
    if (mindfulnessClears >= 20) unlockAchievement('ach-mindful');

    // Check mode mastery (all 4 mini-game types)
    const completedTypes = new Set(updatedCharacter.activities?.map(a => a.type) || []);
    if (['fitness', 'nutrition', 'mindfulness', 'sleep'].every(type => completedTypes.has(type as Activity['type']))) {
      unlockAchievement('ach-balanced');
    }

    // Check category mastery for question quests (all 4 Categories)
    if (['fitness', 'nutrition', 'mindfulness', 'sleep'].every(type => completedTypes.has(type as Activity['type']))) {
      unlockAchievement('ach-all-categories');
    }

    return {
      ...updatedCharacter,
      achievements,
    };
  };

  // Update Challenge Progress
  const updateChallengeProgress = (updatedCharacter: Character, activity: Activity): Character => {
    const tierChallenges = updatedCharacter.activeTierChallenges || [];
    const earnedAchievementIds: string[] = [];
    let totalMilestoneBonus = 0;

    // Check if challenge objectives are met based on modifiers and rank requirements
    const isChallengeActivatable = (challenge: Challenge, activity: Activity): boolean => {
      // Check type match
      if (challenge.type !== activity.type) return false;

      // Check modifier constraints
      if (challenge.modifier) {
        if (challenge.modifier === 'perfect-only' && activity.rank !== 'S') return false;
        if (challenge.modifier === 'speed-run' && (activity.duration || 0) > 45) return false; // Must complete in <45s
        // if (challenge.modifier === 'no-boost' && activity.stats?.usedBoosts) return false;
        if (challenge.modifier === 'hardcore' && activity.rank !== 'S') return false;
      }

      return true;
    };

    // Check milestone reached
    const getMilestoneBonus = (progress: number, milestones?: number[]): { milestones: number[], bonus: number } => {
      const defaultMilestones = [0.25, 0.5, 0.75, 1.0];
      const ms = milestones || defaultMilestones;
      const completedMilestones: number[] = [];
      let bonus = 0;

      ms.forEach(milestone => {
        if (progress >= milestone && !completedMilestones.includes(milestone)) {
          completedMilestones.push(milestone);
          bonus += Math.round(50 * milestone); // 12.5, 25, 37.5, 50 at each milestone
        }
      });

      return { milestones: completedMilestones, bonus };
    };

    const updatedTierChallenges = tierChallenges.map(challenge => {
      if (challenge.completed) return challenge; // Skip completed challenges

      if (!isChallengeActivatable(challenge, activity)) return challenge; // Skip if modifiers don't match

      let progressIncrement = 0;

      // Determine progress increment based on challenge type
      if (challenge.unit === 'S-ranks') {
        if (activity.rank === 'S') progressIncrement = 1;
      } else if (challenge.unit === 'A-ranks') {
        if (activity.rank === 'A') progressIncrement = 1;
        else if (activity.rank === 'S') progressIncrement = 0; // S ranks don't count for A-rank challenges
      } else if (challenge.unit === 'ranks') {
        if (activity.rank === 'S') progressIncrement = 1;
        else if (activity.rank === 'A') progressIncrement = 0.5; // A ranks count as 0.5 progress
      } else if (challenge.unit === 'perfect sessions' || challenge.unit === 'perfect meals' || challenge.unit === 'activities' || challenge.unit === 'sessions') {
        progressIncrement = 1;
      } else if (challenge.unit === 'km' && activity.distance) {
        progressIncrement = activity.distance;
      } else if (challenge.unit === 'seconds') {
        progressIncrement = (activity.duration || 0);
      }

      const newProgress = challenge.current + progressIncrement;
      const progressRatio = Math.min(newProgress / challenge.target, 1.0);

      // Check milestones
      const previousRatio = challenge.current / challenge.target;
      const { bonus: milestoneBonus } = getMilestoneBonus(progressRatio);
      if (milestoneBonus > 0) {
        totalMilestoneBonus += milestoneBonus;
      }

      const completed = newProgress >= challenge.target;

      // Don't auto-award rewards - wait for manual claim
      // if (completed && !challenge.claimed) {
      //   const challengeBonus = Math.round(challenge.reward.experience * (challenge.comboBonus || 1.0));
      //   updatedCharacter.stats.experience += challenge.reward.experience + challengeBonus;
      //   updatedCharacter.gold += challenge.reward.gold;

      //   if (challenge.reward.achievement) {
      //     earnedAchievementIds.push(challenge.reward.achievement);
      //   }
      // }

      return {
        ...challenge,
        current: Math.min(newProgress, challenge.target),
        completed,
      };
    });

    // Update character with milestone bonuses
    if (totalMilestoneBonus > 0) {
      updatedCharacter.stats.experience += totalMilestoneBonus;
    }

    // Handle old-style challenges still in activeChallenges
    const activeChallenges = updatedCharacter.activeChallenges || [];
    const updatedLegacyChallenges = activeChallenges.map(challenge => {
      if (challenge.type === activity.type && !challenge.completed) {
        let progress = challenge.current;

        // Update based on challenge unit
        if (challenge.unit === 'activities' || challenge.unit === 'sessions' || challenge.unit === 'days') {
          progress += 1;
        } else if (challenge.unit === 'km' && activity.distance) {
          progress += activity.distance;
        }

        const completed = progress >= challenge.target;

        if (completed) {
          // Award rewards
          updatedCharacter.stats.experience += challenge.reward.experience;
          updatedCharacter.gold += challenge.reward.gold;

          if (challenge.reward.achievement) {
            earnedAchievementIds.push(challenge.reward.achievement);
          }
        }

        return {
          ...challenge,
          current: progress,
          completed,
        };
      }
      return challenge;
    });

    const achievements = [...(updatedCharacter.achievements || [])];
    earnedAchievementIds.forEach((achievementId) => {
      if (achievements.find(a => a.id === achievementId)) return;
      const achievementTemplate = allAchievements.find(a => a.id === achievementId);
      if (!achievementTemplate) return;
      achievements.push({
        ...achievementTemplate,
        unlockedDate: new Date(),
      });
    });

    return {
      ...updatedCharacter,
      achievements,
      activeTierChallenges: updatedTierChallenges,
      activeChallenges: updatedLegacyChallenges,
    };
  };

  // Calculate Equipment Buffs
  const getEquipmentBuffs = (questType?: QuestType): EquipmentBuffs => {
    if (!character) {
      return { xpMultiplier: 1, goldMultiplier: 1, speedBoost: 0, accuracyBoost: 0 };
    }

    let buffs: EquipmentBuffs = {
      xpMultiplier: 1,
      goldMultiplier: 1,
      speedBoost: 0,
      accuracyBoost: 0,
    };

    const starterItemTypeByName: Record<string, QuestType> = {
      '⚡ Fitness Ring': 'fitness',
      '🥗 Nutritionist\'s Badge': 'nutrition',
      '🧘 Serenity Amulet': 'mindfulness',
      '😴 Dream Weaver\'s Charm': 'sleep',
    };

    const primaryWellnessStat = character.primaryWellnessStat ?? inferPrimaryWellnessStat(character);
    const hasEquippedStarterItem = Object.values(character.equippedItems || {}).some((itemId) => {
      if (!itemId) return false;
      const item = character.inventory.find((inventoryItem) => inventoryItem.id === itemId);
      return item ? starterItemTypeByName[item.name] === primaryWellnessStat : false;
    });

    // Check equipped items
    Object.values(character.equippedItems).forEach(itemId => {
      if (!itemId) return;
      const item = character.inventory.find(i => i.id === itemId);
      if (item && item.buffs) {
        // Starter survey item boosts XP only for the matching quest type.
        const starterItemType = starterItemTypeByName[item.name];
        const isTypeSpecificItem = Boolean(starterItemType);
        
        if (isTypeSpecificItem && questType) {
          if (starterItemType === questType) {
            buffs.xpMultiplier *= item.buffs.xpMultiplier || 1;
            buffs.goldMultiplier *= item.buffs.goldMultiplier || 1;
          }
        } else if (!isTypeSpecificItem) {
          // Apply generic buffs from other items
          buffs.xpMultiplier *= item.buffs.xpMultiplier || 1;
          buffs.goldMultiplier *= item.buffs.goldMultiplier || 1;
        }
        
        buffs.speedBoost += item.buffs.speedBoost || 0;
        buffs.accuracyBoost += item.buffs.accuracyBoost || 0;
      }
    });

    if (questType && primaryWellnessStat === questType && !hasEquippedStarterItem) {
      buffs.xpMultiplier *= 1.5;
    }

    return buffs;
  };

  // Calculate Rank based on score
  const calculateRank = (score: number, type: QuestType): 'S' | 'A' | 'B' | 'C' | 'D' => {
    // Rank thresholds vary by game type
    const thresholds = {
      fitness: { S: 9500, A: 8000, B: 6500, C: 5000 },
      mindfulness: { S: 9000, A: 7500, B: 6000, C: 4500 },
      nutrition: { S: 9500, A: 8000, B: 6500, C: 5000 },
      sleep: { S: 9000, A: 7500, B: 6000, C: 4500 },
    };

    const typeThresholds = thresholds[type];
    if (score >= typeThresholds.S) return 'S';
    if (score >= typeThresholds.A) return 'A';
    if (score >= typeThresholds.B) return 'B';
    if (score >= typeThresholds.C) return 'C';
    return 'D';
  };

  const value: GameContextType = {
    // Authentication
    user,
    isLoggedIn,
    isAuthLoading,
    login,
    register,
    logout,
    // Game
    character,
    gameState,
    createCharacter,
    completeQuest,
    acceptQuest,
    startGame,
    finishGame,
    cancelGame,
    addGold,
    addExperience,
    buyItem,
    equipItem,
    unequipItem,
    equipCustomization,
    unequipCustomization,
    useConsumable,
    saveGame,
    loadGame,
    completeAssessment,
    giveKudos,
    joinChallenge,
    acceptChallenge,
    startChallenge,
    completeChallenge,
    claimTierChallengeReward,
    getEquipmentBuffs,
    calculateRank,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}

