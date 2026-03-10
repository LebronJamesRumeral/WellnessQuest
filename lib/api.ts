import { supabase } from './supabase';
import {
  Character,
  InventoryItem,
  Achievement,
  Activity,
  GameSession,
  Challenge,
  AssessmentResult,
  Quest,
  QuestType,
} from './types';

// ============== Authentication ==============

export const authApi = {
  buildFallbackUsername(email: string) {
    const base = (email.split('@')[0] || 'user')
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .slice(0, 20);
    const suffix = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `${base}_${suffix}`;
  },

  async signUp(email: string, password: string, username: string) {
    try {
      // Create auth user (profile will be created automatically via database trigger)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          },
          emailRedirectTo: undefined, // Disable email confirmation redirect
        },
      });

      if (authError) {
        console.error('Supabase signUp error:', authError);
        throw new Error(authError.message || 'Failed to create account');
      }

      if (!authData.user) {
        throw new Error('Failed to create user - no user data returned');
      }

      console.log('User created successfully:', authData.user.id);

      // Return the auth data - profile is created automatically by database trigger
      return { user: authData.user, session: authData.session };
    } catch (error: any) {
      console.error('SignUp error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  },

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Supabase signIn error:', error);
        throw new Error(error.message || 'Login failed');
      }

      if (!data.user) {
        throw new Error('No user data returned from login');
      }

      return data;
    } catch (error: any) {
      console.error('SignIn error:', error);
      throw new Error(error.message || 'Login failed');
    }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!error && data) return data;

    // If profile is missing, self-heal by creating one for existing auth users.
    if (error && error.code !== 'PGRST116') {
      console.error('Get profile error:', error);
      throw new Error(error.message || 'Failed to load profile');
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error(userError?.message || 'Unable to get authenticated user');
    }

    if (user.id !== userId) {
      throw new Error('Profile access denied');
    }

    const preferredUsername =
      ((user.user_metadata?.username as string | undefined) || '').trim() ||
      authApi.buildFallbackUsername(user.email || 'user');

    const { data: insertedProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        username: preferredUsername,
      })
      .select('*')
      .single();

    if (insertError) {
      // If username already exists, retry with guaranteed-unique fallback.
      if (insertError.code === '23505') {
        const retryUsername = authApi.buildFallbackUsername(user.email || 'user');
        const { data: retryProfile, error: retryError } = await supabase
          .from('profiles')
          .insert({
            user_id: userId,
            username: retryUsername,
          })
          .select('*')
          .single();

        if (retryError) {
          console.error('Create profile retry error:', retryError);
          throw new Error(retryError.message || 'Failed to create user profile');
        }

        return retryProfile;
      }

      console.error('Create profile error:', insertError);
      throw new Error(insertError.message || 'Failed to create user profile');
    }

    return insertedProfile;
  },
};

// ============== Character ==============

