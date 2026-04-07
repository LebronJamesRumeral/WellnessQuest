'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Zap, 
  Apple, 
  Moon, 
  Brain,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { QuestType } from '@/lib/types';

interface OnboardingSurveyProps {
  onComplete: (primaryStat: QuestType) => void;
}

const wellnessOptions: Array<{
  id: QuestType;
  icon: React.ReactNode;
  label: string;
  title: string;
  description: string;
  benefit: string;
}> = [
  {
    id: 'fitness',
    icon: <Zap className="w-8 h-8" />,
    label: 'Fitness & Exercise',
    title: '💪 Fitness Champion',
    description: 'Focus on strength, cardio, and physical challenges',
    benefit: '+50% XP on all fitness games',
  },
  {
    id: 'nutrition',
    icon: <Apple className="w-8 h-8" />,
    label: 'Nutrition & Diet',
    title: '🥗 Nutrition Master',
    description: 'Master healthy eating habits and meal planning',
    benefit: '+50% XP on all nutrition games',
  },
  {
    id: 'mindfulness',
    icon: <Brain className="w-8 h-8" />,
    label: 'Mindfulness & Wellness',
    title: '🧘 Mindfulness Sage',
    description: 'Practice meditation, breathing, and mental clarity',
    benefit: '+50% XP on all mindfulness games',
  },
  {
    id: 'sleep',
    icon: <Moon className="w-8 h-8" />,
    label: 'Sleep & Recovery',
    title: '😴 Sleep Master',
    description: 'Improve sleep quality and rest patterns',
    benefit: '+50% XP on all sleep games',
  },
];

export default function OnboardingSurvey({ onComplete }: OnboardingSurveyProps) {
  const [selectedStat, setSelectedStat] = useState<QuestType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async () => {
    if (!selectedStat) return;
    
    setIsSubmitting(true);
    // Simulate a slight delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    onComplete(selectedStat);
  };

  const selectedOption = wellnessOptions.find(opt => opt.id === selectedStat);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
              <Sparkles className="w-8 h-8" />
              Customize Your Journey
            </h1>
            <p className="text-muted-foreground">
              Choose your wellness focus to unlock special bonuses and personalized quests
            </p>
          </div>

          {/* Survey Card */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-xl">Which wellness area is most important for you right now?</CardTitle>
              <CardDescription>
                Your choice will unlock a special starting item that boosts experience in that area
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Options Grid */}
              <RadioGroup value={selectedStat || ""} onValueChange={(value) => setSelectedStat(value as QuestType)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {wellnessOptions.map((option) => (
                    <div key={option.id}>
                      <Label
                        htmlFor={option.id}
                        className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedStat === option.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-muted-foreground/50 hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xl">{option.icon}</span>
                              <span className="font-semibold text-foreground">{option.label}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{option.description}</p>
                            <div className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 rounded text-xs font-semibold text-primary">
                              <CheckCircle2 className="w-3 h-3" />
                              {option.benefit}
                            </div>
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              {/* Preview of Selected Option */}
              {selectedOption && (
                <div className="mt-6 p-4 rounded-lg border border-primary/50 bg-primary/5">
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-bold text-foreground">{selectedOption.title}</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                      You'll start with a special item that grants {selectedOption.benefit.toLowerCase()} and unlock quests tailored to your wellness journey!
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleComplete}
                  disabled={!selectedStat || isSubmitting}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-lg flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="inline-block animate-spin">⚡</span>
                      Creating your legend...
                    </>
                  ) : (
                    <>
                      Begin Quest
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Don't worry! You can switch your focus later through the Shop and customize your equipment.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
