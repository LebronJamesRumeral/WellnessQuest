'use client';

import { AssessmentResult } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Target, 
  Sparkles,
  TrendingUp,
  Dumbbell,
  Apple,
  Brain,
  Moon,
  CheckCircle2,
  Shield,
  Swords,
  Map
} from 'lucide-react';

interface AssessmentResultsProps {
  result: AssessmentResult;
  onContinue: () => void;
}

const profileDescriptions = {
  beginner: {
    title: 'Novice Adventurer',
    description: 'Your quest begins here! Build your strength with easy adventures and establish your hero\'s foundation.',
    icon: Target,
    color: 'text-secondary',
  },
  active: {
    title: 'Skilled Warrior',
    description: 'Your training has paid off! You\'re ready for moderate challenges on your heroic journey.',
    icon: TrendingUp,
    color: 'text-accent-foreground',
  },
  athlete: {
    title: 'Elite Champion',
    description: 'A legendary warrior ready for the toughest trials! Conquer advanced quests and claim epic glory.',
    icon: Trophy,
    color: 'text-primary',
  },
  'health-focused': {
    title: 'Wellness Sage',
    description: 'Your balanced approach to mind, body, and spirit makes you a true master of the wellness arts.',
    icon: Apple,
    color: 'text-accent-foreground',
  },
  balanced: {
    title: 'Versatile Hero',
    description: 'A well-rounded adventurer! Continue mastering all disciplines on your path to legendary status.',
    icon: Sparkles,
    color: 'text-secondary',
  },
};

const categoryIcons = {
  fitness: Dumbbell,
  nutrition: Apple,
  mindfulness: Brain,
  sleep: Moon,
};

export default function AssessmentResults({ result, onContinue }: AssessmentResultsProps) {
  const profileInfo = profileDescriptions[result.profile];
  const ProfileIcon = profileInfo.icon;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-3 rounded-full bg-primary/10 ${profileInfo.color}`}>
              <ProfileIcon className="h-8 w-8" />
            </div>
            <div>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Shield className="w-8 h-8" />
                Your Hero Profile
              </CardTitle>
              <CardDescription className="text-lg mt-1">
                {profileInfo.title}
              </CardDescription>
            </div>
          </div>
          <p className="text-muted-foreground mt-2">
            {profileInfo.description}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Category Scores */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Swords className="w-5 h-5" />
              Your Adventure Stats
            </h3>
            <div className="space-y-4">
              {Object.entries(result.scores).map(([category, score]) => {
                const Icon = categoryIcons[category as keyof typeof categoryIcons];
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium capitalize">{category}</span>
                      </div>
                      <span className="text-sm font-semibold">{score}%</span>
                    </div>
                    <Progress value={score} className="h-2" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommended Quests */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Map className="w-5 h-5" />
              Your Legendary Quests Await
            </h3>
            <div className="space-y-3">
              {result.recommendedQuests.slice(0, 4).map((quest) => {
                const Icon = categoryIcons[quest.type];
                return (
                  <Card key={quest.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{quest.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {quest.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="capitalize">
                                {quest.difficulty}
                              </Badge>
                              <Badge variant="secondary">
                                +{quest.rewards.experience} XP
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-accent-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Action */}
          <div className="pt-4">
            <Button 
              onClick={onContinue} 
              className="w-full gap-2"
              size="lg"
            >
              <Sparkles className="h-5 w-5" />
              Start Your Wellness Journey
            </Button>
            <p className="text-center text-sm text-muted-foreground mt-2">
              These quests have been added to your quest board
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