export const characterApi = {
  async createCharacter(userId: string, name: string): Promise<Character> {
    const character = {
      user_id: userId,
      name,
      level: 1,
      experience: 0,
      health: 100,
      max_health: 100,
      strength: 10,
      endurance: 10,
      wisdom: 10,
      agility: 10,
      gold: 50,
      quests_completed: 0,
      questions_answered: 0,
      current_streak: 0,
      longest_streak: 0,
      current_combo_streak: 0,
      max_combo_streak: 0,
      combo_multiplier: 1.0,
      joined_date: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('characters')
      .insert(character)
      .select()
      .single();

    if (error) throw error;

    // Initialize equipped items and customizations
    await supabase.from('equipped_items').insert({ character_id: data.id });
    await supabase.from('equipped_customizations').insert({ character_id: data.id });

    // Initialize personal bests for all quest types
    const questTypes: QuestType[] = ['fitness', 'nutrition', 'mindfulness', 'sleep'];
    const personalBests = questTypes.map(type => ({
      character_id: data.id,
      quest_type: type,
      best_time: 999999,
      best_score: 0,
      total_clears: 0,
      avg_time: 0,
    }));

    await supabase.from('personal_bests').insert(personalBests);

    return this.mapCharacterFromDb(data);
  },

  async getCharacter(userId: string): Promise<Character | null> {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return this.mapCharacterFromDb(data);
  },

  async updateCharacter(characterId: string, updates: Partial<Character>) {
    const dbUpdates: any = {};

    if (updates.stats) {
      Object.assign(dbUpdates, {
        level: updates.stats.level,
        experience: updates.stats.experience,
        health: updates.stats.health,
        max_health: updates.stats.maxHealth,
        strength: updates.stats.strength,
        endurance: updates.stats.endurance,
        wisdom: updates.stats.wisdom,
        agility: updates.stats.agility,
      });
    }

    if (updates.gold !== undefined) dbUpdates.gold = updates.gold;
    if (updates.questsCompleted !== undefined) dbUpdates.quests_completed = updates.questsCompleted;
    if (updates.questionsAnswered !== undefined) dbUpdates.questions_answered = updates.questionsAnswered;
    if (updates.currentStreak !== undefined) dbUpdates.current_streak = updates.currentStreak;
    if (updates.longestStreak !== undefined) dbUpdates.longest_streak = updates.longestStreak;
    if (updates.currentComboStreak !== undefined) dbUpdates.current_combo_streak = updates.currentComboStreak;
    if (updates.maxComboStreak !== undefined) dbUpdates.max_combo_streak = updates.maxComboStreak;
    if (updates.comboMultiplier !== undefined) dbUpdates.combo_multiplier = updates.comboMultiplier;
    if (updates.weeklyGoal !== undefined) dbUpdates.weekly_goal = updates.weeklyGoal;
    if (updates.dailyQuestRefreshDate) dbUpdates.daily_quest_refresh_date = updates.dailyQuestRefreshDate;

    const { error } = await supabase
      .from('characters')
      .update(dbUpdates)
      .eq('id', characterId);

    if (error) throw error;
  },

  mapCharacterFromDb(data: any): Character {
    return {
      id: data.id,
      name: data.name,
      stats: {
        level: data.level,
        experience: data.experience,
        health: data.health,
        maxHealth: data.max_health,
        strength: data.strength,
        endurance: data.endurance,
        wisdom: data.wisdom,
        agility: data.agility,
      },
      gold: data.gold,
      inventory: [],
      equippedItems: {},
      equippedCustomizations: {},
      questsCompleted: data.quests_completed,
      questionsAnswered: data.questions_answered,
      joinedDate: new Date(data.joined_date),
      achievements: [],
      activities: [],
      currentStreak: data.current_streak,
      longestStreak: data.longest_streak,
      weeklyGoal: data.weekly_goal,
      currentComboStreak: data.current_combo_streak,
      maxComboStreak: data.max_combo_streak,
      comboMultiplier: data.combo_multiplier,
      activeTierChallenges: [],
      gameSessions: [],
      personalBests: {
        fitness: { bestTime: Infinity, bestScore: 0, totalClears: 0, avgTime: 0 },
        mindfulness: { bestTime: Infinity, bestScore: 0, totalClears: 0, avgTime: 0 },
        nutrition: { bestTime: Infinity, bestScore: 0, totalClears: 0, avgTime: 0 },
        sleep: { bestTime: Infinity, bestScore: 0, totalClears: 0, avgTime: 0 },
      },
      dailyQuestRefreshDate: data.daily_quest_refresh_date ? new Date(data.daily_quest_refresh_date) : undefined,
    };
  },
};

// ============== Inventory ==============

export const inventoryApi = {
  async getInventory(characterId: string): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('character_id', characterId);

    if (error) throw error;

    return data.map(item => ({
      id: item.id,
      name: item.name,
      type: item.type as any,
      rarity: item.rarity as any,
      quantity: item.quantity,
      description: item.description,
      stats: item.stats,
      buffs: item.buffs,
    }));
  },

  async addItem(characterId: string, item: Omit<InventoryItem, 'id'>) {
    const { error } = await supabase
      .from('inventory_items')
      .insert({
        character_id: characterId,
        item_id: Math.random().toString(36).substr(2, 9),
        name: item.name,
        type: item.type,
        rarity: item.rarity,
        quantity: item.quantity,
        description: item.description,
        stats: item.stats,
        buffs: item.buffs,
      });

    if (error) throw error;
  },

  async updateItemQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', itemId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('inventory_items')
        .update({ quantity })
        .eq('id', itemId);
      if (error) throw error;
    }
  },

  async getEquippedItems(characterId: string) {
    const { data, error } = await supabase
      .from('equipped_items')
      .select('*')
      .eq('character_id', characterId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return data ? {
      weapon: data.weapon,
      armor: data.armor,
      accessory: data.accessory,
    } : {};
  },

  async updateEquippedItems(characterId: string, slot: string, itemId: string | null) {
    const { error } = await supabase
      .from('equipped_items')
      .update({ [slot]: itemId })
      .eq('character_id', characterId);

    if (error) throw error;
  },

  async getEquippedCustomizations(characterId: string) {
    const { data, error } = await supabase
      .from('equipped_customizations')
      .select('*')
      .eq('character_id', characterId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return data ? {
      armorColor: data.armor_color,
      armorStyle: data.armor_style,
      helmet: data.helmet,
      cloak: data.cloak,
      aura: data.aura,
    } : {};
  },

  async updateEquippedCustomizations(characterId: string, category: string, customizationId: string | null) {
    const columnMap: Record<string, string> = {
      armorColor: 'armor_color',
      armorStyle: 'armor_style',
      helmet: 'helmet',
      cloak: 'cloak',
      aura: 'aura',
    };

    const { error } = await supabase
      .from('equipped_customizations')
      .update({ [columnMap[category]]: customizationId })
      .eq('character_id', characterId);

    if (error) throw error;
  },
};

// ============== Achievements ==============

export const achievementsApi = {
  async getAchievements(characterId: string): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('character_id', characterId);

    if (error) throw error;

    return data.map(ach => ({
      id: ach.id,
      name: ach.name,
      description: ach.description,
      icon: ach.icon,
      category: ach.category as any,
      tier: ach.tier as any,
      progress: ach.progress ?? undefined,
      target: ach.target ?? undefined,
      unlockedDate: ach.unlocked_date ? new Date(ach.unlocked_date) : undefined,
    }));
  },

  async addAchievement(characterId: string, achievement: Achievement) {
    const { error } = await supabase
      .from('achievements')
      .insert({
        character_id: characterId,
        achievement_id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        category: achievement.category,
        tier: achievement.tier,
        progress: achievement.progress,
        target: achievement.target,
        unlocked_date: achievement.unlockedDate?.toISOString(),
      });

    if (error) throw error;
  },

  async updateAchievement(achievementId: string, progress: number, unlocked?: Date) {
    const { error } = await supabase
      .from('achievements')
      .update({
        progress,
        unlocked_date: unlocked?.toISOString(),
      })
      .eq('id', achievementId);

    if (error) throw error;
  },
};

