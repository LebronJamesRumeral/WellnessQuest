'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Target, 
  Flame, 
  Trophy, 
  Calendar,
  Zap
} from 'lucide-react';

interface StatsOverviewProps {
  weeklyGoal?: number;
  weeklyProgress: number;
  totalActivities: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  experience: number;
  nextLevelXP: number;
}

export default function StatsOverview({
  weeklyGoal = 5,
  weeklyProgress,
  totalActivities,
  currentStreak,
  longestStreak,
  level,
  experience,
  nextLevelXP,
}: StatsOverviewProps) {
  const weeklyProgressPercent = Math.min((weeklyProgress / weeklyGoal) * 100, 100);
  const levelProgressPercent = (experience / nextLevelXP) * 100;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Weekly Goal */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Weekly Goal</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{weeklyProgress}</span>
              <span className="text-sm text-muted-foreground">/ {weeklyGoal} activities</span>
            </div>
            <Progress value={weeklyProgressPercent} className="h-2" />
            {weeklyProgress >= weeklyGoal && (
              <Badge className="bg-accent">Goal Complete! 🎉</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Streak */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          <Flame className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="text-2xl font-bold">{currentStreak} days</div>
            <p className="text-xs text-muted-foreground">
              Longest: {longestStreak} days
            </p>
            {currentStreak >= 7 && (
              <Badge variant="outline" className="mt-2">🔥 On Fire!</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Total Activities */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="text-2xl font-bold">{totalActivities}</div>
            <div className="flex items-center gap-1 text-xs text-accent-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>Keep it up!</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Level Progress */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Level {level}</CardTitle>
          <Trophy className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{experience}</span>
              <span className="text-sm text-muted-foreground">/ {nextLevelXP} XP</span>
            </div>
            <Progress value={levelProgressPercent} className="h-2" />
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Zap className="h-3 w-3" />
              <span>{nextLevelXP - experience} XP to next level</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
