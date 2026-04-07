'use client';

import { useEffect, useRef, useState } from 'react';
import { useGame } from '@/lib/context';
import { leaderboardApi } from '@/lib/api';
import { XP_PER_LEVEL, getLevelProgress, getTotalXp } from '@/lib/progression';
import StatsOverview from './StatsOverview';
import ActivityFeed from './ActivityFeed';
import AchievementsGrid from './AchievementsGrid';
import ChallengesList from './ChallengesList';
import QuestBoard from './QuestBoard';
import Inventory from './Inventory';
import Shop from './Shop';
import Profile from './Profile';
import StatsView from './StatsView';
import Navigation from './Navigation';
import ViewTransitionSkeleton from './ViewTransitionSkeleton';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trophy, Crown, TrendingUp, Flame, Target, Zap, Coins, Sparkles, Swords, Map as MapIcon, Scroll, Backpack, Store, BarChart3 } from 'lucide-react';

type ViewType = 'dashboard' | 'activities' | 'challenges' | 'achievements' | 'quests' | 'inventory' | 'shop' | 'profile' | 'stats';
type TransitionView = 'activities' | 'achievements' | 'quests' | 'stats';

const TRANSITION_VIEWS: TransitionView[] = ['activities', 'achievements', 'quests', 'stats'];

function isTransitionView(view: ViewType): view is TransitionView {
  return TRANSITION_VIEWS.includes(view as TransitionView);
}