// ============== Activities ==============

export const activitiesApi = {
  async getActivities(characterId: string): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*, activity_comments(*)')
      .eq('character_id', characterId)
      .order('date', { ascending: false });

    if (error) throw error;

    return data.map(act => ({
      id: act.id,
      title: act.title,
      type: act.type as QuestType,
      description: act.description,
      distance: act.distance ?? undefined,
      duration: act.duration,
      calories: act.calories ?? undefined,
      date: new Date(act.date),
      kudos: act.kudos,
      comments: act.activity_comments.map((c: any) => ({
        id: c.id,
        userId: c.user_id,
        userName: c.user_name,
        text: c.text,
        date: new Date(c.date),
      })),
      stats: act.stats,
      sessionId: act.session_id ?? undefined,
      rank: act.rank as any,
      score: act.score ?? undefined,
    }));
  },

  async getAllActivities(limit: number = 20): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*, activity_comments(*), characters(name)')
      .order('date', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data.map(act => ({
      id: act.id,
      title: act.title,
      type: act.type as QuestType,
      description: act.description,
      distance: act.distance ?? undefined,
      duration: act.duration,
      calories: act.calories ?? undefined,
      date: new Date(act.date),
      kudos: act.kudos,
      comments: act.activity_comments.map((c: any) => ({
        id: c.id,
        userId: c.user_id,
        userName: c.user_name,
        text: c.text,
        date: new Date(c.date),
      })),
      stats: act.stats,
      sessionId: act.session_id ?? undefined,
      rank: act.rank as any,
      score: act.score ?? undefined,
    }));
  },

  async addActivity(characterId: string, activity: Omit<Activity, 'id' | 'kudos' | 'comments'>) {
    const { error } = await supabase
      .from('activities')
      .insert({
        character_id: characterId,
        title: activity.title,
        type: activity.type,
        description: activity.description,
        distance: activity.distance,
        duration: activity.duration,
        calories: activity.calories,
        date: activity.date.toISOString(),
        kudos: 0,
        session_id: activity.sessionId,
        rank: activity.rank,
        score: activity.score,
        stats: activity.stats,
      });

    if (error) throw error;
  },

  async giveKudos(activityId: string) {
    // Increment kudos count
    const { error } = await supabase.rpc('increment_kudos', {
      activity_id: activityId,
    });

    // If the RPC doesn't exist, fall back to a manual approach
    if (error && error.code === '42883') {
      const { data: activity } = await supabase
        .from('activities')
        .select('kudos')
        .eq('id', activityId)
        .single();

      if (activity) {
        await supabase
          .from('activities')
          .update({ kudos: activity.kudos + 1 })
          .eq('id', activityId);
      }
    } else if (error) {
      throw error;
    }
  },

  async addComment(activityId: string, userId: string, userName: string, text: string) {
    const { error } = await supabase
      .from('activity_comments')
      .insert({
        activity_id: activityId,
        user_id: userId,
        user_name: userName,
        text,
      });

    if (error) throw error;
  },
};

