'use client';

import React from 'react';
import { useGame } from '@/lib/context';
import { Card } from '@/components/ui/card';
import { QuestType, GameSession } from '@/lib/types';
import { Trophy, Clock, Star, TrendingUp, Target, Zap } from 'lucide-react';

export default function StatsView() {
  const { character } = useGame();

  if (!character) return null;

  const personalBests = character.personalBests || {
    fitness: { bestTime: Infinity, bestScore: 0, totalClears: 0, avgTime: 0 },
    mindfulness: { bestTime: Infinity, bestScore: 0, totalClears: 0, avgTime: 0 },
    nutrition: { bestTime: Infinity, bestScore: 0, totalClears: 0, avgTime: 0 },
    sleep: { bestTime: Infinity, bestScore: 0, totalClears: 0, avgTime: 0 },
  };
  const gameSessions = character.gameSessions || [];

  // Get recent sessions (last 10)
  const recentSessions = gameSessions.slice(0, 10);

  // Calculate total stats
  const totalSessions = gameSessions.length;
  const totalScore = gameSessions.reduce((sum, s) => sum + s.score, 0);
  const avgScore = totalSessions > 0 ? Math.round(totalScore / totalSessions) : 0;
  const perfectClears = gameSessions.filter(s => s.isPerfect).length;
  const sRanks = gameSessions.filter(s => s.rank === 'S').length;

  const gameTypeIcons: Record<QuestType, string> = {
    fitness: '🏃',
    mindfulness: '🧘',
    nutrition: '🍎',
    sleep: '😴',
  };

  const gameTypeNames: Record<QuestType, string> = {
    fitness: 'Fitness Runner',
    mindfulness: 'Calm Clicker',
    nutrition: 'Plate Builder',
    sleep: 'Sheep Counter',
  };

  const rankColors: Record<string, string> = {
    S: 'text-primary bg-primary/10 border-primary/30',
    A: 'text-secondary bg-secondary/10 border-secondary/30',
    B: 'text-secondary bg-secondary/10 border-secondary/30',
    C: 'text-primary bg-primary/10 border-primary/30',
    D: 'text-muted-foreground bg-muted/50 border-muted/30',
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="space-y-8">
      {/* Overall Stats Summary */}
      <div>
        <h2 className="text-3xl font-black text-gradient mb-6">PERFORMANCE STATS</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/20">
                <Target size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalSessions}</p>
                <p className="text-xs text-muted-foreground">Total Clears</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-secondary/5 border-secondary/20">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-secondary/20">
                <TrendingUp size={24} className="text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{avgScore.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Avg Score</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/20">
                <Trophy size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{sRanks}</p>
                <p className="text-xs text-muted-foreground">S Ranks</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-secondary/5 border-secondary/20">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-secondary/20">
                <Star size={24} className="text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{perfectClears}</p>
                <p className="text-xs text-muted-foreground">Perfect Clears</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Personal Bests by Game Type */}
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Trophy size={24} className="text-primary" />
          Personal Bests
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          {(Object.keys(personalBests) as QuestType[]).map((type) => {
            const best = personalBests[type];
            return (
              <Card key={type} className="p-5 space-y-3 bg-card/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{gameTypeIcons[type]}</span>
                    <div>
                      <h4 className="font-bold text-foreground">{gameTypeNames[type]}</h4>
                      <p className="text-xs text-muted-foreground">{best.totalClears} total clears</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Trophy size={14} className="text-primary" />
                    </div>
                    <p className="text-lg font-bold text-foreground">
                      {best.bestScore > 0 ? best.bestScore.toLocaleString() : '-'}
                    </p>
                    <p className="text-xs text-muted-foreground">Best Score</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Zap size={14} className="text-secondary" />
                    </div>
                    <p className="text-lg font-bold text-foreground">
                      {best.bestTime < Infinity ? formatTime(best.bestTime) : '-'}
                    </p>
                    <p className="text-xs text-muted-foreground">Best Time</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Clock size={14} className="text-accent-foreground" />
                    </div>
                    <p className="text-lg font-bold text-foreground">
                      {best.avgTime > 0 ? formatTime(Math.round(best.avgTime)) : '-'}
                    </p>
                    <p className="text-xs text-muted-foreground">Avg Time</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Sessions */}
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Clock size={24} className="text-primary" />
          Recent Sessions
        </h3>
        
        {recentSessions.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No game sessions yet. Complete some mini-games to see your performance history!</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {recentSessions.map((session) => (
              <Card key={session.id} className="p-4 hover:bg-card/70 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{gameTypeIcons[session.questType]}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">{gameTypeNames[session.questType]}</h4>
                        {session.isPerfect && (
                          <span className="px-2 py-0.5 rounded text-xs font-bold bg-secondary/20 text-secondary border border-secondary/30">
                            PERFECT
                          </span>
                        )}
                        {session.isPersonalBest && (
                          <span className="px-2 py-0.5 rounded text-xs font-bold bg-primary/20 text-primary border border-primary/30">
                            PB
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(session.date).toLocaleDateString()} at {new Date(session.date).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">{session.score.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Score</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">{formatTime(session.completionTime)}</p>
                      <p className="text-xs text-muted-foreground">Duration</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-semibold text-secondary">
                        {personalBests[session.questType].bestTime < Infinity 
                          ? formatTime(personalBests[session.questType].bestTime)
                          : '-'}
                      </p>
                      <p className="text-xs text-muted-foreground">Best Time</p>
                    </div>
                    
                    <div className={`px-3 py-1 rounded border font-bold text-lg ${rankColors[session.rank]}`}>
                      {session.rank}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
