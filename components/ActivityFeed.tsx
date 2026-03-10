'use client';

import { useState } from 'react';
import { Activity, GameSession, QuestType, PersonalBests } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  Trophy,
  Star,
  Zap,
  Dumbbell,
  Apple,
  Brain,
  Moon,
  Target,
  Sparkles,
  Coins,
  TrendingUp,
  Award,
  Flame,
  Swords,
  CheckCircle2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityFeedProps {
  activities: Activity[];
  gameSessions?: GameSession[];
  personalBests?: PersonalBests;
  onKudos?: (activityId: string) => void;
}

const questIcons = {
  fitness: Dumbbell,
  nutrition: Apple,
  mindfulness: Brain,
  sleep: Moon,
};

const rankColors = {
  'S': 'bg-gradient-to-r from-primary to-secondary text-primary-foreground',
  'A': 'bg-secondary/80 text-secondary-foreground',
  'B': 'bg-primary/70 text-primary-foreground',
  'C': 'bg-muted text-foreground',
  'D': 'bg-muted/70 text-muted-foreground',
};

const questTypeLabels = {
  fitness: 'Physical',
  nutrition: 'Nutrition',
  mindfulness: 'Mental',
  sleep: 'Wellness',
};

export default function ActivityFeed({ activities, gameSessions = [], personalBests, onKudos }: ActivityFeedProps) {
  const [selectedType, setSelectedType] = useState<QuestType | 'all'>('all');

  // Combine activities and game sessions for comprehensive view
  const allActivities = [...activities].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const filteredActivities = selectedType === 'all' 
    ? allActivities 
    : allActivities.filter(a => a.type === selectedType);

  const getGameSession = (sessionId?: string) => {
    if (!sessionId) return null;
    return gameSessions.find(s => s.id === sessionId);
  };

  const renderActivityCard = (activity: Activity) => {
    const Icon = questIcons[activity.type];
    const session = getGameSession(activity.sessionId);
    const rank = activity.rank || session?.rank;
    const score = activity.score || session?.score;
    const bestTime = personalBests?.[activity.type]?.bestTime;

    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = (seconds % 60).toString().padStart(2, '0');
      return `${mins}:${secs}`;
    };

    return (
      <Card key={activity.id} className="overflow-hidden hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-base">{activity.title}</h3>
                  {session?.isPerfect && (
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Sparkles className="h-3 w-3 text-primary" />
                      Perfect!
                    </Badge>
                  )}
                  {session?.isPersonalBest && (
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Trophy className="h-3 w-3 text-secondary" />
                      PB
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="text-xs">
                    {questTypeLabels[activity.type]}
                  </Badge>
                  <span>•</span>
                  <span>{formatDistanceToNow(activity.date, { addSuffix: true })}</span>
                </div>
              </div>
            </div>

            {/* Rank Badge */}
            {rank && (
              <div className={`px-3 py-1 rounded-md font-bold text-lg ${rankColors[rank]}`}>
                {rank}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Description */}
          {activity.description && (
            <p className="text-sm text-muted-foreground">
              {activity.description}
            </p>
          )}

          {/* Performance Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Score */}
            {score !== undefined && (
              <div className="flex flex-col gap-1 p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3" />
                  <span>Score</span>
                </div>
                <span className="font-bold text-lg text-secondary">
                  {score.toLocaleString()}
                </span>
              </div>
            )}

            {/* Completion Time */}
            {session?.completionTime && (
              <div className="flex flex-col gap-1 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Duration</span>
                </div>
                <span className="font-bold text-sm text-primary">
                  {formatTime(session.completionTime)}
                </span>
              </div>
            )}

            {/* Best Time */}
            {session && bestTime && bestTime < Infinity && (
              <div className="flex flex-col gap-1 p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Trophy className="h-3 w-3" />
                  <span>Best Time</span>
                </div>
                <span className="font-bold text-sm text-secondary">
                  {formatTime(bestTime)}
                </span>
              </div>
            )}

            {/* Accuracy */}
            {session?.accuracy !== undefined && (
              <div className="flex flex-col gap-1 p-3 rounded-lg bg-accent/20 border border-accent/30">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Target className="h-3 w-3" />
                  <span>Accuracy</span>
                </div>
                <span className="font-bold text-sm text-accent-foreground">
                  {session.accuracy}%
                </span>
              </div>
            )}

            {/* Duration (for non-session activities) */}
            {!session && activity.duration && (
              <div className="flex flex-col gap-1 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Duration</span>
                </div>
                <span className="font-bold text-sm text-primary">
                  {Math.floor(activity.duration / 60)}m
                </span>
              </div>
            )}

            {/* Calories */}
            {activity.calories && (
              <div className="flex flex-col gap-1 p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Flame className="h-3 w-3" />
                  <span>Calories</span>
                </div>
                <span className="font-bold text-sm text-secondary">
                  {activity.calories}
                </span>
              </div>
            )}
          </div>

          {/* Rewards Section */}
          {session && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <Award className="h-4 w-4 text-primary" />
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-secondary" />
                  <span className="font-semibold text-secondary">+{50 * (rank === 'S' ? 1.5 : rank === 'A' ? 1.2 : 1)}XP</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Coins className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-primary">+{20 * (rank === 'S' ? 1.5 : rank === 'A' ? 1.2 : 1)}G</span>
                </div>
              </div>
            </div>
          )}

          {/* Special Achievements */}
          {(session?.isPerfect || session?.isPersonalBest) && (
            <div className="flex flex-col gap-2 p-3 rounded-lg bg-secondary/10 border border-secondary/20">
              {session.isPerfect && (
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="font-medium">Perfect Clear - No Mistakes!</span>
                </div>
              )}
              {session.isPersonalBest && (
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-secondary" />
                  <span className="font-medium">New Personal Best!</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Swords className="h-6 w-6 text-primary" />
                Quest History
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Your complete journey through challenges and quests
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-5 w-5 text-secondary" />
              <div>
                <div className="font-bold text-lg">{allActivities.length}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filter Tabs */}
      <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as QuestType | 'all')} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" className="gap-2">
            <Trophy className="h-4 w-4" />
            All
          </TabsTrigger>
          <TabsTrigger value="fitness" className="gap-2">
            <Dumbbell className="h-4 w-4" />
            Physical
          </TabsTrigger>
          <TabsTrigger value="mindfulness" className="gap-2">
            <Brain className="h-4 w-4" />
            Mental
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="gap-2">
            <Apple className="h-4 w-4" />
            Nutrition
          </TabsTrigger>
          <TabsTrigger value="sleep" className="gap-2">
            <Moon className="h-4 w-4" />
            Wellness
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedType} className="space-y-3 mt-4">
          {filteredActivities.length === 0 ? (
            <Card className="p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <Trophy className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Activities Yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {selectedType === 'all' 
                    ? 'Complete quests to see your activity history here.'
                    : `Complete ${questTypeLabels[selectedType as QuestType]} quests to see them here.`
                  }
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredActivities.map(renderActivityCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