// ============== Game Sessions ==============

export const gameSessionsApi = {
  async addGameSession(characterId: string, session: Omit<GameSession, 'id'>) {
    const { error } = await supabase
      .from('game_sessions')
      .insert({
        character_id: characterId,
        quest_id: session.questId,
        quest_type: session.questType,
        completion_time: session.completionTime,
        score: session.score,
        rank: session.rank,
        accuracy: session.accuracy,
        is_perfect: session.isPerfect,
        is_personal_best: session.isPersonalBest,
        date: session.date.toISOString(),
        rewards: session.rewards,
      });

    if (error) throw error;
  },

  async getGameSessions(characterId: string): Promise<GameSession[]> {
    const { data, error } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('character_id', characterId)
      .order('date', { ascending: false });

    if (error) throw error;

    return data.map(session => ({
      id: session.id,
      questId: session.quest_id,
      questType: session.quest_type as QuestType,
      completionTime: session.completion_time,
      score: session.score,
      rank: session.rank as any,
      accuracy: session.accuracy ?? undefined,
      isPerfect: session.is_perfect,
      isPersonalBest: session.is_personal_best,
      date: new Date(session.date),
      rewards: session.rewards,
    }));
  },

  async updatePersonalBests(characterId: string, questType: QuestType, updates: any) {
    const { error } = await supabase
      .from('personal_bests')
      .update({
        best_time: updates.bestTime,
        best_score: updates.bestScore,
        total_clears: updates.totalClears,
        avg_time: updates.avgTime,
      })
      .eq('character_id', characterId)
      .eq('quest_type', questType);

    if (error) throw error;
  },

  async getPersonalBests(characterId: string) {
    const { data, error } = await supabase
      .from('personal_bests')
      .select('*')
      .eq('character_id', characterId);

    if (error) throw error;

    const bests: any = {
      fitness: { bestTime: Infinity, bestScore: 0, totalClears: 0, avgTime: 0 },
      mindfulness: { bestTime: Infinity, bestScore: 0, totalClears: 0, avgTime: 0 },
      nutrition: { bestTime: Infinity, bestScore: 0, totalClears: 0, avgTime: 0 },
      sleep: { bestTime: Infinity, bestScore: 0, totalClears: 0, avgTime: 0 },
    };

    data.forEach(pb => {
      bests[pb.quest_type] = {
        bestTime: pb.best_time,
        bestScore: pb.best_score,
        totalClears: pb.total_clears,
        avgTime: pb.avg_time,
      };
    });

    return bests;
  },
};

// ============== Challenges ==============

