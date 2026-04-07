'use client';

import { useState } from 'react';
import { useGame } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sword, Gamepad2, Star, Coins, Trophy, Shield, Sparkles } from 'lucide-react';
import OnboardingSurvey from './OnboardingSurvey';
import { QuestType } from '@/lib/types';

export default function CharacterCreation() {
  const [name, setName] = useState('');
  const [showSurvey, setShowSurvey] = useState(false);
  const { createCharacter } = useGame();

  const handleNameSubmit = () => {
    if (name.trim()) {
      setShowSurvey(true);
    }
  };

  const handleSurveyComplete = (primaryStat: QuestType) => {
    if (name.trim()) {
      createCharacter(name, primaryStat);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {showSurvey ? (
        <OnboardingSurvey onComplete={handleSurveyComplete} />
      ) : (
        <div className="w-full max-w-md">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold text-primary flex items-center justify-center gap-2">
                <Sword className="w-10 h-10" />
                WellnessQuest
              </h1>
              <p className="text-muted-foreground">Your legendary adventure awaits</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-8 space-y-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <Sword size={48} className="text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
                  <Shield className="w-6 h-6" />
                  Forge Your Hero
                </h2>
                <p className="text-muted-foreground text-sm">
                  Every legendary adventurer needs a name. What will the realm call you?
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Star className="w-4 h-4" />
                  Adventurer Name
                </label>
                <Input
                  placeholder="Enter your legendary name..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
                  className="bg-input border-border"
                  autoFocus
                />
              </div>

              <Button
                onClick={handleNameSubmit}
                disabled={!name.trim()}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-lg flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Continue to Wellness Focus
              </Button>

              <div className="pt-4 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Gamepad2 size={16} />
                  <span>Embark on epic quests and earn legendary experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star size={16} />
                  <span>Level up your hero and unlock powerful abilities</span>
                </div>
                <div className="flex items-center gap-2">
                  <Coins size={16} />
                  <span>Collect treasure and purchase rare artifacts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy size={16} />
                  <span>Conquer challenges and claim legendary glory</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
