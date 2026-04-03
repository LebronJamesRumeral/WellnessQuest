'use client';

import { Achievement } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Award, 
  Star, 
  Zap,
  Lock,
  CheckCircle2,
  Scroll,
  TrendingUp
} from 'lucide-react';
// Note: Removed custom ZapIcon component - using Zap from lucide-react instead

interface AchievementsGridProps {
  achievements: Achievement[];
  locked?: Achievement[];
}

const tierColors = {
  bronze: 'text-primary border-primary bg-primary/10',
  silver: 'text-muted-foreground border-muted-foreground bg-muted/50',
  gold: 'text-primary border-primary bg-primary/10',
  platinum: 'text-secondary border-secondary bg-secondary/10',
};

const tierIcons = {
  bronze: Trophy,
  silver: Award,
  gold: Star,
  platinum: Zap,
};

const achievementTypeColors = {
  'quest-milestone': 'bg-secondary/10 text-secondary border-secondary/30',
  'assessment': 'bg-secondary/10 text-secondary border-secondary/30',
  'activity': 'bg-accent/10 text-accent border-accent/30',
  'streak': 'bg-primary/10 text-primary border-primary/30',
  'combat': 'bg-muted/50 text-muted-foreground border-muted/30',
};

const achievementTypeLabels = {
  'quest-milestone': '📜 Quest Milestone',
  'assessment': '📋 From Assessment',
  'activity': '🏃 Activity Based',
  'streak': '🔥 Streak Reward',
  'combat': '⚔️ Combat Achievement',
};

export default function AchievementsGrid({ achievements, locked = [] }: AchievementsGridProps) {
  const unlockedAchievements = achievements.filter(a => a.unlockedDate);
  const inProgressAchievements = achievements.filter(a => !a.unlockedDate && a.progress);

  const renderAchievementCard = (achievement: Achievement, isLocked: boolean = false, isInProgress: boolean = false) => {
    const TierIcon = tierIcons[achievement.tier];
    const tierColor = tierColors[achievement.tier];
    const achievementType = (achievement as any).type || 'activity';
    const typeColor = achievementTypeColors[achievementType as keyof typeof achievementTypeColors] || achievementTypeColors.activity;
    const typeLabel = achievementTypeLabels[achievementType as keyof typeof achievementTypeLabels] || 'achievement';
    
    const progress = achievement.progress && achievement.target 
      ? (achievement.progress / achievement.target) * 100 
      : 0;

    return (
      <Card 
        key={achievement.id} 
        className={`relative overflow-hidden transition-all ${
          isLocked 
            ? 'opacity-50 hover:opacity-60' 
            : 'hover:border-primary/50'
        } ${
          !isLocked && !isInProgress ? 'border-primary/50 shadow-lg shadow-primary/20' : ''
        }`}
      >
        {/* Unlocked Badge */}
        {!isLocked && !isInProgress && (
          <div className="absolute top-2 right-2">
            <div className="bg-accent/20 border border-accent/50 rounded-full p-1">
              <CheckCircle2 className="h-4 w-4 text-accent-foreground" />
            </div>
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center flex-shrink-0 ${
                isLocked 
                  ? 'border-muted bg-muted' 
                  : tierColor
              }`}>
                {isLocked ? (
                  <Lock className="h-6 w-6 text-muted-foreground" />
                ) : (
                  <TierIcon className={`h-6 w-6 ${isLocked ? 'text-muted-foreground' : tierColor.split(' ')[0]}`} />
                )}
              </div>
              <div className="flex-1">
                <CardTitle className="text-base">{isLocked ? '???' : achievement.name}</CardTitle>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Badge variant="outline" className={`capitalize text-xs ${isLocked ? '' : tierColor}`}>
                    {achievement.tier}
                  </Badge>
                  {!isLocked && (
                    <Badge variant="outline" className={`text-xs border ${typeColor}`}>
                      {typeLabel}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {!isLocked ? (
            <>
              <CardDescription>{achievement.description}</CardDescription>
              
              {/* Achievement Connection Info */}
              {achievementType === 'assessment' && (
                <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-3 text-sm">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-secondary-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-secondary-foreground">Assessment Connected</div>
                      <div className="text-xs text-muted-foreground mt-1">Unlocked based on your wellness profile assessment</div>
                    </div>
                  </div>
                </div>
              )}

              {achievementType === 'quest-milestone' && (
                <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Scroll className="h-4 w-4 text-secondary-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-secondary-foreground">Quest Based</div>
                      <div className="text-xs text-muted-foreground mt-1">Unlocked by completing specific quests</div>
                    </div>
                  </div>
                </div>
              )}

              {achievementType === 'streak' && (
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-primary-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-primary-foreground">Streak Based</div>
                      <div className="text-xs text-muted-foreground mt-1">Unlocked by maintaining activity streaks</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Bar for In Progress */}
              {isInProgress && achievement.progress !== undefined && achievement.target && (
                <div className="space-y-2 mt-3 pt-3 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold">{achievement.progress} / {achievement.target}</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="text-xs text-muted-foreground">{Math.round(progress)}% complete</div>
                </div>
              )}

              {/* Unlock Date */}
              {!isInProgress && achievement.unlockedDate && (
                <p className="text-xs text-muted-foreground pt-3 border-t border-border">
                  ✓ Unlocked {new Date(achievement.unlockedDate).toLocaleDateString()}
                </p>
              )}
            </>
          ) : (
            <CardDescription>Complete requirements to unlock this achievement</CardDescription>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs
        defaultValue="all"
        className="w-full"
        onValueChange={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unlocked">Unlocked ({unlockedAchievements.length})</TabsTrigger>
          <TabsTrigger value="progress">In Progress ({inProgressAchievements.length})</TabsTrigger>
          <TabsTrigger value="locked">Locked ({locked.length})</TabsTrigger>
        </TabsList>

        {/* All Achievements */}
        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {unlockedAchievements.map(achievement => renderAchievementCard(achievement))}
            {inProgressAchievements.map(achievement => renderAchievementCard(achievement, false, true))}
            {locked.slice(0, 3).map(achievement => renderAchievementCard(achievement, true))}
          </div>
        </TabsContent>

        {/* Unlocked Only */}
        <TabsContent value="unlocked" className="space-y-4">
          {unlockedAchievements.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {unlockedAchievements.map(achievement => renderAchievementCard(achievement))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-12 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No unlocked achievements yet. Start completing quests and activities!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* In Progress */}
        <TabsContent value="progress" className="space-y-4">
          {inProgressAchievements.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {inProgressAchievements.map(achievement => renderAchievementCard(achievement, false, true))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-12 text-muted-foreground">
                <Zap className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No achievements in progress. Accept quests to start working towards new achievements!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Locked */}
        <TabsContent value="locked" className="space-y-4">
          {locked.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {locked.map(achievement => renderAchievementCard(achievement, true))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-12 text-muted-foreground">
                <Lock className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>All achievements unlocked! You are a true wellness champion!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