export const challengesApi = {
  async getChallenges(characterId: string): Promise<Challenge[]> {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('character_id', characterId);

    if (error) throw error;

    return data.map(ch => ({
      id: ch.id,
      name: ch.name,
      description: ch.description,
      type: ch.type as QuestType,
      tier: ch.tier as any,
      difficulty: ch.difficulty as any,
      target: ch.target,
      current: ch.current,
      unit: ch.unit,
      startDate: new Date(ch.start_date),
      endDate: new Date(ch.end_date),
      reward: ch.reward,
      participants: ch.participants,
      completed: ch.completed,
      claimed: ch.claimed,
      accepted: ch.accepted,
      inProgress: ch.in_progress,
      questionsAnswered: ch.questions_answered ?? undefined,
      correctAnswers: ch.correct_answers ?? undefined,
      milestones: ch.milestones,
      leaderboard: ch.leaderboard,
      modifier: ch.modifier as any,
      comboBonus: ch.combo_bonus ?? undefined,
    }));
  },

  async addChallenge(characterId: string, challenge: Challenge) {
    const { error } = await supabase
      .from('challenges')
      .insert({
        character_id: characterId,
        challenge_id: challenge.id,
        name: challenge.name,
        description: challenge.description,
        type: challenge.type,
        tier: challenge.tier,
        difficulty: challenge.difficulty,
        target: challenge.target,
        current: challenge.current,
        unit: challenge.unit,
        start_date: challenge.startDate.toISOString(),
        end_date: challenge.endDate.toISOString(),
        reward: challenge.reward,
        participants: challenge.participants,
        completed: challenge.completed,
        claimed: challenge.claimed ?? false,
        accepted: challenge.accepted ?? false,
        in_progress: challenge.inProgress ?? false,
        questions_answered: challenge.questionsAnswered,
        correct_answers: challenge.correctAnswers,
        milestones: challenge.milestones,
        leaderboard: challenge.leaderboard,
        modifier: challenge.modifier,
        combo_bonus: challenge.comboBonus,
      });

    if (error) throw error;
  },

  async updateChallenge(challengeId: string, updates: Partial<Challenge>) {
    const dbUpdates: any = {};
    if (updates.current !== undefined) dbUpdates.current = updates.current;
    if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
    if (updates.claimed !== undefined) dbUpdates.claimed = updates.claimed;
    if (updates.accepted !== undefined) dbUpdates.accepted = updates.accepted;
    if (updates.inProgress !== undefined) dbUpdates.in_progress = updates.inProgress;
    if (updates.questionsAnswered !== undefined) dbUpdates.questions_answered = updates.questionsAnswered;
    if (updates.correctAnswers !== undefined) dbUpdates.correct_answers = updates.correctAnswers;

    const { error } = await supabase
      .from('challenges')
      .update(dbUpdates)
      .eq('id', challengeId);

    if (error) throw error;
  },
};

// ============== Assessment ==============

