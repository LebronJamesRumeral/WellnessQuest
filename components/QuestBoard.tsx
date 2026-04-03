'use client';

import React, { useEffect, useState } from 'react';
import { useGame } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { Quest, QuestType, GameSession } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Apple, Smile, Moon, CheckCircle2, Star, Coins, ClipboardList, Zap, Swords, UtensilsCrossed, Brain, CloudMoon, Trophy, Crown, Calendar, CalendarDays } from 'lucide-react';
import MiniGame from '@/components/MiniGame';
import QuestionQuest from '@/components/QuestionQuest';

interface QuestBoardProps {
  fullView?: boolean;
}

// Physical vs Mental classification
const PHYSICAL_QUESTS = ['fitness'];
const MENTAL_QUESTS = ['mindfulness', 'sleep'];
const WELLNESS_QUESTS = ['nutrition'];

export default function QuestBoard({ fullView = false }: QuestBoardProps) {
  const { gameState, character, acceptQuest, startGame, finishGame, cancelGame, claimTierChallengeReward, getEquipmentBuffs } = useGame();
  const [activeGameQuestId, setActiveGameQuestId] = useState<string | null>(null);
  const [activeQuestionQuestId, setActiveQuestionQuestId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'daily' | 'active' | 'game' | 'question'>('all');
  const [now, setNow] = useState(Date.now());

  if (!gameState) return null;

  const questTypeIcons: Record<QuestType, React.ComponentType<{ size: number; className: string }>> = {
    fitness: Dumbbell,
    nutrition: Apple,
    mindfulness: Smile,
    sleep: Moon,
  };

  const questTypeLabels: Record<QuestType, string> = {
    fitness: 'Combat Training',
    nutrition: 'Alchemy & Provisions',
    mindfulness: 'Mystic Arts',
    sleep: 'Rest & Recovery',
  };

  const questTypeDescriptions: Record<QuestType, string> = {
    fitness: 'Battle training to build legendary strength and endurance',
    nutrition: 'Alchemical arts to enhance your hero\'s vitality',
    mindfulness: 'Mystical practices for inner peace and mental fortitude',
    sleep: 'Sacred rest rituals for optimal hero recovery',
  };

  const difficultyColors: Record<string, { bg: string; text: string; border: string }> = {
    easy: { bg: 'bg-accent/10', text: 'text-accent', border: 'border-accent/30' },
    medium: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/30' },
    hard: { bg: 'bg-muted/50', text: 'text-muted-foreground', border: 'border-muted/30' },
    legendary: { bg: 'bg-secondary/10', text: 'text-secondary', border: 'border-secondary/30' },
  };

  const equipmentBuffs = getEquipmentBuffs();

  const getBuffedQuestRewards = (quest: Quest) => {
    const buffedExperience = Math.round(quest.rewards.experience * equipmentBuffs.xpMultiplier);
    const buffedGold = Math.round(quest.rewards.gold * equipmentBuffs.goldMultiplier);

    return {
      buffedExperience,
      buffedGold,
    };
  };

  const handlePlayGame = (questId: string) => {
    startGame(questId);
    setActiveGameQuestId(questId);
  };

  const handlePlayQuestionQuest = (questId: string) => {
    setActiveQuestionQuestId(questId);
  };

  const handleGameComplete = (sessionData: GameSession) => {
    if (activeGameQuestId) {
      finishGame(activeGameQuestId, sessionData);
      setActiveGameQuestId(null);
    }
  };

  const handleQuestionQuestComplete = (sessionData: GameSession) => {
    if (activeQuestionQuestId) {
      finishGame(activeQuestionQuestId, sessionData);
      setActiveQuestionQuestId(null);
    }
  };

  const handleGameCancel = () => {
    if (activeGameQuestId) {
      cancelGame();
      setActiveGameQuestId(null);
    }
  };

  const handleQuestionQuestCancel = () => {
    setActiveQuestionQuestId(null);
  };

  const shouldShowSection = (section: 'daily' | 'active' | 'game' | 'question'): boolean => {
    if (selectedCategory === 'all') return true;
    return selectedCategory === section;
  };

  const renderTabEmptyState = (title: string, subtitle: string) => (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="py-10 text-center space-y-2">
        <Trophy className="w-12 h-12 mx-auto text-muted-foreground/30" />
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );

  const isGameQuest = (questId: string): boolean => questId.startsWith('quest-');
  const isQuestionQuest = (questId: string): boolean => questId.startsWith('qquest-');

  const getCooldownRemainingMs = (quest: Quest): number => {
    if (!quest.cooldownUntil) return 0;
    return Math.max(0, new Date(quest.cooldownUntil).getTime() - now);
  };

  const getCooldownRemainingByQuestId = (questId: string): number => {
    const availableQuest = gameState.availableQuests.find((quest) => quest.id === questId);
    if (!availableQuest) return 0;
    return getCooldownRemainingMs(availableQuest);
  };

  const formatCooldown = (remainingMs: number): string => {
    const totalSeconds = Math.ceil(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const hasCooldownQuest = gameState.availableQuests.some((quest) => getCooldownRemainingMs(quest) > 0);
    if (!hasCooldownQuest) return;

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [gameState.availableQuests]);

  const renderQuestCard = (
    quest: Quest,
    showActions: boolean = false,
    isCompleted: boolean = false,
    cooldownRemainingOverrideMs?: number,
  ) => {
    const remainingCooldownMs = cooldownRemainingOverrideMs ?? getCooldownRemainingMs(quest);
    const isOnCooldown = remainingCooldownMs > 0;

    return (
    <Card key={quest.id} className={`overflow-hidden hover:border-primary/50 transition-colors ${isCompleted ? 'opacity-60' : ''}`}>
      {(() => {
        const { buffedExperience, buffedGold } = getBuffedQuestRewards(quest);

        return (
          <CardContent className="pt-4 pb-4 space-y-3">
        {/* Header with type icon and difficulty badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="p-2 rounded-lg bg-secondary/20 shrink-0">
              {React.createElement(questTypeIcons[quest.type], { size: 18, className: 'text-secondary' })}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-foreground truncate">{quest.title}</h3>
              <p className="text-xs text-muted-foreground truncate">{quest.description}</p>
            </div>
          </div>
          <div className={`px-2 py-0.5 rounded-full text-xs font-bold shrink-0 whitespace-nowrap ${difficultyColors[quest.difficulty].bg} ${difficultyColors[quest.difficulty].text} border ${difficultyColors[quest.difficulty].border}`}>
            {quest.difficulty.toUpperCase()}
          </div>
        </div>

        {/* Category and Requirements in one line */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-block px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-semibold">
              {questTypeLabels[quest.type]}
            </span>
            {PHYSICAL_QUESTS.includes(quest.type) && (
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-primary/15 text-primary text-xs font-semibold">
                <Dumbbell className="w-3 h-3" />
              </span>
            )}
            {MENTAL_QUESTS.includes(quest.type) && (
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-secondary/15 text-secondary text-xs font-semibold">
                <Brain className="w-3 h-3" />
              </span>
            )}
            {WELLNESS_QUESTS.includes(quest.type) && (
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-secondary/10 text-secondary text-xs font-semibold">
                <Apple className="w-3 h-3" />
              </span>
            )}
          </div>
          
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground bg-muted/40 px-2 py-1.5 rounded border border-border">
            <ClipboardList size={12} className="shrink-0 mt-0.5" />
            <span className="line-clamp-2">{quest.requirements}</span>
          </div>
          {isOnCooldown && (
            <div className="flex items-center gap-1.5 text-xs text-secondary bg-secondary/10 px-2 py-1.5 rounded border border-secondary/30 font-semibold">
              <CloudMoon size={12} className="shrink-0" />
              Cooldown: {formatCooldown(remainingCooldownMs)}
            </div>
          )}
        </div>

        {/* Compact Rewards Section */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-input/50 rounded px-2 py-1.5 flex items-center gap-1.5">
            <Star size={12} className="text-primary shrink-0" />
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">XP</div>
              <div className="font-bold text-xs text-primary">{buffedExperience}</div>
            </div>
          </div>
          <div className="bg-input/50 rounded px-2 py-1.5 flex items-center gap-1.5">
            <Coins size={12} className="text-accent shrink-0" />
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">Gold</div>
              <div className="font-bold text-xs text-accent">{buffedGold}</div>
            </div>
          </div>
        </div>

        {(equipmentBuffs.xpMultiplier > 1 || equipmentBuffs.goldMultiplier > 1) && (
          <div className="bg-secondary/10 border border-secondary/30 rounded p-2 text-xs text-secondary font-semibold">
            Equipped Buffs: XP x{equipmentBuffs.xpMultiplier.toFixed(2)} • Gold x{equipmentBuffs.goldMultiplier.toFixed(2)}
          </div>
        )}

        {/* Compact Performance Bonuses */}
        <div className="bg-muted/30 rounded p-2 border border-border/50">
          <div className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-0.5">
            <Zap size={10} />
            Bonuses
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1">
                <span className="font-bold text-yellow-600">S</span>
                <span className="text-muted-foreground/80">+50%</span>
              </span>
              <span className="font-semibold text-foreground text-xs">{Math.round(buffedExperience * 1.5)}XP / {Math.round(buffedGold * 1.5)}G</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1">
                <span className="font-bold text-purple-600">A</span>
                <span className="text-muted-foreground/80">+25%</span>
              </span>
              <span className="font-semibold text-foreground text-xs">{Math.round(buffedExperience * 1.25)}XP / {Math.round(buffedGold * 1.25)}G</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1">
                <span className="font-bold text-blue-600">B</span>
                <span className="text-muted-foreground/80">+10%</span>
              </span>
              <span className="font-semibold text-foreground text-xs">{Math.round(buffedExperience * 1.1)}XP / {Math.round(buffedGold * 1.1)}G</span>
            </div>
          </div>
        </div>

        {isCompleted && (
          <div className="text-center py-1.5 rounded bg-primary/20 border border-primary/30">
            <div className="flex items-center justify-center gap-1.5 text-primary font-semibold text-xs">
              <CheckCircle2 size={14} />
              Completed
            </div>
          </div>
        )}

        {showActions && !quest.completed && !isCompleted && (
          <div className="flex gap-2 pt-1">
            {!gameState.activeQuests.find(q => q.id === quest.id) && (
              <Button
                onClick={() => acceptQuest(quest.id)}
                size="sm"
                disabled={isOnCooldown}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-8"
              >
                {isOnCooldown ? `Cooldown ${formatCooldown(remainingCooldownMs)}` : 'Accept Quest'}
              </Button>
            )}
            {gameState.activeQuests.find(q => q.id === quest.id) && isGameQuest(quest.id) && (
              <Button
                onClick={() => handlePlayGame(quest.id)}
                size="sm"
                className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold text-xs h-8"
              >
                Play Game
              </Button>
            )}
            {gameState.activeQuests.find(q => q.id === quest.id) && isQuestionQuest(quest.id) && (
              <Button
                onClick={() => handlePlayQuestionQuest(quest.id)}
                size="sm"
                className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold text-xs h-8"
              >
                Answer
              </Button>
            )}
          </div>
        )}
          </CardContent>
        );
      })()}
    </Card>
  );
  };

  const activeQuests = gameState.activeQuests;
  const availableQuests = gameState.availableQuests;
  const activeQuestIds = new Set(activeQuests.map(q => q.id));
  const availableGameQuests = gameState.availableQuests.filter(q => isGameQuest(q.id) && !activeQuestIds.has(q.id));
  const availableQuestionQuests = gameState.availableQuests.filter(q => isQuestionQuest(q.id) && !activeQuestIds.has(q.id));
  const completedQuests = gameState.completedQuests;
  const activeTierChallenges = character?.activeTierChallenges || [];

  if (fullView) {
    const currentQuest = gameState.activeQuests.find(q => q.id === activeGameQuestId);

    return (
      <>
        {activeGameQuestId && currentQuest && (
          <MiniGame 
            quest={currentQuest}
            onComplete={handleGameComplete}
            onCancel={handleGameCancel}
          />
        )}

        {activeQuestionQuestId && gameState?.activeQuests && (
          <QuestionQuest 
            quest={gameState.activeQuests.find(q => q.id === activeQuestionQuestId)!}
            onComplete={handleQuestionQuestComplete}
            onCancel={handleQuestionQuestCancel}
          />
        )}

        <div className="space-y-6">
          {/* Quest Filter */}
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
            >
              All Quests
            </Button>
            <Button 
              variant={selectedCategory === 'daily' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('daily')}
            >
              Daily
            </Button>
            <Button 
              variant={selectedCategory === 'active' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('active')}
            >
              Active
            </Button>
            <Button 
              variant={selectedCategory === 'game' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('game')}
            >
              Game Quest
            </Button>
            <Button 
              variant={selectedCategory === 'question' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('question')}
            >
              Question Quest
            </Button>
          </div>

          {/* Daily Challenges */}
          {shouldShowSection('daily') && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold">Daily Challenges ({activeTierChallenges.length})</h2>
              </div>
              {activeTierChallenges.length === 0 ? (
                renderTabEmptyState(
                  'Daily Board Cleared',
                  'You have taken every daily quest and challenge right now. Check back after refresh!'
                )
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">Complete mini-games each day to progress and earn bonus rewards!</p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeTierChallenges.map((challenge) => (
                      <Card key={challenge.id} className="overflow-hidden hover:border-secondary/50 transition-colors border-secondary/30 bg-secondary/5">
                        <CardContent className="pt-4 pb-4 space-y-2.5">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="p-2 rounded-lg bg-secondary/20 text-secondary shrink-0 text-sm">
                                {challenge.tier === 'daily' ? <Calendar className="w-4 h-4" /> : challenge.tier === 'weekly' ? <CalendarDays className="w-4 h-4" /> : challenge.tier === 'seasonal' ? <Star className="w-4 h-4" /> : <Crown className="w-4 h-4" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-sm text-foreground truncate">{challenge.name}</h3>
                                <p className="text-xs text-muted-foreground truncate">{challenge.description}</p>
                              </div>
                            </div>
                            <div className="px-2 py-0.5 rounded-full text-xs font-bold capitalize bg-secondary/20 text-secondary border border-secondary/30 whitespace-nowrap">
                              {challenge.tier}
                            </div>
                          </div>

                          {/* Progress */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-bold text-secondary text-xs">{challenge.current} / {challenge.target}</span>
                            </div>
                            <div className="w-full bg-secondary/30 rounded-full h-2 overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-secondary to-secondary/60 h-full transition-all duration-500"
                                style={{ width: `${Math.min((challenge.current / challenge.target) * 100, 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* Rewards */}
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <div className="bg-secondary/15 rounded px-2 py-1.5 flex items-center gap-1.5">
                              <Star size={12} className="text-secondary shrink-0" />
                              <div className="min-w-0">
                                <div className="text-xs text-muted-foreground">XP</div>
                                <div className="font-bold text-xs text-secondary">{challenge.reward.experience}</div>
                              </div>
                            </div>
                            <div className="bg-accent/15 rounded px-2 py-1.5 flex items-center gap-1.5">
                              <Coins size={12} className="text-accent shrink-0" />
                              <div className="min-w-0">
                                <div className="text-xs text-muted-foreground">Gold</div>
                                <div className="font-bold text-xs text-accent">{challenge.reward.gold}</div>
                              </div>
                            </div>
                          </div>

                          {challenge.completed && challenge.claimed && (
                            <div className="text-center py-1.5 rounded bg-primary/20 border border-primary/30">
                              <div className="flex items-center justify-center gap-1.5 text-primary font-semibold text-xs">
                                <CheckCircle2 size={14} />
                                Claimed
                              </div>
                            </div>
                          )}

                          {challenge.completed && !challenge.claimed && (
                            <Button
                              onClick={() => claimTierChallengeReward(challenge.id)}
                              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold text-xs h-8"
                              size="sm"
                            >
                              <Star className="h-3 w-3 mr-1.5" />
                              Claim Rewards
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Active Quests */}
          {shouldShowSection('active') && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Active Quests ({activeQuests.length})</h2>
            </div>
            {activeQuests.length === 0 ? (
              renderTabEmptyState(
                'Quest Log Complete',
                'You have taken every active quest here. New quests will appear after refreshes and completions.'
              )
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeQuests.map(quest => renderQuestCard(quest, true))}
              </div>
            )}
          </div>
          )}

          {/* Available Quests - Game-Based */}
          {shouldShowSection('game') && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold">Game Quests ({availableGameQuests.length})</h2>
              </div>
              {availableGameQuests.length === 0 ? (
                renderTabEmptyState(
                  'Game Quest Board Cleared',
                  'You have taken every game quest. Great run, champion!'
                )
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">Play mini-games to complete these quests</p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableGameQuests.map(quest => renderQuestCard(quest, true))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Available Quests - Question-Based */}
          {shouldShowSection('question') && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Smile className="h-5 w-5 text-secondary" />
                <h2 className="text-2xl font-bold">Question Quests ({availableQuestionQuests.length})</h2>
              </div>
              {availableQuestionQuests.length === 0 ? (
                renderTabEmptyState(
                  'Question Quest Board Cleared',
                  'You have taken every question quest. Check back later for new prompts!'
                )
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">Answer simple questions to complete these quests</p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableQuestionQuests.map(quest => renderQuestCard(quest, true))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* All tab fallback when all quest sources are empty */}
          {selectedCategory === 'all' && activeTierChallenges.length === 0 && activeQuests.length === 0 && availableGameQuests.length === 0 && availableQuestionQuests.length === 0 && (
            renderTabEmptyState(
              'All Quest Boards Cleared',
              'You have taken every quest and challenge available right now. Come back after reset for fresh quests!'
            )
          )}

          {/* Completed Quests */}
          {completedQuests.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Completed Quests ({completedQuests.length})</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedQuests.map((quest) =>
                  renderQuestCard(quest, false, true, getCooldownRemainingByQuestId(quest.id))
                )}
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  // Mini view for dashboard
  return (
    <>
      {activeGameQuestId && gameState.activeQuests.find(q => q.id === activeGameQuestId) && (
        <MiniGame 
          quest={gameState.activeQuests.find(q => q.id === activeGameQuestId)!}
          onComplete={handleGameComplete}
          onCancel={handleGameCancel}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Active Quests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {gameState.activeQuests.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No active quests. Accept one to start!</p>
          ) : (
            <div className="space-y-3">
              {gameState.activeQuests.slice(0, 2).map(quest => renderQuestCard(quest, true))}
            </div>
          )}
          <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
            View All Quests
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
