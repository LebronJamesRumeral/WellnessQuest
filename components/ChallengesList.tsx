'use client';

import { Challenge } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Users, 
  Calendar,
  TrendingUp,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { differenceInDays, formatDistanceToNow } from 'date-fns';

interface ChallengesListProps {
  challenges: Challenge[];
  joinedChallengeIds?: string[];
  onJoinChallenge?: (challengeId: string) => void;
}

const typeColors = {
  fitness: 'border-primary bg-primary/10',
  nutrition: 'border-accent bg-accent/10',
  mindfulness: 'border-secondary bg-secondary/10',
  sleep: 'border-secondary/30 bg-secondary/10',
};

export default function ChallengesList({ challenges, joinedChallengeIds = [], onJoinChallenge }: ChallengesListProps) {
  const activeChallenges = challenges.filter(c => !c.completed && new Date(c.endDate) > new Date());
  const completedChallenges = challenges.filter(c => c.completed);

  return (
    <div className="space-y-6">
      {/* Active Challenges */}
      {activeChallenges.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Active Challenges ({activeChallenges.length})</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {activeChallenges.map((challenge) => {
              const progress = (challenge.current / challenge.target) * 100;
              const daysLeft = differenceInDays(new Date(challenge.endDate), new Date());
              const isJoined = joinedChallengeIds.includes(challenge.id) || challenge.current > 0;
              
              return (
                <Card key={challenge.id} className={`${typeColors[challenge.type]}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Trophy className="h-5 w-5 text-primary" />
                          <Badge variant="outline" className="capitalize">
                            {challenge.type}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl">{challenge.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {challenge.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold">
                          {challenge.current} / {challenge.target} {challenge.unit}
                        </span>
                      </div>
                      <Progress value={progress} className="h-3" />
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{daysLeft} days left</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{challenge.participants} participants</span>
                      </div>
                    </div>

                    {/* Rewards */}
                    <div className="bg-background/50 rounded-lg p-3">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Rewards</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">
                          +{challenge.reward.experience} XP
                        </Badge>
                        <Badge variant="secondary">
                          {challenge.reward.gold} Gold
                        </Badge>
                        {challenge.reward.achievement && (
                          <Badge variant="secondary">
                            🏆 Achievement
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    {!isJoined && (
                      <Button 
                        className="w-full" 
                        onClick={() => onJoinChallenge?.(challenge.id)}
                      >
                        Join Challenge
                      </Button>
                    )}
                    {isJoined && (
                      <Button className="w-full" variant="outline" disabled>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Participating
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Challenges */}
      {completedChallenges.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Completed ({completedChallenges.length})</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {completedChallenges.map((challenge) => (
              <Card key={challenge.id} className="border-accent">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-accent-foreground" />
                      <CardTitle className="text-lg">{challenge.name}</CardTitle>
                    </div>
                    <Badge className="bg-accent text-accent-foreground">Completed</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {challenge.current} / {challenge.target} {challenge.unit}
                    </span>
                    <div className="flex gap-2">
                      <Badge variant="outline">+{challenge.reward.experience} XP</Badge>
                      <Badge variant="outline">{challenge.reward.gold} Gold</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