export const assessmentApi = {
  async saveAssessmentResult(characterId: string, result: AssessmentResult) {
    const { error } = await supabase
      .from('assessment_results')
      .insert({
        character_id: characterId,
        profile: result.profile,
        scores: result.scores,
        recommended_quests: result.recommendedQuests,
        completed_date: result.completedDate.toISOString(),
      });

    if (error) throw error;
  },

  async getAssessmentResult(characterId: string): Promise<AssessmentResult | null> {
    const { data, error } = await supabase
      .from('assessment_results')
      .select('*')
      .eq('character_id', characterId)
      .order('completed_date', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    return {
      profile: data.profile as any,
      scores: data.scores,
      recommendedQuests: data.recommended_quests,
      completedDate: new Date(data.completed_date),
    };
  },
};

// ============== Quests ==============

export const questsApi = {
  async getQuests(characterId: string): Promise<Quest[]> {
    const { data, error } = await supabase
      .from('quests')
      .select('*')
      .eq('character_id', characterId);

    if (error) throw error;

    return data.map(q => ({
      id: q.quest_id,
      title: q.title,
      description: q.description,
      type: q.type as QuestType,
      difficulty: q.difficulty as any,
      rewards: q.rewards,
      requirements: q.requirements,
      completed: q.completed,
      completedDate: q.completed_date ? new Date(q.completed_date) : undefined,
      progress: q.progress ?? undefined,
      target: q.target ?? undefined,
    }));
  },

  async addQuest(characterId: string, quest: Quest) {
    const { error } = await supabase
      .from('quests')
      .insert({
        character_id: characterId,
        quest_id: quest.id,
        title: quest.title,
        description: quest.description,
        type: quest.type,
        difficulty: quest.difficulty,
        rewards: quest.rewards,
        requirements: quest.requirements,
        completed: quest.completed,
        completed_date: quest.completedDate?.toISOString(),
        progress: quest.progress,
        target: quest.target,
      });

    if (error) throw error;
  },

  async updateQuest(questId: string, updates: Partial<Quest>) {
    const dbUpdates: any = {};
    if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
    if (updates.completedDate) dbUpdates.completed_date = updates.completedDate.toISOString();
    if (updates.progress !== undefined) dbUpdates.progress = updates.progress;

    const { error } = await supabase
      .from('quests')
      .update(dbUpdates)
      .eq('quest_id', questId);

    if (error) throw error;
  },
};

// ============== Leaderboard ==============

export const leaderboardApi = {
  async addEntry(characterId: string, characterName: string, questType: QuestType, score: number, rank: string, completionTime: number) {
    const { error } = await supabase
      .from('leaderboard')
      .insert({
        character_id: characterId,
        character_name: characterName,
        quest_type: questType,
        score,
        rank,
        completion_time: completionTime,
        date: new Date().toISOString(),
      });

    if (error) throw error;
  },

  async getLeaderboard(questType?: QuestType, limit: number = 100) {
    let query = supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(limit);

    if (questType) {
      query = query.eq('quest_type', questType);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  async getPlayerRank(characterId: string, questType: QuestType) {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('character_id, score')
      .eq('quest_type', questType)
      .order('score', { ascending: false });

    if (error) throw error;

    const playerEntry = data.find((entry: any) => entry.character_id === characterId);
    if (!playerEntry) return null;

    const rank = data.findIndex((entry: any) => entry.character_id === characterId) + 1;
    return { rank, totalPlayers: data.length };
  },

  async getHallOfChampions(limit: number = 100) {
    const [{ data: characters, error: charactersError }, { data: profiles, error: profilesError }] = await Promise.all([
      supabase
        .from('characters')
        .select('id, user_id, name, level, experience, quests_completed, current_streak, current_combo_streak')
        .limit(limit * 5),
      supabase
        .from('profiles')
        .select('user_id, username')
        .limit(limit * 5),
    ]);

    if (charactersError) throw charactersError;

    const profileMap = new Map<string, string>();
    if (!profilesError) {
      (profiles || []).forEach((profile: any) => {
        profileMap.set(profile.user_id, profile.username);
      });
    }

    const charactersByUser = new Map<string, any>();
    (characters || []).forEach((row: any) => {
      const existing = charactersByUser.get(row.user_id);
      if (!existing) {
        charactersByUser.set(row.user_id, row);
      }
    });

    const entries: Array<{ characterId: string; name: string; level: number; xp: number }> = [];

    // Include users with profiles even if they have no character yet.
    profileMap.forEach((username, userId) => {
      const row = charactersByUser.get(userId);
      if (row) {
        const xp = Math.max(0, ((row.level - 1) * 100) + row.experience);
        entries.push({
          characterId: row.id,
          name: row.name || username,
          level: Math.max(1, row.level || 1),
          xp,
        });
      } else {
        entries.push({
          characterId: `profile-${userId}`,
          name: username,
          level: 1,
          xp: 0,
        });
      }
    });

    // Fallback for any character rows where profile query is restricted.
    if (entries.length === 0) {
      (characters || []).forEach((row: any) => {
        const xp = Math.max(0, ((row.level - 1) * 100) + row.experience);
        entries.push({
          characterId: row.id,
          name: row.name,
          level: Math.max(1, row.level || 1),
          xp,
        });
      });
    }

    return entries
      .sort((left, right) => right.xp - left.xp)
      .slice(0, limit);
  },
};
