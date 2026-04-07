'use client';

import React from 'react';
import { useGame } from '@/lib/context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User,
  Calendar,
  Trophy,
  Target,
  Flame,
  TrendingUp,
  Award,
  Star,
  Zap,
  Clock,
  Dumbbell,
  Apple,
  Brain,
  Moon
} from 'lucide-react';
import { format } from 'date-fns';
import { XP_PER_LEVEL, getLevelProgress } from '@/lib/progression';

export default function Profile() {
  const { character, gameState } = useGame();

  if (!character || !gameState) return null;

  const totalQuests = gameState.completedQuests?.length || 0;
  const totalActivities = character.activities?.length || 0;
  const currentStreak = character.currentStreak || 0;
  const longestStreak = character.longestStreak || 0;
  
  const memberSince = format(new Date(character.joinedDate), 'MMMM yyyy');
  const nextLevelXP = XP_PER_LEVEL;
  const levelProgress = getLevelProgress(character.stats.experience);

  // Get weekly stats
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weeklyActivities = character.activities?.filter(a => 
    new Date(a.date) > weekAgo
  ).length || 0;

  // Game Session Stats
  const gameSessions = character.gameSessions || [];
  const totalSessions = gameSessions.length;
  const totalScore = gameSessions.reduce((sum, s) => sum + s.score, 0);
  const avgScore = totalSessions > 0 ? Math.round(totalScore / totalSessions) : 0;
  const perfectClears = gameSessions.filter(s => s.isPerfect).length;
  const sRanks = gameSessions.filter(s => s.rank === 'S').length;

  const personalBests = character.personalBests || {
    fitness: { bestTime: Infinity, bestScore: 0, totalClears: 0, avgTime: 0 },
    mindfulness: { bestTime: Infinity, bestScore: 0, totalClears: 0, avgTime: 0 },
    nutrition: { bestTime: Infinity, bestScore: 0, totalClears: 0, avgTime: 0 },
    sleep: { bestTime: Infinity, bestScore: 0, totalClears: 0, avgTime: 0 },
  };

  const questTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    fitness: Dumbbell,
    mindfulness: Brain,
    nutrition: Apple,
    sleep: Moon,
  };

  const gameTypeNames: Record<string, string> = {
    fitness: 'Battle Sprint',
    mindfulness: 'Zen Master',
    nutrition: 'Feast Builder',
    sleep: 'Dreamland Counter',
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-br from-primary/15 to-secondary/15 border-primary/30">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex flex-col items-center md:items-start gap-3">
              <Avatar className="h-32 w-32">
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-4xl font-bold">
                  {character.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex gap-2 flex-wrap justify-center md:justify-start">
                <Badge className="gap-1 text-base py-1 px-3">
                  <Trophy className="h-4 w-4" />
                  Level {character.stats.level}
                </Badge>
                <Badge variant="outline" className="gap-1 text-base py-1 px-3">
                  <Flame className="h-4 w-4 text-primary" />
                  {currentStreak} Streak
                </Badge>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-4xl font-bold">{character.name}</h1>
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <Calendar className="h-4 w-4" />
                  <span>Member since {memberSince}</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card/80 border border-border rounded-lg p-3">
                  <div className="text-2xl font-bold">{totalActivities}</div>
                  <div className="text-sm text-muted-foreground">Activities</div>
                </div>
                <div className="bg-card/80 border border-border rounded-lg p-3">
                  <div className="text-2xl font-bold">{totalQuests}</div>
                  <div className="text-sm text-muted-foreground">Quests</div>
                </div>
                <div className="bg-card/80 border border-border rounded-lg p-3">
                  <div className="text-2xl font-bold">{character.achievements?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">Achievements</div>
                </div>
                <div className="bg-card/80 border border-border rounded-lg p-3">
                  <div className="text-2xl font-bold">{character.gold}</div>
                  <div className="text-sm text-muted-foreground">Gold</div>
                </div>
              </div>

              {/* Level Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-semibold">Next Level Progress</span>
                  <span className="font-semibold">{character.stats.experience.toLocaleString()} / {nextLevelXP.toLocaleString()} XP</span>
                </div>
                <Progress value={levelProgress} className="h-3" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stats">Game Stats</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="attributes">Attributes</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Character Info */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Current Level</div>
                  <div className="text-3xl font-bold">{character.stats.level}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Health</div>
                  <div className="text-xl font-bold">{character.stats.health} / {character.stats.maxHealth}</div>
                  <Progress value={(character.stats.health / character.stats.maxHealth) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Activity Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-secondary" />
                  Activity Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-2">
                  <span className="text-sm">This Week</span>
                  <Badge>{weeklyActivities} activities</Badge>
                </div>
                <div className="flex items-center justify-between p-2">
                  <span className="text-sm">Total Activities</span>
                  <Badge>{totalActivities}</Badge>
                </div>
                <div className="flex items-center justify-between p-2">
                  <span className="text-sm">Longest Streak</span>
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4 text-primary" />
                    <Badge>{longestStreak} days</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6 text-center space-y-2">
                <Target className="h-6 w-6 mx-auto text-primary" />
                <div className="text-2xl font-bold">{totalSessions}</div>
                <div className="text-xs text-muted-foreground">Total Clears</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center space-y-2">
                <Star className="h-6 w-6 mx-auto text-primary" />
                <div className="text-2xl font-bold">{sRanks}</div>
                <div className="text-xs text-muted-foreground">S Ranks</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center space-y-2">
                <Zap className="h-6 w-6 mx-auto text-secondary" />
                <div className="text-2xl font-bold">{perfectClears}</div>
                <div className="text-xs text-muted-foreground">Perfect Clears</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center space-y-2">
                <TrendingUp className="h-6 w-6 mx-auto text-secondary" />
                <div className="text-2xl font-bold">{avgScore.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Avg Score</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Game Stats Tab */}
        <TabsContent value="stats" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Total Sessions</span>
                  <Badge>{totalSessions}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Average Score</span>
                  <Badge>{avgScore.toLocaleString()}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">S Rank Clears</span>
                  <Badge className="gap-1">
                    <Trophy className="h-3 w-3" />
                    {sRanks}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Perfect Clears</span>
                  <Badge className="gap-1">
                    <Star className="h-3 w-3" />
                    {perfectClears}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Combo Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Combo Streaks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Current Combo</span>
                  <Badge variant="secondary">{character.currentComboStreak}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Best Combo</span>
                  <Badge variant="secondary">{character.maxComboStreak}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Combo Multiplier</span>
                  <Badge variant="secondary">{character.comboMultiplier.toFixed(2)}x</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Personal Bests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Personal Bests by Game Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {(Object.keys(personalBests) as Array<keyof typeof personalBests>).map((type) => {
                  const best = personalBests[type];
                  const Icon = questTypeIcons[type];
                  return (
                    <div key={type} className="p-4 rounded-lg bg-muted/50 border border-border space-y-3">
                      <div className="flex items-center gap-2">
                        {Icon && <Icon className="h-5 w-5 text-secondary" />}
                        <div>
                          <h4 className="font-bold">{gameTypeNames[type]}</h4>
                          <p className="text-xs text-muted-foreground">{best.totalClears} total clears</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-lg font-bold text-primary">{best.bestScore || '-'}</div>
                          <div className="text-xs text-muted-foreground">Best Score</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-secondary">{best.bestTime === Infinity ? '-' : formatTime(best.bestTime)}</div>
                          <div className="text-xs text-muted-foreground">Best Time</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-accent-foreground">{best.avgTime === Infinity ? '-' : formatTime(best.avgTime)}</div>
                          <div className="text-xs text-muted-foreground">Avg Time</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Achievements ({character.achievements?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {character.achievements && character.achievements.length > 0 ? (
                <div className="grid gap-3">
                  {character.achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                      <Award className="h-8 w-8 text-primary shrink-0 mt-1" />
                      <div className="flex-1">
                        <div className="font-semibold">{achievement.name}</div>
                        <div className="text-sm text-muted-foreground">{achievement.description}</div>
                      </div>
                      <Badge className="capitalize shrink-0">{achievement.tier}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Trophy className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg">No achievements yet</p>
                  <p className="text-sm mt-1">Keep working to unlock your first achievement!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attributes Tab */}
        <TabsContent value="attributes" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Character Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Character Attributes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Strength</span>
                    <span className="text-2xl font-bold">{character.stats.strength}</span>
                  </div>
                  <Progress value={(character.stats.strength / 100) * 100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Endurance</span>
                    <span className="text-2xl font-bold">{character.stats.endurance}</span>
                  </div>
                  <Progress value={(character.stats.endurance / 100) * 100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Wisdom</span>
                    <span className="text-2xl font-bold">{character.stats.wisdom}</span>
                  </div>
                  <Progress value={(character.stats.wisdom / 100) * 100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Agility</span>
                    <span className="text-2xl font-bold">{character.stats.agility}</span>
                  </div>
                  <Progress value={(character.stats.agility / 100) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Combat Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Vital Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Max Health</span>
                  <Badge variant="secondary">{character.stats.maxHealth} HP</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Current Health</span>
                  <Badge variant="secondary">{character.stats.health} HP</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Gold Balance</span>
                  <Badge className="gap-1">{character.gold}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Inventory</span>
                  <Badge variant="secondary">{character.inventory?.length || 0} items</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