export default function MainDashboard() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [transitionView, setTransitionView] = useState<TransitionView | null>(null);
  const [showActivitiesModal, setShowActivitiesModal] = useState(false);
  const [showWeeklyConquestsModal, setShowWeeklyConquestsModal] = useState(false);
  const [hallEntries, setHallEntries] = useState<Array<{
    characterId: string;
    name: string;
    level: number;
    xp: number;
    questsCompleted: number;
    trophies: number;
  }>>([]);
  const { character, gameState, giveKudos, joinChallenge } = useGame();
  const transitionTimerRef = useRef<number | null>(null);

  const handleViewChange = (view: ViewType) => {
    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }

    setCurrentView(view);

    if (isTransitionView(view)) {
      setTransitionView(view);
      transitionTimerRef.current = window.setTimeout(() => {
        setTransitionView(null);
        transitionTimerRef.current = null;
      }, 1400);
      return;
    }

    setTransitionView(null);
  };

  if (!character) return null;

  const joinedChallenges = character.activeChallenges || [];
  const allChallenges = (gameState?.availableChallenges || []).map((challenge) => {
    const activeChallenge = joinedChallenges.find((joined) => joined.id === challenge.id);
    return activeChallenge || challenge;
  });
  const unlockedAchievements = (character.achievements || []).filter((achievement) => Boolean(achievement.unlockedDate));
  const lockedAchievements = (gameState?.availableAchievements || []).filter(
    (achievement) => !unlockedAchievements.some((unlocked) => unlocked.id === achievement.id)
  );

  const joinedChallengeIds = joinedChallenges.map((challenge) => challenge.id);

  // Calculate stats for overview
  const today = new Date();
  const currentDay = today.getDay();
  const mondayOffset = currentDay === 0 ? 6 : currentDay - 1;
  const monday = new Date(today);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - mondayOffset);

  const weekDayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const activityDaySet = new Set(
    (character.activities || []).map((activity) => {
      const activityDate = new Date(activity.date);
      activityDate.setHours(0, 0, 0, 0);
      return activityDate.getTime();
    })
  );

  const weeklyCompletion = weekDayLabels.map((label, index) => {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + index);
    const timestamp = dayDate.getTime();
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    return {
      label,
      completed: activityDaySet.has(timestamp),
      isFuture: timestamp > endOfToday.getTime(),
    };
  });

  const weeklyProgress = weeklyCompletion.filter((day) => day.completed).length;
  const completedDaysThisWeek = weeklyCompletion.filter((day) => day.completed && !day.isFuture).length;
  const weeklyEpicStreak = (() => {
    let streak = 0;
    for (let index = weeklyCompletion.length - 1; index >= 0; index -= 1) {
      const day = weeklyCompletion[index];
      if (day.isFuture) continue;
      if (!day.completed) break;
      streak += 1;
    }
    return streak;
  })();
  const weeklyGoal = character.weeklyGoal || 7;
  const weeklyGoalProgress = Math.min((weeklyProgress / weeklyGoal) * 100, 100);
  const nextLevelXP = XP_PER_LEVEL;
  const playerXp = getTotalXp(character.stats.level, character.stats.experience);
  const xpProgress = getLevelProgress(character.stats.experience);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const data = await leaderboardApi.getHallOfChampions(200);
        if (mounted) {
          setHallEntries(data);
        }
      } catch (error) {
        console.error('Error loading hall of champions:', error);
        if (mounted) {
          setHallEntries([]);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const mergedLeaderboard = new Map<string, { name: string; level: number; xp: number; questsCompleted: number; trophies: number }>();
  [
    ...hallEntries,
    {
      characterId: character.id,
      name: character.name,
      level: character.stats.level,
      xp: playerXp,
      questsCompleted: character.questsCompleted || 0,
      trophies: unlockedAchievements.length,
    },
  ].forEach((entry) => {
    const existing = mergedLeaderboard.get(entry.characterId);
    if (!existing || entry.xp > existing.xp) {
      mergedLeaderboard.set(entry.characterId, {
        name: entry.name,
        level: entry.level,
        xp: entry.xp,
        questsCompleted: entry.questsCompleted,
        trophies: entry.trophies,
      });
    }
  });

  const leaderboard = Array.from(mergedLeaderboard.values())
    .sort((left, right) => right.xp - left.xp)
    .slice(0, 5)
    .map((entry, index) => ({
      rank: index + 1,
      name: entry.name,
      level: entry.level,
      xp: entry.xp,
      questsCompleted: entry.questsCompleted,
      trophies: entry.trophies,
    }));

  // Calculate active equipment buffs
  const equippedItemIds = Object.values(character.equippedItems || {}).filter(Boolean) as string[];
  let totalXpMult = 1;
  let totalGoldMult = 1;
  let totalSpeed = 0;
  let totalAccuracy = 0;
  const equippedItemCount = equippedItemIds.length;

  equippedItemIds.forEach((itemId) => {
    const item = character.inventory.find((i) => i.id === itemId);
    if (item && item.buffs) {
      totalXpMult *= item.buffs.xpMultiplier || 1;
      totalGoldMult *= item.buffs.goldMultiplier || 1;
      totalSpeed += item.buffs.speedBoost || 0;
      totalAccuracy += item.buffs.accuracyBoost || 0;
    }
  });

  const hasActiveBuffs = totalXpMult > 1 || totalGoldMult > 1 || totalSpeed > 0 || totalAccuracy > 0;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  const isTransitioning = transitionView === currentView && transitionView !== null;

  const weeklyConquestsContent = (
    <Card className="border-primary/20 bg-linear-to-br from-primary/10 via-card to-secondary/10">
      <CardHeader className="py-3 md:py-6 px-3 md:px-6">
        <CardTitle className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 text-lg md:text-base">
          <span className="flex items-center gap-2">
            <Swords className="w-5 h-5" />
            Weekly Conquests
          </span>
          <span className="text-xs md:text-sm text-muted-foreground break-all">{weeklyProgress} / {weeklyGoal} days</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 md:space-y-4 px-3 md:px-6 pb-3 md:pb-6">
        {character.activities && character.activities.length > 0 ? (
          <>
            <div className="grid grid-cols-7 gap-1 md:gap-2">
              {weeklyCompletion.map((day) => (
                <div key={day.label} className="text-center">
                  <div className="text-xs font-semibold text-muted-foreground mb-1 md:mb-2">{day.label}</div>
                  <div
                    className={`h-8 md:h-10 rounded-md flex items-center justify-center text-xs md:text-sm font-bold ${
                      day.completed
                        ? 'bg-secondary/20 text-secondary border border-secondary/30'
                        : day.isFuture
                          ? 'bg-card/40 border border-border/50 text-muted-foreground/60'
                          : 'bg-muted border border-border text-muted-foreground'
                    }`}
                  >
                    {day.completed ? '✓' : '·'}
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-1 md:space-y-2">
              <Progress value={weeklyGoalProgress} className="h-2" />
              <p className="text-xs md:text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{weeklyProgress}</span> / <span className="font-semibold text-foreground">{weeklyGoal}</span> days
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <Target className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Embark on your first quest and begin your legendary adventure!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentView={currentView} onViewChange={handleViewChange} />
      
      <main className="container mx-auto px-4 py-6 pb-20 max-w-7xl">
        {isTransitioning && (
          <div className="space-y-6">
            <ViewTransitionSkeleton view={transitionView || 'quests'} />
          </div>
        )}

        {!isTransitioning && (
          <>
        {currentView === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Swords className="w-8 h-8" />
                  Adventurer's Hall
                </h1>
                <p className="text-muted-foreground">Welcome back, {character.name}! Your legendary journey continues.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button onClick={() => setShowActivitiesModal(true)} variant="outline" size="sm" className="h-auto py-2 px-3">
                  <span className="hidden sm:inline text-sm">Quest History</span>
                  <span className="sm:hidden text-xs">History</span>
                </Button>
                <Button onClick={() => setShowWeeklyConquestsModal(true)} variant="outline" size="sm" className="h-auto py-2 px-3">
                  <span className="hidden sm:inline text-sm">Weekly Conquests</span>
                  <span className="sm:hidden text-xs">Weekly</span>
                </Button>
              </div>
            </div>

            <div className="grid gap-3 md:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-5">
              <Card>
                <CardContent className="py-3 px-3 md:pt-4 md:pb-4 space-y-0.5">
                  <div className="flex items-center gap-1 text-muted-foreground text-xs md:text-sm">
                    <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden md:inline">Hero Level</span>
                    <span className="md:hidden">Lvl</span>
                  </div>
                  <p className="text-xl md:text-2xl font-bold">{character.stats.level}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-3 px-3 md:pt-4 md:pb-4 space-y-0.5">
                  <div className="flex items-center gap-1 text-muted-foreground text-xs md:text-sm">
                    <Flame className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                    <span className="hidden md:inline">Victory Streak</span>
                    <span className="md:hidden">Streak</span>
                  </div>
                  <p className="text-xl md:text-2xl font-bold">{character.currentStreak || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-3 px-3 md:pt-4 md:pb-4 space-y-0.5">
                  <div className="flex items-center gap-1 text-muted-foreground text-xs md:text-sm">
                    <Zap className="h-3 w-3 md:h-4 md:w-4 text-secondary" />
                    Epic Combo
                  </div>
                  <p className="text-xl md:text-2xl font-bold">{character.currentComboStreak || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-3 px-3 md:pt-4 md:pb-4 space-y-0.5">
                  <div className="flex items-center gap-1 text-muted-foreground text-xs md:text-sm">
                    <Crown className="h-3 w-3 md:h-4 md:w-4 text-secondary" />
                    Trophies
                  </div>
                  <p className="text-xl md:text-2xl font-bold">{unlockedAchievements.length}</p>
                </CardContent>
              </Card>
              <Card className="col-span-2 sm:col-span-1 border-accent/50 bg-linear-to-br from-accent/10 to-accent/5">
                <CardContent className="py-3 px-3 md:pt-4 md:pb-4 space-y-1">
                  <div className="flex items-center gap-1 text-accent text-xs md:text-sm font-semibold">
                    <Sparkles className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden md:inline">Magic Enchantments</span>
                    <span className="md:hidden">Magic</span>
                  </div>
                  <div className="text-xs space-y-0.5 mt-1">
                    {hasActiveBuffs ? (
                      <>
                        {totalXpMult > 1 && <div className="text-accent">+{Math.round((totalXpMult - 1) * 100)}% XP</div>}
                        {totalGoldMult > 1 && <div className="text-accent">+{Math.round((totalGoldMult - 1) * 100)}% Gold</div>}
                        {totalSpeed > 0 && <div className="text-accent">+{totalSpeed}% Spd</div>}
                        {totalAccuracy > 0 && <div className="text-accent">+{totalAccuracy}% Acc</div>}
                      </>
                    ) : (
                      <div className="text-muted-foreground text-xs">Equip gear for power</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-12">
              <div className="space-y-4 md:space-y-6 lg:col-span-8">
                <Card className="border-primary/20 bg-linear-to-br from-primary/10 via-card to-secondary/10">
                  <CardHeader className="py-3 md:py-6 px-3 md:px-6">
                    <CardTitle className="flex flex-col md:flex-row items-start md:items-center justify-between gap-1 md:gap-2 text-lg md:text-base">
                      <span className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Hero's Progression
                      </span>
                      <span className="text-xs md:text-sm text-muted-foreground break-all">{character.stats.experience.toLocaleString()} / {nextLevelXP.toLocaleString()} XP</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 md:space-y-4 px-3 md:px-6 pb-3 md:pb-6">
                    <Progress value={xpProgress} className="h-2 md:h-3" />
                    <div className="grid grid-cols-3 gap-2 md:gap-3 text-sm">
                      <div className="rounded-md border border-border p-2 md:p-3">
                        <div className="text-xs md:text-sm text-muted-foreground">Epic Streak</div>
                        <div className="text-lg md:text-xl font-bold">{weeklyEpicStreak}</div>
                      </div>
                      <div className="rounded-md border border-border p-2 md:p-3">
                        <div className="text-xs md:text-sm text-muted-foreground">Weekly Raids</div>
                        <div className="text-lg md:text-xl font-bold">{completedDaysThisWeek}/{weeklyGoal}</div>
                      </div>
                      <div className="rounded-md border border-border p-2 md:p-3">
                        <div className="text-xs md:text-sm text-muted-foreground">Victories</div>
                        <div className="text-lg md:text-xl font-bold">{character.questsCompleted}</div>
                      </div>
                    </div>
                    <Button onClick={() => setCurrentView('profile')} variant="outline" className="w-full text-sm md:text-base">
                      View Hero Profile
                    </Button>
                  </CardContent>
                </Card>

                {character.activeTierChallenges && character.activeTierChallenges.length > 0 && (
                  <Card>
                    <CardHeader className="py-3 md:py-6 px-3 md:px-6">
                      <CardTitle className="flex items-center gap-2 text-lg md:text-base">
                        <Zap className="h-4 w-4 md:h-5 md:w-5 text-secondary" />
                        <span className="hidden md:inline">Epic Trials</span>
                        <span className="md:hidden">Trials</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 md:space-y-3 px-3 md:px-6 pb-3 md:pb-6">
                      {character.activeTierChallenges.slice(0, 3).map((challenge) => (
                        <div key={challenge.id} className="rounded-md border border-secondary/20 bg-secondary/10 p-2 md:p-3 space-y-1.5 md:space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-xs md:text-sm font-semibold truncate">{challenge.name}</div>
                            <span className="text-xs font-bold text-secondary whitespace-nowrap">{Math.round((challenge.current / challenge.target) * 100)}%</span>
                          </div>
                          <Progress value={Math.min((challenge.current / challenge.target) * 100, 100)} className="h-1.5" />
                        </div>
                      ))}
                      <Button variant="outline" className="w-full text-xs md:text-sm h-auto py-2" onClick={() => setCurrentView('quests')}>
                        View Quest Board
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-4 md:space-y-6 lg:col-span-4">
                <Card>
                  <CardHeader className="py-3 md:py-6 px-3 md:px-6">
                    <CardTitle className="flex items-center gap-2 text-lg md:text-base">
                      <Crown className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                      Hall of Champions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5 md:space-y-2 px-3 md:px-6 pb-3 md:pb-6">
                    {leaderboard.map((player) => (
                      <div
                        key={player.rank}
                        className={`flex items-center justify-between rounded-md p-2 md:p-2.5 text-xs md:text-sm ${
                          player.name === character.name ? 'bg-primary/20 border border-primary/30' : 'bg-card/50 border border-border/50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
                          <div className="font-bold w-4 md:w-5 text-center text-xs md:text-sm">{player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : player.rank}</div>
                          <div className="min-w-0">
                            <div className="font-semibold truncate text-xs md:text-sm">{player.name}</div>
                            <div className="text-xs text-muted-foreground">Lv{player.level} • {player.questsCompleted} Quests • {player.trophies} Trophies</div>
                          </div>
                        </div>
                        <div className="text-xs font-bold text-muted-foreground whitespace-nowrap ml-2">{player.xp} XP</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

              </div>
            </div>
          </div>
        )}

        <Dialog open={showActivitiesModal} onOpenChange={setShowActivitiesModal}>
          <DialogContent className="w-[min(96vw,88rem)] max-w-none max-h-[90vh] overflow-y-auto scrollbar-hide p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Scroll className="w-5 h-5" />
                Quest Journal
              </DialogTitle>
            </DialogHeader>
            <ActivityFeed
              activities={character.activities?.slice(0, 8) || []}
              gameSessions={character.gameSessions?.slice(0, 8) || []}
              personalBests={character.personalBests}
              onKudos={giveKudos}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={showWeeklyConquestsModal} onOpenChange={setShowWeeklyConquestsModal}>
          <DialogContent className="w-[min(96vw,88rem)] max-w-none max-h-[90vh] overflow-y-auto scrollbar-hide p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Swords className="w-5 h-5" />
                Weekly Conquests
              </DialogTitle>
            </DialogHeader>
            {weeklyConquestsContent}
          </DialogContent>
        </Dialog>

        {currentView === 'activities' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Scroll className="w-8 h-8" />
                  Adventure Log
                </h1>
                <p className="text-muted-foreground">Chronicle of your heroic deeds and conquests</p>
              </div>
            </div>
            <ActivityFeed 
              activities={character.activities || []} 
              gameSessions={character.gameSessions || []}
              personalBests={character.personalBests}
              onKudos={giveKudos}
            />
          </div>
        )}

        {currentView === 'challenges' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Swords className="w-8 h-8" />
                Guild Challenges
              </h1>
              <p className="text-muted-foreground">Join legendary trials and compete with fellow adventurers</p>
            </div>
            <ChallengesList 
              challenges={allChallenges}
              joinedChallengeIds={joinedChallengeIds}
              onJoinChallenge={joinChallenge}
            />
          </div>
        )}

        {currentView === 'achievements' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Trophy className="w-8 h-8" />
                Hall of Legends
              </h1>
              <p className="text-muted-foreground">Your legendary trophies and glorious achievements</p>
            </div>
            <AchievementsGrid 
              achievements={unlockedAchievements}
              locked={lockedAchievements}
            />
          </div>
        )}

        {currentView === 'quests' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <MapIcon className="w-8 h-8" />
                  Quest Board
                </h1>
                <p className="text-muted-foreground">Embark on epic wellness quests and conquer mighty challenges</p>
              </div>
            </div>
            <QuestBoard fullView />
          </div>
        )}

        {currentView === 'inventory' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Backpack className="w-8 h-8" />
                Adventurer's Backpack
              </h1>
              <p className="text-muted-foreground">Your legendary treasures and magical equipment</p>
            </div>
            <Inventory fullView />
          </div>
        )}

        {currentView === 'shop' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Store className="w-8 h-8" />
                Merchant's Bazaar
              </h1>
              <p className="text-muted-foreground">Trade for magical items and powerful upgrades</p>
            </div>
            <Shop />
          </div>
        )}

        {currentView === 'profile' && <Profile />}
        
        {currentView === 'stats' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <BarChart3 className="w-8 h-8" />
                Battle Records
              </h1>
              <p className="text-muted-foreground">Your greatest victories and legendary combat statistics</p>
            </div>
            <StatsView />
          </div>
        )}

          </>
        )}

      </main>
    </div>
  );
}
