'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Quest, GameSession } from '@/lib/types';
import { X, Play, Trophy, Clock, Star, Award } from 'lucide-react';

interface MiniGameProps {
  quest: Quest;
  onComplete: (sessionData: GameSession) => void;
  onCancel: () => void;
}

const getRankFromScore = (score: number): 'S' | 'A' | 'B' | 'C' | 'D' => {
  if (score >= 9000) return 'S';
  if (score >= 7500) return 'A';
  if (score >= 6000) return 'B';
  if (score >= 4500) return 'C';
  return 'D';
};

// Fitness Game - Running challenge
function FitnessGame({ questId, onComplete, onCancel }: { questId: string; onComplete: (session: GameSession) => void; onCancel: () => void }) {
  // Route to different game variants based on quest ID
  if (questId === 'quest-1') {
    return <SprintMasterGame questId={questId} onComplete={onComplete} onCancel={onCancel} />;
  } else if (questId === 'quest-2') {
    return <SprintCircuitGame questId={questId} onComplete={onComplete} onCancel={onCancel} />;
  } else if (questId === 'quest-13') {
    return <PaceMatchGame questId={questId} onComplete={onComplete} onCancel={onCancel} />;
  } else if (questId === 'quest-9') {
    return <PowerLaneGame questId={questId} onComplete={onComplete} onCancel={onCancel} />;
  } else if (questId === 'quest-10') {
    return <TurboRushGame questId={questId} onComplete={onComplete} onCancel={onCancel} />;
  } else if (questId === 'quest-14') {
    return <PulseSprintGame questId={questId} onComplete={onComplete} onCancel={onCancel} />;
  }
  // Default to Sprint Master
  return <SprintMasterGame questId={questId} onComplete={onComplete} onCancel={onCancel} />;
}

function PaceMatchGame({ questId, onComplete, onCancel }: { questId: string; onComplete: (session: GameSession) => void; onCancel: () => void }) {
  const [speed, setSpeed] = useState(50);
  const [target, setTarget] = useState(55);
  const [stableTicks, setStableTicks] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(35);
  const [isPlaying, setIsPlaying] = useState(false);
  const [complete, setComplete] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const targetStableTicks = 15;

  useEffect(() => {
    if (!isPlaying || complete) return;
    if (!startTime) setStartTime(Date.now());

    const timer = setInterval(() => {
      setTimeLeft((left) => {
        if (left <= 1) {
          setComplete(true);
          setIsPlaying(false);
          return 0;
        }
        return left - 1;
      });

      setTarget((current) => {
        const next = current + (Math.random() > 0.5 ? 2 : -2);
        return Math.min(70, Math.max(35, next));
      });

      setStableTicks((current) => {
        const isStable = Math.abs(speed - target) <= 4;
        if (isStable) return current + 1;
        setMistakes((m) => m + 1);
        return current;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, complete, speed, target, startTime]);

  useEffect(() => {
    if (stableTicks >= targetStableTicks && !complete) {
      setComplete(true);
      setIsPlaying(false);
    }
  }, [stableTicks, complete]);

  const handleComplete = () => {
    const completionTime = startTime ? Math.round((Date.now() - startTime) / 1000) : 35;
    const score = Math.max(1000, Math.round(5200 + (stableTicks * 260) + (timeLeft * 35) - (mistakes * 180)));
    const session: GameSession = {
      id: crypto.randomUUID(),
      questId,
      questType: 'fitness',
      completionTime,
      score,
      rank: getRankFromScore(score),
      accuracy: Math.max(40, Math.round((stableTicks / Math.max(stableTicks + mistakes, 1)) * 100)),
      isPerfect: mistakes === 0,
      isPersonalBest: false,
      date: new Date(),
    };
    onComplete(session);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-2xl font-bold">Pace Match</h3>
      <p className="text-sm text-muted-foreground">Keep your pace in the target zone as it shifts.</p>
      <div className="grid grid-cols-4 gap-2 text-center text-sm">
        <div className="bg-input rounded p-2"><div className="font-bold text-primary">{speed}</div><div className="text-xs text-muted-foreground">Your Pace</div></div>
        <div className="bg-input rounded p-2"><div className="font-bold text-secondary">{target}</div><div className="text-xs text-muted-foreground">Target</div></div>
        <div className="bg-input rounded p-2"><div className="font-bold text-accent">{stableTicks}/{targetStableTicks}</div><div className="text-xs text-muted-foreground">Stable</div></div>
        <div className="bg-input rounded p-2"><div className="font-bold text-destructive">{timeLeft}s</div><div className="text-xs text-muted-foreground">Time</div></div>
      </div>
      <div className="flex gap-2">
        <Button disabled={!isPlaying || complete} onClick={() => setSpeed((s) => Math.max(20, s - 3))} className="flex-1" variant="outline">Slow Down</Button>
        <Button disabled={!isPlaying || complete} onClick={() => setSpeed((s) => Math.min(90, s + 3))} className="flex-1" variant="outline">Speed Up</Button>
      </div>
      {!isPlaying && !complete && (
        <div className="space-y-2">
          <Button onClick={() => setIsPlaying(true)} className="w-full">Start Pace Match</Button>
          <Button onClick={onCancel} variant="outline" className="w-full">Cancel</Button>
        </div>
      )}
      {complete && <Button onClick={handleComplete} className="w-full">Claim Rewards</Button>}
    </div>
  );
}

function PulseSprintGame({ questId, onComplete, onCancel }: { questId: string; onComplete: (session: GameSession) => void; onCancel: () => void }) {
  const [timeLeft, setTimeLeft] = useState(30);
  const [windowOpen, setWindowOpen] = useState(false);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [complete, setComplete] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (!isPlaying || complete) return;
    if (!startTime) setStartTime(Date.now());

    const timer = setInterval(() => {
      setTimeLeft((left) => {
        if (left <= 1) {
          setComplete(true);
          setIsPlaying(false);
          return 0;
        }
        return left - 1;
      });
      setWindowOpen(Math.random() > 0.45);
    }, 700);

    return () => clearInterval(timer);
  }, [isPlaying, complete, startTime]);

  const handleTap = () => {
    if (!isPlaying || complete) return;
    if (windowOpen) {
      setHits((h) => h + 1);
    } else {
      setMisses((m) => m + 1);
    }
  };

  const handleComplete = () => {
    const completionTime = startTime ? Math.round((Date.now() - startTime) / 1000) : 30;
    const score = Math.max(1000, Math.round(5000 + (hits * 380) - (misses * 220)));
    const session: GameSession = {
      id: crypto.randomUUID(),
      questId,
      questType: 'fitness',
      completionTime,
      score,
      rank: getRankFromScore(score),
      accuracy: Math.max(20, Math.round((hits / Math.max(hits + misses, 1)) * 100)),
      isPerfect: misses === 0,
      isPersonalBest: false,
      date: new Date(),
    };
    onComplete(session);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-2xl font-bold">Pulse Sprint</h3>
      <p className="text-sm text-muted-foreground">Tap only when the pulse window is OPEN.</p>
      <div className="grid grid-cols-4 gap-2 text-center text-sm">
        <div className="bg-input rounded p-2"><div className="font-bold text-primary">{hits}</div><div className="text-xs text-muted-foreground">Hits</div></div>
        <div className="bg-input rounded p-2"><div className="font-bold text-destructive">{misses}</div><div className="text-xs text-muted-foreground">Misses</div></div>
        <div className="bg-input rounded p-2"><div className="font-bold text-accent">{windowOpen ? 'OPEN' : 'CLOSED'}</div><div className="text-xs text-muted-foreground">Window</div></div>
        <div className="bg-input rounded p-2"><div className="font-bold text-secondary">{timeLeft}s</div><div className="text-xs text-muted-foreground">Time</div></div>
      </div>
      {isPlaying && !complete && <Button onClick={handleTap} className="w-full h-24 text-xl font-bold">Tap</Button>}
      {!isPlaying && !complete && (
        <div className="space-y-2">
          <Button onClick={() => setIsPlaying(true)} className="w-full">Start Pulse Sprint</Button>
          <Button onClick={onCancel} variant="outline" className="w-full">Cancel</Button>
        </div>
      )}
      {complete && <Button onClick={handleComplete} className="w-full">Claim Rewards</Button>}
    </div>
  );
}

// Sprint Master - Rhythm tap game
function SprintMasterGame({ questId, onComplete, onCancel }: { questId: string; onComplete: (session: GameSession) => void; onCancel: () => void }) {
  type FallingTarget = { id: number; lane: number; position: number; emoji: string };
  
  const [targets, setTargets] = useState<FallingTarget[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [misses, setMisses] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [nextId, setNextId] = useState(0);
  const [complete, setComplete] = useState(false);
  const targetHits = 20;
  const lanes = 4;
  const emojis = ['💪', '🏃', '🚴', '⚡'];

  useEffect(() => {
    if (!isPlaying || complete) return;
    
    if (!startTime) setStartTime(Date.now());

    // Spawn targets
    const spawnInterval = setInterval(() => {
      const newTarget: FallingTarget = {
        id: nextId,
        lane: Math.floor(Math.random() * lanes),
        position: 0,
        emoji: emojis[Math.floor(Math.random() * emojis.length)]
      };
      setTargets(prev => [...prev, newTarget]);
      setNextId(prev => prev + 1);
    }, 1000);

    // Move targets down
    const moveInterval = setInterval(() => {
      setTargets(prev => {
        const updated = prev.map(t => ({ ...t, position: t.position + 1 }));
        const lost = updated.filter(t => t.position > 10);
        if (lost.length > 0) {
          setMisses(m => m + lost.length);
          setCombo(0);
        }
        return updated.filter(t => t.position <= 10);
      });
    }, 100);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(moveInterval);
    };
  }, [isPlaying, complete, nextId, startTime]);

  useEffect(() => {
    if (score >= targetHits && !complete) {
      setComplete(true);
      setIsPlaying(false);
    }
  }, [score, complete]);

  const handleLaneClick = (lane: number) => {
    if (!isPlaying || complete) return;
    
    const targetsInLane = targets.filter(t => t.lane === lane && t.position >= 8 && t.position <= 10);
    if (targetsInLane.length > 0) {
      const target = targetsInLane[0];
      const hitAccuracy = 10 - target.position;
      const points = hitAccuracy === 0 ? 100 : 50;
      setScore(s => s + 1);
      setCombo(c => c + 1);
      setTargets(prev => prev.filter(t => t.id !== target.id));
    } else {
      setCombo(0);
    }
  };

  const handleComplete = () => {
    const completionTime = startTime ? Math.round((Date.now() - startTime) / 1000) : 30;
    const baseScore = 5000;
    const comboBonus = combo * 100;
    const missePenalty = misses * 150;
    const timeBonus = Math.max(3000 - (completionTime * 20), 0);
    const finalScore = Math.round(Math.max(baseScore + comboBonus + timeBonus - missePenalty, 1000));
    
    let rank: 'S' | 'A' | 'B' | 'C' | 'D' = 'D';
    if (finalScore >= 9000) rank = 'S';
    else if (finalScore >= 7500) rank = 'A';
    else if (finalScore >= 6000) rank = 'B';
    else if (finalScore >= 4500) rank = 'C';

    const session: GameSession = {
      id: crypto.randomUUID(),
      questId,
      questType: 'fitness',
      completionTime,
      score: finalScore,
      rank,
      accuracy: Math.round((score / (score + misses)) * 100) || 0,
      isPerfect: misses === 0,
      isPersonalBest: false,
      date: new Date(),
    };

    onComplete(session);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Exercise Rhythm</h3>
        <p className="text-sm md:text-base text-muted-foreground">Tap lanes when targets reach the bottom!</p>
      </div>

      <div className="space-y-3">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 text-center text-sm">
          <div className="bg-input rounded p-2">
            <div className="font-bold text-primary">{score}/{targetHits}</div>
            <div className="text-xs text-muted-foreground">Hits</div>
          </div>
          <div className="bg-input rounded p-2">
            <div className="font-bold text-secondary">{combo}</div>
            <div className="text-xs text-muted-foreground">Combo</div>
          </div>
          <div className="bg-input rounded p-2">
            <div className="font-bold text-destructive">{misses}</div>
            <div className="text-xs text-muted-foreground">Miss</div>
          </div>
          <div className="bg-input rounded p-2">
            <div className="font-bold text-accent">{startTime ? Math.round((Date.now() - startTime) / 1000) : 0}s</div>
            <div className="text-xs text-muted-foreground">Time</div>
          </div>
        </div>

        {/* Game area */}
        <div className="relative bg-input rounded-lg border-2 border-primary" style={{ height: '400px' }}>
          {/* Lanes */}
          <div className="absolute inset-0 grid grid-cols-4 gap-0">
            {Array.from({ length: lanes }).map((_, i) => (
              <button
                key={i}
                onClick={() => handleLaneClick(i)}
                className="border-r border-border last:border-r-0 hover:bg-primary/10 transition-colors relative"
                disabled={!isPlaying || complete}
              >
                {/* Hit zone indicator */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-primary/20 border-t-2 border-primary" />
              </button>
            ))}
          </div>

          {/* Falling targets */}
          {targets.map(target => (
            <div
              key={target.id}
              className="absolute transition-all duration-100 text-4xl"
              style={{
                left: `${(target.lane / lanes) * 100 + (100 / lanes / 2)}%`,
                top: `${(target.position / 10) * 100}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {target.emoji}
            </div>
          ))}
        </div>

        {/* Controls */}
        {!isPlaying && !complete && (
          <div className="space-y-2">
            <Button onClick={() => setIsPlaying(true)} className="w-full bg-primary text-primary-foreground font-bold text-lg py-6">
              Start Exercise
            </Button>
            <Button onClick={onCancel} variant="outline" className="w-full">
              Cancel
            </Button>
          </div>
        )}

        {isPlaying && !complete && (
          <Button onClick={() => setIsPlaying(false)} variant="outline" className="w-full">
            Pause
          </Button>
        )}

        {/* Complete state */}
        {complete && (
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-accent-foreground flex items-center gap-2">
                <Trophy size={20} /> Workout Complete!
              </p>
              <div className="text-sm text-muted-foreground">
                Combo: {combo} • Misses: {misses}
              </div>
            </div>
            <Button onClick={handleComplete} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
              Claim Rewards
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Sprint Circuit - Interval pace control challenge
function SprintCircuitGame({ questId, onComplete, onCancel }: { questId: string; onComplete: (session: GameSession) => void; onCancel: () => void }) {
  const [phase, setPhase] = useState<'jog' | 'sprint'>('jog');
  const [cadence, setCadence] = useState(30);
  const [distance, setDistance] = useState(0);
  const [strain, setStrain] = useState(0);
  const [timeLeft, setTimeLeft] = useState(40);
  const [switchIn, setSwitchIn] = useState(6);
  const [isPlaying, setIsPlaying] = useState(false);
  const [complete, setComplete] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [goodPhaseHits, setGoodPhaseHits] = useState(0);
  const targetDistance = 3200;

  useEffect(() => {
    if (!isPlaying || complete) return;

    if (!startTime) setStartTime(Date.now());

    const timerInterval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setComplete(true);
          setIsPlaying(false);
          return 0;
        }
        return t - 1;
      });

      setSwitchIn((s) => {
        if (s <= 1) {
          setPhase((prev) => (prev === 'jog' ? 'sprint' : 'jog'));
          return 6;
        }
        return s - 1;
      });
    }, 1000);

    const cadenceDecayInterval = setInterval(() => {
      setCadence((c) => Math.max(0, c - 3));
    }, 220);

    const progressInterval = setInterval(() => {
      setDistance((d) => {
        let gain = 0;
        if (phase === 'sprint') {
          if (cadence >= 70) {
            gain = 110;
            setGoodPhaseHits((h) => h + 1);
          } else if (cadence >= 55) {
            gain = 70;
          } else {
            gain = 35;
          }
          if (cadence >= 85) setStrain((s) => Math.min(100, s + 6));
        } else {
          if (cadence >= 30 && cadence <= 60) {
            gain = 50;
            setGoodPhaseHits((h) => h + 1);
            setStrain((s) => Math.max(0, s - 5));
          } else if (cadence > 70) {
            gain = 20;
            setStrain((s) => Math.min(100, s + 5));
          } else {
            gain = 30;
            setStrain((s) => Math.max(0, s - 2));
          }
        }

        const nextDistance = d + gain;
        if (nextDistance >= targetDistance) {
          setComplete(true);
          setIsPlaying(false);
          return targetDistance;
        }
        return nextDistance;
      });
    }, 500);

    return () => {
      clearInterval(timerInterval);
      clearInterval(cadenceDecayInterval);
      clearInterval(progressInterval);
    };
  }, [isPlaying, complete, phase, cadence, startTime]);

  useEffect(() => {
    if (strain >= 100 && !complete) {
      setCadence((c) => Math.max(20, c - 20));
      setStrain(85);
    }
  }, [strain, complete]);

  const handleStep = () => {
    if (!isPlaying || complete) return;
    setCadence((c) => Math.min(100, c + 10));
  };

  const handleBurst = () => {
    if (!isPlaying || complete) return;
    setCadence((c) => Math.min(100, c + 22));
    setStrain((s) => Math.min(100, s + 8));
  };

  const handleComplete = () => {
    const completionTime = startTime ? Math.round((Date.now() - startTime) / 1000) : 40;
    const baseScore = 5000;
    const distanceBonus = Math.round((distance / targetDistance) * 2500);
    const phaseBonus = goodPhaseHits * 30;
    const timeBonus = timeLeft * 70;
    const strainPenalty = strain * 20;
    const finalScore = Math.round(Math.max(baseScore + distanceBonus + phaseBonus + timeBonus - strainPenalty, 1000));

    let rank: 'S' | 'A' | 'B' | 'C' | 'D' = 'D';
    if (finalScore >= 9500) rank = 'S';
    else if (finalScore >= 8000) rank = 'A';
    else if (finalScore >= 6500) rank = 'B';
    else if (finalScore >= 5000) rank = 'C';

    const session: GameSession = {
      id: crypto.randomUUID(),
      questId,
      questType: 'fitness',
      completionTime,
      score: finalScore,
      rank,
      accuracy: Math.round(Math.min(100, Math.max(50, (goodPhaseHits / Math.max(1, goodPhaseHits + 15)) * 100 + 35))),
      isPerfect: strain < 20 && distance >= targetDistance,
      isPersonalBest: false,
      date: new Date(),
    };

    onComplete(session);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Sprint Circuit</h3>
        <p className="text-sm md:text-base text-muted-foreground">Control cadence through jog/sprint intervals to finish the circuit.</p>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-4 gap-2 text-center text-sm">
          <div className="bg-input rounded p-2">
            <div className="font-bold text-primary">{distance}m</div>
            <div className="text-xs text-muted-foreground">Distance</div>
          </div>
          <div className="bg-input rounded p-2">
            <div className="font-bold text-secondary">{cadence}</div>
            <div className="text-xs text-muted-foreground">Cadence</div>
          </div>
          <div className="bg-input rounded p-2">
            <div className={`font-bold ${strain >= 70 ? 'text-destructive' : 'text-accent'}`}>{strain}%</div>
            <div className="text-xs text-muted-foreground">Strain</div>
          </div>
          <div className="bg-input rounded p-2">
            <div className={`font-bold ${timeLeft <= 8 ? 'text-destructive animate-pulse' : 'text-accent'}`}>{timeLeft}s</div>
            <div className="text-xs text-muted-foreground">Time</div>
          </div>
        </div>

        <div className="bg-input rounded-lg p-4 space-y-3 border-2 border-primary/30">
          <div className="flex items-center justify-between">
            <div className={`text-lg font-bold ${phase === 'sprint' ? 'text-destructive' : 'text-green-600'}`}>
              {phase === 'sprint' ? 'SPRINT PHASE' : 'JOG PHASE'}
            </div>
            <div className="text-sm text-muted-foreground">Switch in {switchIn}s</div>
          </div>

          <div className="h-5 bg-black/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-200"
              style={{ width: `${Math.min(100, (distance / targetDistance) * 100)}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground">Target: {targetDistance}m</div>
        </div>

        {isPlaying && !complete && (
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={handleStep} className="bg-primary text-primary-foreground font-bold py-6">
              Quick Step +10
            </Button>
            <Button onClick={handleBurst} className="bg-secondary text-secondary-foreground font-bold py-6">
              Power Burst +22
            </Button>
          </div>
        )}

        {!isPlaying && !complete && (
          <div className="space-y-2">
            <Button onClick={() => setIsPlaying(true)} className="w-full bg-primary text-primary-foreground font-bold text-lg py-6">
              Start Circuit
            </Button>
            <Button onClick={onCancel} variant="outline" className="w-full">
              Cancel
            </Button>
          </div>
        )}

        {complete && (
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-accent-foreground flex items-center gap-2">
                <Trophy size={20} /> {distance >= targetDistance ? 'Circuit Complete!' : 'Session Finished!'}
              </p>
              <div className="text-sm text-muted-foreground">
                Strain: {strain}%
              </div>
            </div>
            <Button onClick={handleComplete} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
              Claim Rewards
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Power Lane - Dodging obstacles
function PowerLaneGame({ questId, onComplete, onCancel }: { questId: string; onComplete: (session: GameSession) => void; onCancel: () => void }) {
  type Obstacle = { id: number; lane: number; position: number };
  
  const [playerLane, setPlayerLane] = useState(1);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [distance, setDistance] = useState(0);
  const [hits, setHits] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [nextId, setNextId] = useState(0);
  const [complete, setComplete] = useState(false);
  const targetDistance = 100;
  const lanes = 3;

  useEffect(() => {
    if (!isPlaying || complete) return;
    
    if (!startTime) setStartTime(Date.now());

    // Spawn obstacles
    const spawnInterval = setInterval(() => {
      const newObstacle: Obstacle = {
        id: nextId,
        lane: Math.floor(Math.random() * lanes),
        position: 0,
      };
      setObstacles(prev => [...prev, newObstacle]);
      setNextId(prev => prev + 1);
    }, 1200);

    // Move obstacles and player forward
    const moveInterval = setInterval(() => {
      setDistance(d => {
        const newDistance = d + 1;
        if (newDistance >= targetDistance) {
          setComplete(true);
          setIsPlaying(false);
        }
        return newDistance;
      });

      setObstacles(prev => {
        const updated = prev.map(o => ({ ...o, position: o.position + 1 }));
        // Check collision
        const collided = updated.filter(o => o.position === 10 && o.lane === playerLane);
        if (collided.length > 0) {
          setHits(h => h + 1);
        }
        return updated.filter(o => o.position <= 10);
      });
    }, 150);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(moveInterval);
    };
  }, [isPlaying, complete, nextId, startTime, playerLane]);

  const handleComplete = () => {
    const completionTime = startTime ? Math.round((Date.now() - startTime) / 1000) : 30;
    const baseScore = 5000;
    const hitPenalty = hits * 250;
    const timeBonus = Math.max(3000 - (completionTime * 15), 0);
    const finalScore = Math.round(Math.max(baseScore + timeBonus - hitPenalty, 1000));
    
    let rank: 'S' | 'A' | 'B' | 'C' | 'D' = 'D';
    if (finalScore >= 9000) rank = 'S';
    else if (finalScore >= 7500) rank = 'A';
    else if (finalScore >= 6000) rank = 'B';
    else if (finalScore >= 4500) rank = 'C';

    const session: GameSession = {
      id: crypto.randomUUID(),
      questId,
      questType: 'fitness',
      completionTime,
      score: finalScore,
      rank,
      accuracy: Math.round(Math.max(100 - (hits * 10), 0)),
      isPerfect: hits === 0,
      isPersonalBest: false,
      date: new Date(),
    };

    onComplete(session);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Power Lane</h3>
        <p className="text-sm md:text-base text-muted-foreground">Dodge obstacles by switching lanes!</p>
      </div>

      <div className="space-y-3">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="bg-input rounded p-2">
            <div className="font-bold text-primary">{distance}m</div>
            <div className="text-xs text-muted-foreground">Distance</div>
          </div>
          <div className="bg-input rounded p-2">
            <div className="font-bold text-destructive">{hits}</div>
            <div className="text-xs text-muted-foreground">Hits</div>
          </div>
          <div className="bg-input rounded p-2">
            <div className="font-bold text-accent">{Math.round((distance / targetDistance) * 100)}%</div>
            <div className="text-xs text-muted-foreground">Progress</div>
          </div>
        </div>

        {/* Game area */}
        <div className="relative bg-input rounded-lg border-2 border-primary" style={{ height: '350px' }}>
          {/* Lanes */}
          <div className="absolute inset-0 grid grid-cols-3 gap-0">
            {Array.from({ length: lanes }).map((_, i) => (
              <div
                key={i}
                className={`border-r border-border last:border-r-0 ${i === playerLane ? 'bg-primary/10' : ''}`}
              />
            ))}
          </div>

          {/* Player */}
          <div
            className="absolute bottom-4 transition-all duration-200 text-4xl"
            style={{
              left: `${(playerLane / lanes) * 100 + (100 / lanes / 2)}%`,
              transform: 'translate(-50%, 0)'
            }}
          >
            🏃
          </div>

          {/* Obstacles */}
          {obstacles.map(obstacle => (
            <div
              key={obstacle.id}
              className="absolute transition-all duration-150 text-3xl"
              style={{
                left: `${(obstacle.lane / lanes) * 100 + (100 / lanes / 2)}%`,
                top: `${(obstacle.position / 10) * 100}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              🚧
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={() => setPlayerLane(Math.max(0, playerLane - 1))}
            disabled={!isPlaying || playerLane === 0}
            className="bg-primary text-primary-foreground"
          >
            ← Left
          </Button>
          <div className="flex items-center justify-center text-sm font-bold">
            Lane {playerLane + 1}
          </div>
          <Button
            onClick={() => setPlayerLane(Math.min(lanes - 1, playerLane + 1))}
            disabled={!isPlaying || playerLane === lanes - 1}
            className="bg-primary text-primary-foreground"
          >
            Right →
          </Button>
        </div>

        {!isPlaying && !complete && (
          <div className="space-y-2">
            <Button onClick={() => setIsPlaying(true)} className="w-full bg-primary text-primary-foreground font-bold text-lg py-6">
              Start Run
            </Button>
            <Button onClick={onCancel} variant="outline" className="w-full">
              Cancel
            </Button>
          </div>
        )}

        {complete && (
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-accent-foreground flex items-center gap-2">
                <Trophy size={20} /> Run Complete!
              </p>
              <div className="text-sm text-muted-foreground">
                Hits: {hits}
              </div>
            </div>
            <Button onClick={handleComplete} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
              Claim Rewards
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Turbo Rush - Rapid tapping challenge
function TurboRushGame({ questId, onComplete, onCancel }: { questId: string; onComplete: (session: GameSession) => void; onCancel: () => void }) {
  const [energy, setEnergy] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [complete, setComplete] = useState(false);
  const targetEnergy = 100;

  useEffect(() => {
    if (!isPlaying || complete) return;
    
    if (!startTime) setStartTime(Date.now());
    
    // Timer countdown
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setComplete(true);
          setIsPlaying(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    // Energy decay
    const decayInterval = setInterval(() => {
      setEnergy(e => Math.max(0, e - 0.5));
    }, 100);

    return () => {
      clearInterval(interval);
      clearInterval(decayInterval);
    };
  }, [isPlaying, complete, startTime]);

  useEffect(() => {
    if (energy >= targetEnergy && !complete) {
      setComplete(true);
      setIsPlaying(false);
    }
  }, [energy, complete]);

  const handleClick = () => {
    if (!isPlaying || complete) return;
    setEnergy(e => Math.min(targetEnergy, e + 2));
    setClicks(c => c + 1);
  };

  const handleComplete = () => {
    const completionTime = 20 - timeLeft;
    const baseScore = 5000;
    const clickEfficiency = clicks > 0 ? (energy / clicks) * 1000 : 0;
    const timeBonus = timeLeft * 100;
    const finalScore = Math.round(Math.max(baseScore + clickEfficiency + timeBonus, 1000));
    
    let rank: 'S' | 'A' | 'B' | 'C' | 'D' = 'D';
    if (finalScore >= 10000) rank = 'S';
    else if (finalScore >= 8000) rank = 'A';
    else if (finalScore >= 6000) rank = 'B';
    else if (finalScore >= 4500) rank = 'C';

    const session: GameSession = {
      id: crypto.randomUUID(),
      questId,
      questType: 'fitness',
      completionTime,
      score: finalScore,
      rank,
      accuracy: 100,
      isPerfect: timeLeft > 10,
      isPersonalBest: false,
      date: new Date(),
    };

    onComplete(session);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Turbo Rush</h3>
        <p className="text-sm md:text-base text-muted-foreground">Tap rapidly to fill the energy bar!</p>
      </div>

      <div className="space-y-3">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="bg-input rounded p-2">
            <div className="font-bold text-primary">{Math.round(energy)}%</div>
            <div className="text-xs text-muted-foreground">Energy</div>
          </div>
          <div className="bg-input rounded p-2">
            <div className="font-bold text-secondary">{clicks}</div>
            <div className="text-xs text-muted-foreground">Taps</div>
          </div>
          <div className="bg-input rounded p-2">
            <div className={`font-bold ${timeLeft <= 5 ? 'text-destructive animate-pulse' : 'text-accent'}`}>{timeLeft}s</div>
            <div className="text-xs text-muted-foreground">Time</div>
          </div>
        </div>

        {/* Energy bar */}
        <div className="bg-input rounded-lg p-4">
          <div className="h-20 bg-black/30 rounded-full overflow-hidden border-2 border-primary relative">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-primary transition-all duration-100"
              style={{ width: `${(energy / targetEnergy) * 100}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl">
              {Math.round(energy)}/{targetEnergy}
            </div>
          </div>
        </div>

        {/* Tap button */}
        {isPlaying && !complete && (
          <button
            onClick={handleClick}
            className="w-full h-48 bg-gradient-to-br from-primary to-secondary text-white rounded-lg font-bold text-3xl active:scale-95 transition-transform shadow-lg"
          >
            TAP! ⚡
          </button>
        )}

        {!isPlaying && !complete && (
          <div className="space-y-2">
            <Button onClick={() => setIsPlaying(true)} className="w-full bg-primary text-primary-foreground font-bold text-lg py-6">
              Start Challenge
            </Button>
            <Button onClick={onCancel} variant="outline" className="w-full">
              Cancel
            </Button>
          </div>
        )}

        {complete && (
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-accent-foreground flex items-center gap-2">
                <Trophy size={20} /> {energy >= targetEnergy ? 'Energy Full!' : 'Time Up!'}
              </p>
              <div className="text-sm text-muted-foreground">
                {clicks} taps • {Math.round(energy)}%
              </div>
            </div>
            <Button onClick={handleComplete} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
              Claim Rewards
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Mindfulness Game - Breathing rhythm
function MindfulnessGame({ questId, onComplete, onCancel }: { questId: string; onComplete: (session: GameSession) => void; onCancel: () => void }) {
  // Route to different game variants based on quest ID
  if (questId === 'quest-3') {
    return <CalmClickerGame questId={questId} onComplete={onComplete} onCancel={onCancel} />;
  }
  if (questId === 'quest-4') {
    return <MindMazeGame questId={questId} onComplete={onComplete} onCancel={onCancel} />;
  } else if (questId === 'quest-11') {
    return <FlowStateGame questId={questId} onComplete={onComplete} onCancel={onCancel} />;
  } else if (questId === 'quest-15') {
    return <BreathPatternGame questId={questId} onComplete={onComplete} onCancel={onCancel} />;
  }
  // Default to Mind Maze
  return <MindMazeGame questId={questId} onComplete={onComplete} onCancel={onCancel} />;
}

function BreathPatternGame({ questId, onComplete, onCancel }: { questId: string; onComplete: (session: GameSession) => void; onCancel: () => void }) {
  const pattern = ['Inhale', 'Hold', 'Exhale', 'Hold'];
  const [step, setStep] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const targetCycles = 6;

  const handleChoice = (choice: string) => {
    if (!startTime) setStartTime(Date.now());
    if (choice !== pattern[step]) {
      setMistakes((m) => m + 1);
      return;
    }

    const nextStep = (step + 1) % pattern.length;
    setStep(nextStep);
    if (nextStep === 0) setCycles((c) => c + 1);
  };

  const complete = cycles >= targetCycles;

  const handleComplete = () => {
    const completionTime = startTime ? Math.round((Date.now() - startTime) / 1000) : 40;
    const score = Math.max(1000, Math.round(5200 + (cycles * 700) - (mistakes * 220)));
    const session: GameSession = {
      id: crypto.randomUUID(),
      questId,
      questType: 'mindfulness',
      completionTime,
      score,
      rank: getRankFromScore(score),
      accuracy: Math.max(30, Math.round((cycles * pattern.length / Math.max((cycles * pattern.length) + mistakes, 1)) * 100)),
      isPerfect: mistakes === 0,
      isPersonalBest: false,
      date: new Date(),
    };
    onComplete(session);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-2xl font-bold">Breath Pattern</h3>
      <p className="text-sm text-muted-foreground">Follow the cycle exactly: Inhale, Hold, Exhale, Hold.</p>
      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <div className="bg-input rounded p-2"><div className="font-bold text-primary">{cycles}/{targetCycles}</div><div className="text-xs text-muted-foreground">Cycles</div></div>
        <div className="bg-input rounded p-2"><div className="font-bold text-secondary">{pattern[step]}</div><div className="text-xs text-muted-foreground">Next Step</div></div>
        <div className="bg-input rounded p-2"><div className="font-bold text-destructive">{mistakes}</div><div className="text-xs text-muted-foreground">Mistakes</div></div>
      </div>
      {!complete && (
        <div className="grid grid-cols-2 gap-2">
          {pattern.map((choice, index) => (
            <Button key={`${choice}-${index}`} onClick={() => handleChoice(choice)} variant="outline">{choice}</Button>
          ))}
        </div>
      )}
      {!startTime && !complete && <Button onClick={onCancel} variant="outline" className="w-full">Cancel</Button>}
      {complete && <Button onClick={handleComplete} className="w-full">Claim Rewards</Button>}
    </div>
  );
}

// Calm Clicker - Click inside the calm timing zone
function CalmClickerGame({ questId, onComplete, onCancel }: { questId: string; onComplete: (session: GameSession) => void; onCancel: () => void }) {
  const [pulse, setPulse] = useState(50);
  const [direction, setDirection] = useState(1);
  const [perfect, setPerfect] = useState(0);
  const [good, setGood] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(35);
  const [isPlaying, setIsPlaying] = useState(false);
  const [complete, setComplete] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const targetCalmClicks = 18;

  useEffect(() => {
    if (!isPlaying || complete) return;

    if (!startTime) setStartTime(Date.now());

    const pulseInterval = setInterval(() => {
      setPulse((p) => {
        let next = p + (direction * 4);
        if (next >= 100) {
          next = 100;
          setDirection(-1);
        } else if (next <= 0) {
          next = 0;
          setDirection(1);
        }
        return next;
      });
    }, 60);

    const timerInterval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setComplete(true);
          setIsPlaying(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      clearInterval(pulseInterval);
      clearInterval(timerInterval);
    };
  }, [isPlaying, complete, direction, startTime]);

  useEffect(() => {
    if (perfect + good >= targetCalmClicks && !complete) {
      setComplete(true);
      setIsPlaying(false);
    }
  }, [perfect, good, complete]);

  const handleClick = () => {
    if (!isPlaying || complete) return;

    const distanceFromCenter = Math.abs(pulse - 50);
    if (distanceFromCenter <= 8) {
      setPerfect((p) => p + 1);
    } else if (distanceFromCenter <= 18) {
      setGood((g) => g + 1);
    } else {
      setMisses((m) => m + 1);
    }
  };

  const handleComplete = () => {
    const completionTime = startTime ? Math.round((Date.now() - startTime) / 1000) : 35;
    const baseScore = 5000;
    const perfectBonus = perfect * 220;
    const goodBonus = good * 140;
    const missPenalty = misses * 250;
    const timeBonus = timeLeft * 80;
    const finalScore = Math.round(Math.max(baseScore + perfectBonus + goodBonus + timeBonus - missPenalty, 1000));

    let rank: 'S' | 'A' | 'B' | 'C' | 'D' = 'D';
    if (finalScore >= 9500) rank = 'S';
    else if (finalScore >= 8000) rank = 'A';
    else if (finalScore >= 6500) rank = 'B';
    else if (finalScore >= 5000) rank = 'C';

    const totalClicks = perfect + good + misses;
    const session: GameSession = {
      id: crypto.randomUUID(),
      questId,
      questType: 'mindfulness',
      completionTime,
      score: finalScore,
      rank,
      accuracy: Math.round(totalClicks > 0 ? ((perfect + good) / totalClicks) * 100 : 0),
      isPerfect: misses === 0,
      isPersonalBest: false,
      date: new Date(),
    };

    onComplete(session);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Calm Clicker</h3>
        <p className="text-sm md:text-base text-muted-foreground">Tap when the pulse marker is inside the calm zone.</p>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-4 gap-2 text-center text-sm">
          <div className="bg-input rounded p-2">
            <div className="font-bold text-green-600">{perfect}</div>
            <div className="text-xs text-muted-foreground">Perfect</div>
          </div>
          <div className="bg-input rounded p-2">
            <div className="font-bold text-primary">{good}</div>
            <div className="text-xs text-muted-foreground">Good</div>
          </div>
          <div className="bg-input rounded p-2">
            <div className="font-bold text-destructive">{misses}</div>
            <div className="text-xs text-muted-foreground">Miss</div>
          </div>
          <div className="bg-input rounded p-2">
            <div className={`font-bold ${timeLeft <= 8 ? 'text-destructive animate-pulse' : 'text-accent'}`}>{timeLeft}s</div>
            <div className="text-xs text-muted-foreground">Time</div>
          </div>
        </div>

        <div className="bg-input rounded-lg p-4 border-2 border-primary/30 space-y-3">
          <div className="relative h-10 bg-black/20 rounded-full overflow-hidden">
            <div className="absolute inset-y-0 left-[42%] right-[42%] bg-green-500/35 border-x border-green-500/60" />
            <div
              className="absolute top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-primary shadow-lg transition-all duration-75"
              style={{ left: `calc(${pulse}% - 16px)` }}
            />
          </div>
          <div className="text-center text-sm text-muted-foreground">Goal: {perfect + good}/{targetCalmClicks} calm clicks</div>
        </div>

        {isPlaying && !complete && (
          <button
            onClick={handleClick}
            className="w-full h-28 bg-primary text-primary-foreground rounded-lg font-bold text-2xl hover:scale-[1.01] active:scale-95 transition-transform"
          >
            Click Calmly
          </button>
        )}

        {!isPlaying && !complete && (
          <div className="space-y-2">
            <Button onClick={() => setIsPlaying(true)} className="w-full bg-primary text-primary-foreground font-bold text-lg py-6">
              Start Calm Clicker
            </Button>
            <Button onClick={onCancel} variant="outline" className="w-full">
              Cancel
            </Button>
          </div>
        )}

        {complete && (
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-accent-foreground flex items-center gap-2">
                <Star size={20} /> {perfect + good >= targetCalmClicks ? 'Calm Achieved!' : 'Session Complete!'}
              </p>
              <div className="text-sm text-muted-foreground">
                {perfect} perfect • {misses} miss
              </div>
            </div>
            <Button onClick={handleComplete} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
              Claim Rewards
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Mind Maze - Pattern memory game
function MindMazeGame({ questId, onComplete, onCancel }: { questId: string; onComplete: (session: GameSession) => void; onCancel: () => void }) {
  const [pattern, setPattern] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [phase, setPhase] = useState<'show' | 'input' | 'complete'>('show');
  const [round, setRound] = useState(1);
  const [showingIndex, setShowingIndex] = useState(0);
  const [showingSubIndex, setShowingSubIndex] = useState(0); // 0 = first pulse, 1 = second pulse (if double)
  const [mistakes, setMistakes] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const colors = [
    { id: 0, color: 'bg-blue-500', name: 'Calm', emoji: '🌊' },
    { id: 1, color: 'bg-green-500', name: 'Peace', emoji: '🌿' },
    { id: 2, color: 'bg-purple-500', name: 'Clarity', emoji: '💜' },
    { id: 3, color: 'bg-yellow-500', name: 'Joy', emoji: '☀️' }
  ];
  const targetRounds = 5;

  useEffect(() => {
    if (phase === 'show' && pattern.length === 0) {
      if (!startTime) setStartTime(Date.now());
      // Generate a new pattern
      const newPattern = Array.from({ length: round + 2 }, () => Math.floor(Math.random() * 4));
      setPattern(newPattern);
      setShowingIndex(0);
    }
  }, [phase, pattern, round, startTime]);

  useEffect(() => {
    if (phase === 'show' && pattern.length > 0) {
      if (showingIndex < pattern.length) {
        // Check if the current color is the same as the next color (consecutive same colors)
        const currentColor = pattern[showingIndex];
        const nextColor = pattern[showingIndex + 1];
        const isDoublePulse = currentColor === nextColor;
        
        if (isDoublePulse) {
          // For double pulse: show, reset, show again
          if (showingSubIndex === 0) {
            // First pulse - show for 500ms
            const timeout = setTimeout(() => {
              setShowingSubIndex(1); // Move to second pulse
            }, 500);
            return () => clearTimeout(timeout);
          } else if (showingSubIndex === 1) {
            // Reset briefly - 200ms gap
            const timeout = setTimeout(() => {
              setShowingSubIndex(2); // Move to actual second pulse
            }, 200);
            return () => clearTimeout(timeout);
          } else {
            // Second pulse - show for 500ms then move to next
            const timeout = setTimeout(() => {
              setShowingIndex(prev => prev + 1);
              setShowingSubIndex(0);
            }, 500);
            return () => clearTimeout(timeout);
          }
        } else {
          // Single pulse - show for 800ms
          const timeout = setTimeout(() => {
            setShowingIndex(prev => prev + 1);
            setShowingSubIndex(0);
          }, 800);
          return () => clearTimeout(timeout);
        }
      } else {
        // Pattern shown, switch to input
        setTimeout(() => setPhase('input'), 500);
      }
    }
  }, [phase, showingIndex, showingSubIndex, pattern]);

  const handleColorClick = (colorId: number) => {
    if (phase !== 'input') return;

    const newInput = [...playerInput, colorId];
    setPlayerInput(newInput);

    // Check if correct
    if (colorId !== pattern[newInput.length - 1]) {
      setMistakes(m => m + 1);
      // Wrong - restart this round
      setTimeout(() => {
        setPlayerInput([]);
        setPattern([]);
        setPhase('show');
      }, 500);
      return;
    }

    // Check if pattern complete
    if (newInput.length === pattern.length) {
      if (round >= targetRounds) {
        setPhase('complete');
      } else {
        setTimeout(() => {
          setRound(r => r + 1);
          setPlayerInput([]);
          setPattern([]);
          setPhase('show');
        }, 800);
      }
    }
  };

  const handleComplete = () => {
    const completionTime = startTime ? Math.round((Date.now() - startTime) / 1000) : 60;
    const baseScore = 5000;
    const roundBonus = round * 500;
    const mistakePenalty = mistakes * 400;
    const timeBonus = Math.max(2000 - (completionTime * 15), 0);
    const finalScore = Math.round(Math.max(baseScore + roundBonus + timeBonus - mistakePenalty, 1000));
    
    let rank: 'S' | 'A' | 'B' | 'C' | 'D' = 'D';
    if (finalScore >= 9000) rank = 'S';
    else if (finalScore >= 7500) rank = 'A';
    else if (finalScore >= 6000) rank = 'B';
    else if (finalScore >= 4500) rank = 'C';

    const session: GameSession = {
      id: crypto.randomUUID(),
      questId,
      questType: 'mindfulness',
      completionTime,
      score: finalScore,
      rank,
      accuracy: Math.round(Math.max(100 - (mistakes * 15), 50)),
      isPerfect: mistakes === 0,
      isPersonalBest: false,
      date: new Date(),
    };

    onComplete(session);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Mindfulness Memory</h3>
        <p className="text-sm md:text-base text-muted-foreground">Remember and repeat the meditation pattern!</p>
      </div>

      <div className="space-y-3">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="bg-input rounded p-2">
            <div className="font-bold text-primary">{round}/{targetRounds}</div>
            <div className="text-xs text-muted-foreground">Round</div>
          </div>
          <div className="bg-input rounded p-2">
            <div className="font-bold text-destructive">{mistakes}</div>
            <div className="text-xs text-muted-foreground">Mistakes</div>
          </div>
          <div className="bg-input rounded p-2">
            <div className="font-bold text-accent">{pattern.length}</div>
            <div className="text-xs text-muted-foreground">Sequence</div>
          </div>
        </div>

        {/* Phase indicator */}
        <div className="text-center py-3 bg-input rounded-lg">
          <p className="text-lg font-bold text-primary">
            {phase === 'show' && '👁️ Watch the Pattern'}
            {phase === 'input' && '🧠 Repeat the Pattern'}
            {phase === 'complete' && '✨ Complete!'}
          </p>
          {phase === 'input' && (
            <p className="text-sm text-muted-foreground mt-1">
              {playerInput.length}/{pattern.length} correct
            </p>
          )}
        </div>

        {/* Color buttons */}
        <div className="grid grid-cols-2 gap-2">
          {colors.map(({ id, color, name, emoji }) => {
            // Show the current color being displayed
            const isActive = phase === 'show' && pattern[showingIndex] === id && showingSubIndex < 2;
            
            return (
              <button
                key={id}
                onClick={() => handleColorClick(id)}
                disabled={phase !== 'input'}
                className={`
                  ${color} 
                  ${isActive ? 'scale-110 ring-4 ring-white shadow-lg shadow-white' : 'scale-100'}
                  ${phase !== 'input' ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 opacity-90 hover:opacity-100'}
                  h-20 rounded-lg transition-all duration-150 flex flex-col items-center justify-center text-white font-bold shadow-lg gap-1
                `}
              >
                <div className="text-2xl">{emoji}</div>
                <div className="text-xs">{name}</div>
              </button>
            );
          })}
        </div>

        {/* Complete state */}
        {phase === 'complete' && (
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-accent-foreground flex items-center gap-2">
                <Star size={20} /> Meditation Complete!
              </p>
              <div className="text-sm text-muted-foreground">
                Mistakes: {mistakes}
              </div>
            </div>
            <Button onClick={handleComplete} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
              Claim Rewards
            </Button>
          </div>
        )}

        {phase === 'show' && pattern.length === 0 && (
          <Button onClick={onCancel} variant="outline" className="w-full">
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

// Flow State - Focus tracking game
function FlowStateGame({ questId, onComplete, onCancel }: { questId: string; onComplete: (session: GameSession) => void; onCancel: () => void }) {
  const [focusLevel, setFocusLevel] = useState(50);
  const [distractions, setDistractions] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);
  const [blocked, setBlocked] = useState(0);
  const [missed, setMissed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [complete, setComplete] = useState(false);
  const [nextId, setNextId] = useState(0);
  const targetFocus = 100;
  const distractionEmojis = ['📱', '📺', '🎮', '🔔', '💬'];

  useEffect(() => {
    if (!isPlaying || complete) return;
    
    if (!startTime) setStartTime(Date.now());
    
    // Timer
    const timerInterval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setComplete(true);
          setIsPlaying(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    // Spawn distractions
    const spawnInterval = setInterval(() => {
      const newDistraction = {
        id: nextId,
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        emoji: distractionEmojis[Math.floor(Math.random() * distractionEmojis.length)]
      };
      setDistractions(prev => [...prev, newDistraction]);
      setNextId(prev => prev + 1);

      setTimeout(() => {
        setDistractions(prev => {
          const stillThere = prev.find(d => d.id === newDistraction.id);
          if (stillThere) {
            setMissed(m => m + 1);
            setFocusLevel(f => Math.max(0, f - 10));
          }
          return prev.filter(d => d.id !== newDistraction.id);
        });
      }, 2500);
    }, 1500);

    // Increase focus passively
    const focusInterval = setInterval(() => {
      setFocusLevel(f => Math.min(targetFocus, f + 1));
    }, 500);

    return () => {
      clearInterval(timerInterval);
      clearInterval(spawnInterval);
      clearInterval(focusInterval);
    };
  }, [isPlaying, complete, startTime, nextId]);

  useEffect(() => {
    if (focusLevel >= targetFocus && !complete) {
      setComplete(true);
      setIsPlaying(false);
    }
  }, [focusLevel, complete]);

  const handleDistractionClick = (id: number) => {
    setDistractions(prev => prev.filter(d => d.id !== id));
    setBlocked(b => b + 1);
    setFocusLevel(f => Math.min(targetFocus, f + 5));
  };

  const handleComplete = () => {
    const completionTime = 30 - timeLeft;
    const baseScore = 5000;
    const blockedBonus = blocked * 200;
    const missedPenalty = missed * 300;
    const timeBonus = timeLeft * 100;
    const finalScore = Math.round(Math.max(baseScore + blockedBonus + timeBonus - missedPenalty, 1000));
    
    let rank: 'S' | 'A' | 'B' | 'C' | 'D' = 'D';
    if (finalScore >= 9000) rank = 'S';
    else if (finalScore >= 7500) rank = 'A';
    else if (finalScore >= 6000) rank = 'B';
    else if (finalScore >= 4500) rank = 'C';

    const session: GameSession = {
      id: crypto.randomUUID(),
      questId,
      questType: 'mindfulness',
      completionTime,
      score: finalScore,
      rank,
      accuracy: Math.round((blocked / (blocked + missed)) * 100) || 0,
      isPerfect: missed === 0,
      isPersonalBest: false,
      date: new Date(),
    };

    onComplete(session);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Flow State</h3>
        <p className="text-sm md:text-base text-muted-foreground">Block distractions to maintain focus!</p>
      </div>

      <div className="space-y-3">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 text-center text-sm">
          <div className="bg-input rounded p-2">
            <div className="font-bold text-primary">{Math.round(focusLevel)}%</div>
            <div className="text-xs text-muted-foreground">Focus</div>
          </div>
          <div className="bg-input rounded p-2">
            <div className="font-bold text-green-500">{blocked}</div>
            <div className="text-xs text-muted-foreground">Blocked</div>
          </div>
          <div className="bg-input rounded p-2">
            <div className="font-bold text-destructive">{missed}</div>
            <div className="text-xs text-muted-foreground">Missed</div>
          </div>
          <div className="bg-input rounded p-2">
            <div className={`font-bold ${timeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-accent'}`}>{timeLeft}s</div>
            <div className="text-xs text-muted-foreground">Time</div>
          </div>
        </div>

        {/* Focus bar */}
        <div className="bg-input rounded-lg p-3">
          <div className="h-8 bg-black/30 rounded-full overflow-hidden border-2 border-primary relative">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${(focusLevel / targetFocus) * 100}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
              Focus: {Math.round(focusLevel)}%
            </div>
          </div>
        </div>

        {/* Game area */}
        {isPlaying && !complete && (
          <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg border-2 border-primary" style={{ height: '300px' }}>
            <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20">
              🧘
            </div>
            {distractions.map(distraction => (
              <button
                key={distraction.id}
                onClick={() => handleDistractionClick(distraction.id)}
                className="absolute text-3xl animate-bounce hover:scale-125 transition-transform"
                style={{
                  left: `${distraction.x}%`,
                  top: `${distraction.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {distraction.emoji}
              </button>
            ))}
          </div>
        )}

        {!isPlaying && !complete && (
          <div className="space-y-2">
            <Button onClick={() => setIsPlaying(true)} className="w-full bg-primary text-primary-foreground font-bold text-lg py-6">
              Enter Flow State
            </Button>
            <Button onClick={onCancel} variant="outline" className="w-full">
              Cancel
            </Button>
          </div>
        )}

        {complete && (
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-accent-foreground flex items-center gap-2">
                <Star size={20} /> {focusLevel >= targetFocus ? 'Perfect Focus!' : 'Session Complete!'}
              </p>
              <div className="text-sm text-muted-foreground">
                {blocked} blocked • {missed} missed
              </div>
            </div>
            <Button onClick={handleComplete} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
              Claim Rewards
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Nutrition Game - Food matching
function NutritionGame({ questId, onComplete, onCancel }: { questId: string; onComplete: (session: GameSession) => void; onCancel: () => void }) {
  // Route to different game variants based on quest ID
  if (questId === 'quest-5') {
    return <PlateBuilderGame questId={questId} onComplete={onComplete} onCancel={onCancel} />;
  } else if (questId === 'quest-6') {
    return <MacroStackerGame questId={questId} onComplete={onComplete} onCancel={onCancel} />;
  } else if (questId === 'quest-12') {
    return <KitchenGrandmasterGame questId={questId} onComplete={onComplete} onCancel={onCancel} />;
  } else if (questId === 'quest-16') {
    return <PortionControlGame questId={questId} onComplete={onComplete} onCancel={onCancel} />;
  }
  // Default to Recipe Master
  return <PlateBuilderGame questId={questId} onComplete={onComplete} onCancel={onCancel} />;
}

function PortionControlGame({ questId, onComplete, onCancel }: { questId: string; onComplete: (session: GameSession) => void; onCancel: () => void }) {
  type Round = { label: string; good: string[]; choices: string[] };
  const rounds: Round[] = [
    { label: 'High Protein Plate', good: ['🍗', '🥚'], choices: ['🍗', '🥚', '🍩', '🍟'] },
    { label: 'Balanced Carbs', good: ['🍚', '🥔'], choices: ['🍚', '🥔', '🍫', '🧁'] },
    { label: 'Healthy Fats', good: ['🥑', '🥜'], choices: ['🥑', '🥜', '🍬', '🥤'] },
  ];

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  const current = rounds[index];
  const complete = index >= rounds.length;

  const toggleChoice = (emoji: string) => {
    if (!startTime) setStartTime(Date.now());
    setSelected((prev) => prev.includes(emoji) ? prev.filter((i) => i !== emoji) : [...prev, emoji]);
  };

  const submitRound = () => {
    const isCorrect = current.good.every((emoji) => selected.includes(emoji)) && selected.length === current.good.length;
    if (!isCorrect) setMistakes((m) => m + 1);
    setSelected([]);
    setIndex((i) => i + 1);
  };

  const handleComplete = () => {
    const completionTime = startTime ? Math.round((Date.now() - startTime) / 1000) : 35;
    const score = Math.max(1000, Math.round(5500 + ((rounds.length - mistakes) * 900) - (mistakes * 250)));
    const session: GameSession = {
      id: crypto.randomUUID(),
      questId,
      questType: 'nutrition',
      completionTime,
      score,
      rank: getRankFromScore(score),
      accuracy: Math.max(30, Math.round(((rounds.length - mistakes) / rounds.length) * 100)),
      isPerfect: mistakes === 0,
      isPersonalBest: false,
      date: new Date(),
    };
    onComplete(session);
  };

  if (complete) {
    return (
      <div className="space-y-3">
        <h3 className="text-2xl font-bold">Portion Control</h3>
        <p className="text-sm text-muted-foreground">Rounds complete. Mistakes: {mistakes}</p>
        <Button onClick={handleComplete} className="w-full">Claim Rewards</Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-2xl font-bold">Portion Control</h3>
      <p className="text-sm text-muted-foreground">Pick only the healthy pair for each goal.</p>
      <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-center font-semibold">{current.label}</div>
      <div className="grid grid-cols-2 gap-2">
        {current.choices.map((emoji) => (
          <Button key={emoji} variant={selected.includes(emoji) ? 'default' : 'outline'} onClick={() => toggleChoice(emoji)} className="h-16 text-2xl">
            {emoji}
          </Button>
        ))}
      </div>
      <Button onClick={submitRound} disabled={selected.length === 0} className="w-full">Submit Round</Button>
      {!startTime && <Button onClick={onCancel} variant="outline" className="w-full">Cancel</Button>}
    </div>
  );
}

// Plate Builder - Match ingredients to recipes
function PlateBuilderGame({ questId, onComplete, onCancel }: { questId: string; onComplete: (session: GameSession) => void; onCancel: () => void }) {
  type Recipe = { name: string; emoji: string; ingredients: string[] };
  type Ingredient = { emoji: string; name: string };
  
  const recipes: Recipe[] = [
    { name: 'Salad', emoji: '🥗', ingredients: ['🥬', '🥕', '🥒'] },
    { name: 'Smoothie', emoji: '🥤', ingredients: ['🍓', '🍌', '🥛'] },
    { name: 'Sandwich', emoji: '🥪', ingredients: ['🍞', '🥬', '🧀'] },
    { name: 'Soup', emoji: '🍲', ingredients: ['🥕', '🥔', '🌿'] },
    { name: 'Stir Fry', emoji: '🍜', ingredients: ['🥦', '🥕', '🍚'] }
  ];

  const allIngredients: Ingredient[] = [
    { emoji: '🥬', name: 'Lettuce' }, { emoji: '🥕', name: 'Carrot' }, { emoji: '🥒', name: 'Cucumber' },
    { emoji: '🍓', name: 'Strawberry' }, { emoji: '🍌', name: 'Banana' }, { emoji: '🥛', name: 'Milk' },
    { emoji: '🍞', name: 'Bread' }, { emoji: '🧀', name: 'Cheese' }, { emoji: '🥔', name: 'Potato' },
    { emoji: '🌿', name: 'Herbs' }, { emoji: '🥦', name: 'Broccoli' }, { emoji: '🍚', name: 'Rice' }
  ];

  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [complete, setComplete] = useState(false);
  const targetScore = 5;

  useEffect(() => {
    if (!isPlaying || complete) return;
    
    if (!startTime) setStartTime(Date.now());
    
    // Timer countdown
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setComplete(true);
          setIsPlaying(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, complete, startTime]);

  useEffect(() => {
    if (isPlaying && !currentRecipe) {
      setCurrentRecipe(recipes[Math.floor(Math.random() * recipes.length)]);
    }
  }, [isPlaying, currentRecipe]);

  useEffect(() => {
    if (score >= targetScore && !complete) {
      setComplete(true);
      setIsPlaying(false);
    }
  }, [score, complete]);

  const handleIngredientClick = (ingredientEmoji: string) => {
    if (!currentRecipe || complete) return;

    const newSelected = [...selectedIngredients, ingredientEmoji];
    setSelectedIngredients(newSelected);

    // Check if correct ingredient
    if (!currentRecipe.ingredients.includes(ingredientEmoji)) {
      setMistakes(m => m + 1);
      setTimeout(() => setSelectedIngredients([]), 500);
      return;
    }

    // Check if recipe is complete
    if (newSelected.length === currentRecipe.ingredients.length) {
      const allCorrect = currentRecipe.ingredients.every(ing => newSelected.includes(ing));
      if (allCorrect) {
        setScore(s => s + 1);
        setTimeout(() => {
          setSelectedIngredients([]);
          setCurrentRecipe(recipes[Math.floor(Math.random() * recipes.length)]);
        }, 500);
      } else {
        setMistakes(m => m + 1);
        setTimeout(() => setSelectedIngredients([]), 500);
      }
    }
  };

  const handleComplete = () => {
    const completionTime = 60 - timeLeft;
    const baseScore = 5000;
    const recipeBonus = score * 800;
    const mistakePenalty = mistakes * 200;
    const timeBonus = timeLeft * 30;
    const finalScore = Math.round(Math.max(baseScore + recipeBonus + timeBonus - mistakePenalty, 1000));
    
    let rank: 'S' | 'A' | 'B' | 'C' | 'D' = 'D';
    if (finalScore >= 9000) rank = 'S';
    else if (finalScore >= 7500) rank = 'A';
    else if (finalScore >= 6000) rank = 'B';
    else if (finalScore >= 4500) rank = 'C';

    const session: GameSession = {
      id: crypto.randomUUID(),
      questId,
      questType: 'nutrition',
      completionTime,
      score: finalScore,
      rank,
      accuracy: Math.round((score / (score + mistakes)) * 100) || 0,
      isPerfect: mistakes === 0 && score >= targetScore,
      isPersonalBest: false,
      date: new Date(),
    };

    onComplete(session);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Recipe Master</h3>
        <p className="text-sm md:text-base text-muted-foreground">Match ingredients to recipes before time runs out!</p>
      </div>

      <div className="space-y-3">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 text-center text-sm">
          <div className="bg-input rounded p-2">
            <div className="font-bold text-primary">{score}/{targetScore}</div>
            <div className="text-xs text-muted-foreground">Recipes</div>
          </div>
          <div className="bg-input rounded p-2">
            <div className="font-bold text-destructive">{mistakes}</div>
            <div className="text-xs text-muted-foreground">Errors</div>
          </div>
          <div className="bg-input rounded p-2">
            <div className={`font-bold ${timeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-accent'}`}>{timeLeft}s</div>
            <div className="text-xs text-muted-foreground">Time</div>
          </div>
          <div className="bg-input rounded p-2">
            <div className="font-bold text-secondary">{selectedIngredients.length}/{currentRecipe?.ingredients.length || 0}</div>
            <div className="text-xs text-muted-foreground">Selected</div>
          </div>
        </div>

        {/* Current recipe */}
        {currentRecipe && isPlaying && (
          <div className="bg-primary/10 border-2 border-primary rounded-lg p-3 text-center">
            <div className="text-3xl mb-1">{currentRecipe.emoji}</div>
            <p className="text-base font-bold text-primary">{currentRecipe.name}</p>
            <p className="text-xs text-muted-foreground">Select {currentRecipe.ingredients.length} ingredients</p>
          </div>
        )}

        {/* Selected ingredients */}
        {selectedIngredients.length > 0 && isPlaying && (
          <div className="bg-accent/10 rounded-lg p-2 flex gap-2 justify-center items-center flex-wrap">
            {selectedIngredients.map((ing, i) => (
              <div key={i} className="text-2xl">{ing}</div>
            ))}
          </div>
        )}

        {/* Ingredient grid */}
        {isPlaying && !complete && (
          <div className="grid grid-cols-4 gap-1.5">
            {allIngredients.map(({ emoji, name }) => (
              <button
                key={emoji}
                onClick={() => handleIngredientClick(emoji)}
                disabled={selectedIngredients.includes(emoji)}
                className={`
                  rounded-lg p-2 flex flex-col items-center justify-center transition-all
                  ${selectedIngredients.includes(emoji) 
                    ? 'bg-primary/20 opacity-50 cursor-not-allowed' 
                    : 'bg-input hover:bg-primary/20 hover:scale-105'}
                `}
              >
                <div className="text-2xl">{emoji}</div>
                <div className="text-xs text-muted-foreground leading-tight">{name}</div>
              </button>
            ))}
          </div>
        )}

        {/* Start button */}
        {!isPlaying && !complete && (
          <div className="space-y-2">
            <Button onClick={() => setIsPlaying(true)} className="w-full bg-primary text-primary-foreground font-bold text-lg py-6">
              Start Cooking
            </Button>
            <Button onClick={onCancel} variant="outline" className="w-full">
              Cancel
            </Button>
          </div>
        )}

        {/* Complete state */}
        {complete && (
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-accent-foreground flex items-center gap-2">
                <Trophy size={20} /> {score >= targetScore ? 'Recipes Complete!' : 'Time Up!'}
              </p>
              <div className="text-sm text-muted-foreground">
                Score: {score} • Errors: {mistakes}
              </div>
            </div>
            <Button onClick={handleComplete} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
              Claim Rewards
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Macro Stacker - Stack macronutrients to target values
function MacroStackerGame({ questId, onComplete, onCancel }: { questId: string; onComplete: (session: GameSession) => void; onCancel: () => void }) {
  type Food = { emoji: string; name: string; protein: number; carbs: number; fats: number };
  
  const foods: Food[] = [
    { emoji: '🍗', name: 'Chicken', protein: 30, carbs: 0, fats: 5 },
    { emoji: '🍚', name: 'Rice', protein: 4, carbs: 45, fats: 1 },
    { emoji: '🥑', name: 'Avocado', protein: 2, carbs: 9, fats: 15 },
    { emoji: '🥚', name: 'Egg', protein: 6, carbs: 1, fats: 5 },
    { emoji: '🥔', name: 'Potato', protein: 2, carbs: 37, fats: 0 },
    { emoji: '🥜', name: 'Nuts', protein: 6, carbs: 6, fats: 14 },
    { emoji: '🥦', name: 'Broccoli', protein: 3, carbs: 7, fats: 0 },
    { emoji: '🍌', name: 'Banana', protein: 1, carbs: 27, fats: 0 },
  ];

  const [targetMacros] = useState({
    protein: Math.floor(Math.random() * 20) + 30, // 30-50g
    carbs: Math.floor(Math.random() * 30) + 40, // 40-70g
    fats: Math.floor(Math.random() * 15) + 15, // 15-30g
  });

  const [selectedFoods, setSelectedFoods] = useState<Food[]>([]);
  const [round, setRound] = useState(1);
  const [mistakes, setMistakes] = useState(0);
  const [complete, setComplete] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const targetRounds = 3;

  const currentMacros = selectedFoods.reduce(
    (acc, food) => ({
      protein: acc.protein + food.protein,
      carbs: acc.carbs + food.carbs,
      fats: acc.fats + food.fats,
    }),
    { protein: 0, carbs: 0, fats: 0 }
  );

  const handleFoodClick = (food: Food) => {
    if (!startTime) setStartTime(Date.now());
    setSelectedFoods([...selectedFoods, food]);
  };

  const handleSubmit = () => {
    const proteinDiff = Math.abs(currentMacros.protein - targetMacros.protein);
    const carbsDiff = Math.abs(currentMacros.carbs - targetMacros.carbs);
    const fatsDiff = Math.abs(currentMacros.fats - targetMacros.fats);
    const totalDiff = proteinDiff + carbsDiff + fatsDiff;

    if (totalDiff > 15) {
      setMistakes(m => m + 1);
      setSelectedFoods([]);
      return;
    }

    if (round >= targetRounds) {
      setComplete(true);
    } else {
      setRound(r => r + 1);
      setSelectedFoods([]);
    }
  };

  const handleComplete = () => {
    const completionTime = startTime ? Math.round((Date.now() - startTime) / 1000) : 60;
    const baseScore = 5000;
    const roundBonus = round * 1000;
    const mistakePenalty = mistakes * 600;
    const timeBonus = Math.max(3000 - (completionTime * 20), 0);
    const finalScore = Math.round(Math.max(baseScore + roundBonus + timeBonus - mistakePenalty, 1000));
    
    let rank: 'S' | 'A' | 'B' | 'C' | 'D' = 'D';
    if (finalScore >= 9000) rank = 'S';
    else if (finalScore >= 7500) rank = 'A';
    else if (finalScore >= 6000) rank = 'B';
    else if (finalScore >= 4500) rank = 'C';

    const session: GameSession = {
      id: crypto.randomUUID(),
      questId,
      questType: 'nutrition',
      completionTime,
      score: finalScore,
      rank,
      accuracy: Math.round(Math.max(100 - (mistakes * 20), 50)),
      isPerfect: mistakes === 0,
      isPersonalBest: false,
      date: new Date(),
    };

    onComplete(session);
  };

  const getMacroStatus = (current: number, target: number) => {
    const diff = Math.abs(current - target);
    if (diff <= 5) return 'text-green-500';
    if (diff <= 10) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Macro Stacker</h3>
        <p className="text-sm md:text-base text-muted-foreground">Stack foods to hit target macros!</p>
      </div>

      <div className="space-y-3">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 text-center text-sm">
          <div className="bg-input rounded p-2">
            <div className="font-bold text-primary">{round}/{targetRounds}</div>
            <div className="text-xs text-muted-foreground">Round</div>
          </div>
          <div className="bg-input rounded p-2">
            <div className="font-bold text-destructive">{mistakes}</div>
            <div className="text-xs text-muted-foreground">Mistakes</div>
          </div>
        </div>

        {/* Target Macros */}
        <div className="bg-primary/10 border-2 border-primary rounded-lg p-3">
          <p className="text-sm font-bold text-center mb-2">Target Macros:</p>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <div className="font-bold text-blue-500">Protein</div>
              <div className={getMacroStatus(currentMacros.protein, targetMacros.protein)}>
                {currentMacros.protein}g / {targetMacros.protein}g
              </div>
            </div>
            <div>
              <div className="font-bold text-orange-500">Carbs</div>
              <div className={getMacroStatus(currentMacros.carbs, targetMacros.carbs)}>
                {currentMacros.carbs}g / {targetMacros.carbs}g
              </div>
            </div>
            <div>
              <div className="font-bold text-yellow-500">Fats</div>
              <div className={getMacroStatus(currentMacros.fats, targetMacros.fats)}>
                {currentMacros.fats}g / {targetMacros.fats}g
              </div>
            </div>
          </div>
        </div>

        {/* Selected foods */}
        <div className="bg-accent/10 rounded-lg p-3 min-h-20">
          <p className="text-sm font-semibold mb-2">Your Plate:</p>
          <div className="flex gap-2 flex-wrap">
            {selectedFoods.map((food, i) => (
              <div key={i} className="text-2xl">{food.emoji}</div>
            ))}
            {selectedFoods.length === 0 && (
              <p className="text-sm text-muted-foreground italic">Select foods below...</p>
            )}
          </div>
        </div>

        {/* Food selection */}
        {!complete && (
          <div className="grid grid-cols-4 gap-1.5">
            {foods.map((food) => (
              <button
                key={food.name}
                onClick={() => handleFoodClick(food)}
                className="bg-input hover:bg-primary/20 rounded-lg p-2 flex flex-col items-center transition-all hover:scale-105"
              >
                <div className="text-2xl mb-1">{food.emoji}</div>
                <div className="text-xs text-muted-foreground leading-tight text-center">{food.name}</div>
                <div className="text-xs text-blue-500 font-bold">P{food.protein}</div>
              </button>
            ))}
          </div>
        )}

        {/* Submit button */}
        {selectedFoods.length > 0 && !complete && (
          <Button onClick={handleSubmit} className="w-full bg-primary text-primary-foreground font-bold">
            Submit Meal
          </Button>
        )}

        {!startTime && (
          <Button onClick={onCancel} variant="outline" className="w-full">
            Cancel
          </Button>
        )}

        {/* Complete state */}
        {complete && (
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-accent-foreground flex items-center gap-2">
                <Trophy size={20} /> Macros Mastered!
              </p>
              <div className="text-sm text-muted-foreground">
                Mistakes: {mistakes}
              </div>
            </div>
            <Button onClick={handleComplete} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
              Claim Rewards
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Kitchen Grandmaster - Speed cooking challenge
function KitchenGrandmasterGame({ questId, onComplete, onCancel }: { questId: string; onComplete: (session: GameSession) => void; onCancel: () => void }) {
  type Dish = { name: string; emoji: string; steps: string[] };
  
  const dishes: Dish[] = [
    { name: 'Pasta', emoji: '🍝', steps: ['Boil', 'Sauce', 'Serve'] },
    { name: 'Burger', emoji: '🍔', steps: ['Grill', 'Stack', 'Serve'] },
    { name: 'Pizza', emoji: '🍕', steps: ['Dough', 'Top', 'Bake', 'Serve'] },
    { name: 'Sushi', emoji: '🍣', steps: ['Rice', 'Roll', 'Cut', 'Serve'] },
  ];

  const [currentDish, setCurrentDish] = useState<Dish | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [complete, setComplete] = useState(false);
  const [shuffledSteps, setShuffledSteps] = useState<string[]>([]);
  const targetScore = 5;
  const stepOptions = ['Boil', 'Grill', 'Sauce', 'Dough', 'Top', 'Bake', 'Rice', 'Roll', 'Cut', 'Stack', 'Serve'];

  const shuffleSteps = () => {
    const shuffled = [...stepOptions].sort(() => Math.random() - 0.5);
    setShuffledSteps(shuffled);
  };

  useEffect(() => {
    if (!isPlaying || complete) return;
    
    if (!startTime) setStartTime(Date.now());
    
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setComplete(true);
          setIsPlaying(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, complete, startTime]);

  useEffect(() => {
    if (isPlaying && !currentDish) {
      setCurrentDish(dishes[Math.floor(Math.random() * dishes.length)]);
      setCurrentStepIndex(0);
      shuffleSteps();
    }
  }, [isPlaying, currentDish]);

  useEffect(() => {
    if (score >= targetScore && !complete) {
      setComplete(true);
      setIsPlaying(false);
    }
  }, [score, complete]);

  const handleStepClick = (step: string) => {
    if (!currentDish) return;

    if (step === currentDish.steps[currentStepIndex]) {
      if (currentStepIndex === currentDish.steps.length - 1) {
        setScore(s => s + 1);
        setTimeout(() => {
          setCurrentDish(dishes[Math.floor(Math.random() * dishes.length)]);
          setCurrentStepIndex(0);
          shuffleSteps();
        }, 300);
      } else {
        setCurrentStepIndex(i => i + 1);
      }
    } else {
      setMistakes(m => m + 1);
      setCurrentStepIndex(0);
    }
  };

  const handleComplete = () => {
    const completionTime = 45 - timeLeft;
    const baseScore = 5000;
    const dishBonus = score * 1000;
    const mistakePenalty = mistakes * 400;
    const timeBonus = timeLeft * 50;
    const finalScore = Math.round(Math.max(baseScore + dishBonus + timeBonus - mistakePenalty, 1000));
    
    let rank: 'S' | 'A' | 'B' | 'C' | 'D' = 'D';
    if (finalScore >= 10000) rank = 'S';
    else if (finalScore >= 8000) rank = 'A';
    else if (finalScore >= 6000) rank = 'B';
    else if (finalScore >= 4500) rank = 'C';

    const session: GameSession = {
      id: crypto.randomUUID(),
      questId,
      questType: 'nutrition',
      completionTime,
      score: finalScore,
      rank,
      accuracy: Math.round((score / (score + mistakes)) * 100) || 0,
      isPerfect: mistakes === 0 && score >= targetScore,
      isPersonalBest: false,
      date: new Date(),
    };

    onComplete(session);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Kitchen Grandmaster</h3>
        <p className="text-sm md:text-base text-muted-foreground">Follow recipes step-by-step at top speed!</p>
      </div>

      <div className="space-y-3">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="bg-input rounded p-2">
            <div className="font-bold text-primary">{score}/{targetScore}</div>
            <div className="text-xs text-muted-foreground">Dishes</div>
          </div>
          <div className="bg-input rounded p-2">
            <div className="font-bold text-destructive">{mistakes}</div>
            <div className="text-xs text-muted-foreground">Errors</div>
          </div>
          <div className="bg-input rounded p-2">
            <div className={`font-bold ${timeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-accent'}`}>{timeLeft}s</div>
            <div className="text-xs text-muted-foreground">Time</div>
          </div>
        </div>

        {/* Current dish */}
        {currentDish && isPlaying && (
          <div className="bg-primary/10 border-2 border-primary rounded-lg p-3 text-center">
            <div className="text-4xl mb-2">{currentDish.emoji}</div>
            <p className="text-lg font-bold text-primary mb-2">{currentDish.name}</p>
            <div className="flex justify-center gap-2">
              {currentDish.steps.map((step, i) => (
                <div
                  key={i}
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    i < currentStepIndex
                      ? 'bg-green-500/20 text-green-600'
                      : i === currentStepIndex
                      ? 'bg-primary/30 text-primary animate-pulse'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step buttons */}
        {isPlaying && !complete && shuffledSteps.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {shuffledSteps.map((step) => (
              <button
                key={step}
                onClick={() => handleStepClick(step)}
                className="bg-input hover:bg-primary/20 rounded-lg p-3 text-sm font-semibold transition-all hover:scale-105"
              >
                {step}
              </button>
            ))}
          </div>
        )}

        {/* Start button */}
        {!isPlaying && !complete && (
          <div className="space-y-2">
            <Button onClick={() => setIsPlaying(true)} className="w-full bg-primary text-primary-foreground font-bold text-lg py-6">
              Start Cooking Challenge
            </Button>
            <Button onClick={onCancel} variant="outline" className="w-full">
              Cancel
            </Button>
          </div>
        )}

        {/* Complete state */}
        {complete && (
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-accent-foreground flex items-center gap-2">
                <Trophy size={20} /> {score >= targetScore ? 'Master Chef!' : 'Time Up!'}
              </p>
              <div className="text-sm text-muted-foreground">
                Score: {score} • Errors: {mistakes}
              </div>
            </div>
            <Button onClick={handleComplete} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
              Claim Rewards
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Sleep Game - Counting sheep
function SleepGame({ questId, onComplete, onCancel }: { questId: string; onComplete: (session: GameSession) => void; onCancel: () => void }) {
  // Route to different game variants based on quest ID
  if (questId === 'quest-7') {
    return <NightModeClearGame questId={questId} onComplete={onComplete} onCancel={onCancel} />;
  } else if (questId === 'quest-8') {
    return <SheepStarterGame questId={questId} onComplete={onComplete} onCancel={onCancel} />;
  } else if (questId === 'quest-17') {
    return <MoonPhaseMemoryGame questId={questId} onComplete={onComplete} onCancel={onCancel} />;
  } else if (questId === 'quest-18') {
    return <DreamDriftGame questId={questId} onComplete={onComplete} onCancel={onCancel} />;
  }
  // Default to counting sheep mode
  return <NightModeClearGame questId={questId} onComplete={onComplete} onCancel={onCancel} />;
}

function MoonPhaseMemoryGame({ questId, onComplete, onCancel }: { questId: string; onComplete: (session: GameSession) => void; onCancel: () => void }) {
  const moons = ['🌑', '🌓', '🌕', '🌗'];
  const [sequence, setSequence] = useState<string[]>([]);
  const [input, setInput] = useState<string[]>([]);
  const [round, setRound] = useState(1);
  const [mistakes, setMistakes] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const targetRounds = 5;

  useEffect(() => {
    if (sequence.length === 0) {
      setSequence(Array.from({ length: round + 1 }, () => moons[Math.floor(Math.random() * moons.length)]));
    }
  }, [sequence, round]);

  const pressMoon = (moon: string) => {
    if (!startTime) setStartTime(Date.now());
    const nextInput = [...input, moon];
    const expected = sequence[nextInput.length - 1];
    if (moon !== expected) {
      setMistakes((m) => m + 1);
      setInput([]);
      return;
    }
    if (nextInput.length === sequence.length) {
      if (round >= targetRounds) {
        setRound((r) => r + 1);
      } else {
        setRound((r) => r + 1);
        setInput([]);
        setSequence([]);
      }
      return;
    }
    setInput(nextInput);
  };

  const complete = round > targetRounds;

  const handleComplete = () => {
    const completionTime = startTime ? Math.round((Date.now() - startTime) / 1000) : 40;
    const score = Math.max(1000, Math.round(5400 + (targetRounds * 700) - (mistakes * 240)));
    const session: GameSession = {
      id: crypto.randomUUID(),
      questId,
      questType: 'sleep',
      completionTime,
      score,
      rank: getRankFromScore(score),
      accuracy: Math.max(20, Math.round(((targetRounds * 2) / Math.max((targetRounds * 2) + mistakes, 1)) * 100)),
      isPerfect: mistakes === 0,
      isPersonalBest: false,
      date: new Date(),
    };
    onComplete(session);
  };

  if (complete) {
    return <Button onClick={handleComplete} className="w-full">Claim Rewards</Button>;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-2xl font-bold">Moon Phase Memory</h3>
      <p className="text-sm text-muted-foreground">Repeat the sequence. Round {Math.min(round, targetRounds)}/{targetRounds}</p>
      <div className="bg-input rounded p-3 text-center text-2xl">{sequence.join(' ')}</div>
      <div className="grid grid-cols-4 gap-2">
        {moons.map((moon) => (
          <Button key={moon} variant="outline" className="h-16 text-2xl" onClick={() => pressMoon(moon)}>{moon}</Button>
        ))}
      </div>
      {!startTime && <Button onClick={onCancel} variant="outline" className="w-full">Cancel</Button>}
    </div>
  );
}

function DreamDriftGame({ questId, onComplete, onCancel }: { questId: string; onComplete: (session: GameSession) => void; onCancel: () => void }) {
  const [position, setPosition] = useState(50);
  const [velocity, setVelocity] = useState(1);
  const [calmHits, setCalmHits] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const targetHits = 12;

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition((currentPosition) => {
        let next = currentPosition + (velocity * 5);
        if (next >= 97) {
          next = 97;
          setVelocity(-1);
        } else if (next <= 3) {
          next = 3;
          setVelocity(1);
        }
        return next;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [velocity]);

  const handleTap = () => {
    if (!startTime) setStartTime(Date.now());
    if (position >= 44 && position <= 56) {
      setCalmHits((h) => h + 1);
    } else {
      setMistakes((m) => m + 1);
    }
  };

  const complete = calmHits >= targetHits;

  const handleComplete = () => {
    const completionTime = startTime ? Math.round((Date.now() - startTime) / 1000) : 30;
    const score = Math.max(1000, Math.round(5300 + (calmHits * 360) - (mistakes * 220)));
    const session: GameSession = {
      id: crypto.randomUUID(),
      questId,
      questType: 'sleep',
      completionTime,
      score,
      rank: getRankFromScore(score),
      accuracy: Math.max(30, Math.round((calmHits / Math.max(calmHits + mistakes, 1)) * 100)),
      isPerfect: mistakes === 0,
      isPersonalBest: false,
      date: new Date(),
    };
    onComplete(session);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-2xl font-bold">Dream Drift</h3>
      <p className="text-sm text-muted-foreground">Tap when the marker is in the calm zone.</p>
      <div className="bg-input rounded-lg p-3 space-y-2">
        <div className="text-xs text-muted-foreground text-center">Calm zone: 44-56</div>
        <div className="relative h-4 bg-muted rounded-full overflow-hidden">
          <div className="absolute left-[44%] w-[12%] h-full bg-secondary/40" />
          <div
            className="absolute top-0 h-full w-2 bg-primary"
            style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <div className="bg-input rounded p-2"><div className="font-bold text-primary">{calmHits}/{targetHits}</div><div className="text-xs text-muted-foreground">Calm Hits</div></div>
        <div className="bg-input rounded p-2"><div className="font-bold text-destructive">{mistakes}</div><div className="text-xs text-muted-foreground">Mistakes</div></div>
        <div className="bg-input rounded p-2"><div className="font-bold text-secondary">{Math.round(position)}</div><div className="text-xs text-muted-foreground">Marker</div></div>
      </div>
      {!complete && <Button onClick={handleTap} className="w-full h-20 text-xl">Tap Calm</Button>}
      {!startTime && !complete && <Button onClick={onCancel} variant="outline" className="w-full">Cancel</Button>}
      {complete && <Button onClick={handleComplete} className="w-full">Claim Rewards</Button>}
    </div>
  );
}

// Sheep Starter - Bedtime routine sequence
function SheepStarterGame({ questId, onComplete, onCancel }: { questId: string; onComplete: (session: GameSession) => void; onCancel: () => void }) {
  type Activity = { id: number; emoji: string; name: string; order: number };
  
  const activities: Activity[] = [
    { id: 1, emoji: '🍽️', name: 'Dinner', order: 1 },
    { id: 2, emoji: '📚', name: 'Read', order: 4 },
    { id: 3, emoji: '🚿', name: 'Shower', order: 2 },
    { id: 4, emoji: '🧘', name: 'Relax', order: 5 },
    { id: 5, emoji: '📱', name: 'No Screen', order: 3 },
    { id: 6, emoji: '😴', name: 'Sleep', order: 6 }
  ];

  const [shuffled, setShuffled] = useState<Activity[]>([]);
  const [selected, setSelected] = useState<Activity[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [round, setRound] = useState(1);
  const [complete, setComplete] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [showingCorrect, setShowingCorrect] = useState(false);
  const targetRounds = 3;

  useEffect(() => {
    if (shuffled.length === 0) {
      if (!startTime) setStartTime(Date.now());
      const newShuffled = [...activities].sort(() => Math.random() - 0.5);
      setShuffled(newShuffled);
    }
  }, [shuffled, startTime]);

  const handleActivityClick = (activity: Activity) => {
    if (complete || showingCorrect) return;

    const newSelected = [...selected, activity];
    setSelected(newSelected);
    setShuffled(shuffled.filter(a => a.id !== activity.id));

    // Check if correct order
    if (activity.order !== newSelected.length) {
      setMistakes(m => m + 1);
      setShowingCorrect(true);
      // Show correct answer briefly then reset
      setTimeout(() => {
        setShowingCorrect(false);
        setSelected([]);
        const resetShuffled = [...activities].sort(() => Math.random() - 0.5);
        setShuffled(resetShuffled);
      }, 2000);
      return;
    }

    // Check if round complete
    if (newSelected.length === activities.length) {
      if (round >= targetRounds) {
        setComplete(true);
      } else {
        setTimeout(() => {
          setRound(r => r + 1);
          setSelected([]);
          const resetShuffled = [...activities].sort(() => Math.random() - 0.5);
          setShuffled(resetShuffled);
        }, 1500);
      }
    }
  };

  const handleComplete = () => {
    const completionTime = startTime ? Math.round((Date.now() - startTime) / 1000) : 60;
    const baseScore = 5000;
    const roundBonus = round * 1000;
    const mistakePenalty = mistakes * 500;
    const timeBonus = Math.max(3000 - (completionTime * 20), 0);
    const finalScore = Math.round(Math.max(baseScore + roundBonus + timeBonus - mistakePenalty, 1000));
    
    let rank: 'S' | 'A' | 'B' | 'C' | 'D' = 'D';
    if (finalScore >= 9000) rank = 'S';
    else if (finalScore >= 7500) rank = 'A';
    else if (finalScore >= 6000) rank = 'B';
    else if (finalScore >= 4500) rank = 'C';

    const session: GameSession = {
      id: crypto.randomUUID(),
      questId,
      questType: 'sleep',
      completionTime,
      score: finalScore,
      rank,
      accuracy: 100,
      isPerfect: mistakes === 0,
      isPersonalBest: false,
      date: new Date(),
    };

    onComplete(session);
  };

  const correctOrder = [...activities].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Bedtime Routine</h3>
        <p className="text-sm md:text-base text-muted-foreground">Arrange activities in the correct sleep hygiene order!</p>
      </div>

      <div className="space-y-3">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="bg-input rounded p-2">
            <div className="font-bold text-primary">{round}/{targetRounds}</div>
            <div className="text-xs text-muted-foreground">Round</div>
          </div>
          <div className="bg-input rounded p-2">
            <div className="font-bold text-destructive">{mistakes}</div>
            <div className="text-xs text-muted-foreground">Mistakes</div>
          </div>
          <div className="bg-input rounded p-2">
            <div className="font-bold text-secondary">{selected.length}/{activities.length}</div>
            <div className="text-xs text-muted-foreground">Progress</div>
          </div>
        </div>

        {/* Selected sequence */}
        <div className="bg-primary/10 border-2 border-primary rounded-lg p-4 min-h-24">
          <p className="text-sm font-semibold text-muted-foreground mb-2">Your Routine:</p>
          <div className="flex flex-wrap gap-2">
            {selected.map((activity, i) => (
              <div key={activity.id} className="bg-primary/20 rounded-lg px-3 py-2 flex items-center gap-2">
                <span className="text-xs font-bold text-primary">{i + 1}</span>
                <span className="text-2xl">{activity.emoji}</span>
                <span className="text-sm font-semibold">{activity.name}</span>
              </div>
            ))}
            {selected.length === 0 && (
              <p className="text-sm text-muted-foreground italic">Click activities below in the correct order...</p>
            )}
          </div>
        </div>

        {/* Show correct answer when mistake */}
        {showingCorrect && (
          <div className="bg-destructive/10 border-2 border-destructive rounded-lg p-4 animate-pulse">
            <p className="text-sm font-bold text-destructive mb-2">❌ Incorrect! Correct order:</p>
            <div className="flex flex-wrap gap-2">
              {correctOrder.map((activity, i) => (
                <div key={activity.id} className="bg-destructive/20 rounded-lg px-3 py-2 flex items-center gap-2">
                  <span className="text-xs font-bold">{i + 1}</span>
                  <span className="text-2xl">{activity.emoji}</span>
                  <span className="text-sm">{activity.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available activities */}
        {!complete && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-muted-foreground">Available Activities:</p>
            <div className="grid grid-cols-3 gap-2">
              {shuffled.map(activity => (
                <button
                  key={activity.id}
                  onClick={() => handleActivityClick(activity)}
                  disabled={showingCorrect}
                  className={`
                    bg-input rounded-lg p-3 flex flex-col items-center gap-2 transition-all
                    ${showingCorrect ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/20 hover:scale-105'}
                  `}
                >
                  <div className="text-4xl">{activity.emoji}</div>
                  <div className="text-xs font-semibold text-center">{activity.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Complete state */}
        {complete && (
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-accent-foreground flex items-center gap-2">
                <Star size={20} /> Routine Mastered!
              </p>
              <div className="text-sm text-muted-foreground">
                Mistakes: {mistakes}
              </div>
            </div>
            <Button onClick={handleComplete} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
              Claim Rewards
            </Button>
          </div>
        )}

        {shuffled.length > 0 && !complete && !showingCorrect && (
          <Button onClick={onCancel} variant="outline" className="w-full">
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

// Night Mode Clear - Counting sheep calmly
function NightModeClearGame({ questId, onComplete, onCancel }: { questId: string; onComplete: (session: GameSession) => void; onCancel: () => void }) {
  const [sheep, setSheep] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [tempo, setTempo] = useState<'slow' | 'good' | 'fast'>('good');
  const [lastClickTime, setLastClickTime] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [complete, setComplete] = useState(false);
  const targetSheep = 20;
  const idealTempo = 1500; // 1.5 seconds between clicks
  const isSheepStarterQuest = questId === 'quest-7';

  useEffect(() => {
    if (sheep >= targetSheep && !complete) {
      setComplete(true);
    }
  }, [sheep, complete]);

  const handleSheepClick = () => {
    if (complete) return;

    const now = Date.now();
    if (!startTime) setStartTime(now);

    if (lastClickTime) {
      const timeDiff = now - lastClickTime;
      
      if (timeDiff < 800) {
        setTempo('fast');
        setMistakes(m => m + 1);
      } else if (timeDiff > 2500) {
        setTempo('slow');
        setMistakes(m => m + 1);
      } else {
        setTempo('good');
      }
    }

    setLastClickTime(now);
    setSheep(s => s + 1);
    setClicks(c => c + 1);
  };

  const handleComplete = () => {
    const completionTime = startTime ? Math.round((Date.now() - startTime) / 1000) : 30;
    const baseScore = 5000;
    const tempoBonus = Math.max(3000 - (mistakes * 200), 0);
    const steadyBonus = mistakes < 3 ? 2000 : 0;
    const finalScore = Math.round(baseScore + tempoBonus + steadyBonus);
    
    let rank: 'S' | 'A' | 'B' | 'C' | 'D' = 'D';
    if (finalScore >= 9500) rank = 'S';
    else if (finalScore >= 8000) rank = 'A';
    else if (finalScore >= 6500) rank = 'B';
    else if (finalScore >= 5000) rank = 'C';

    const session: GameSession = {
      id: crypto.randomUUID(),
      questId,
      questType: 'sleep',
      completionTime,
      score: finalScore,
      rank,
      accuracy: Math.round(Math.max(100 - (mistakes * 5), 50)),
      isPerfect: mistakes === 0,
      isPersonalBest: false,
      date: new Date(),
    };

    onComplete(session);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-1">{isSheepStarterQuest ? 'Sheep Starter' : 'Night Mode Clear'}</h3>
        <p className="text-sm md:text-base text-muted-foreground">Count sheep at a calm, steady pace!</p>
      </div>

      <div className="space-y-3">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="bg-input rounded p-2">
            <div className="font-bold text-primary">{sheep}/{targetSheep}</div>
            <div className="text-xs text-muted-foreground">Sheep</div>
          </div>
          <div className="bg-input rounded p-2">
            <div className="font-bold text-destructive">{mistakes}</div>
            <div className="text-xs text-muted-foreground">Off Tempo</div>
          </div>
          <div className="bg-input rounded p-2">
            <div className={`font-bold ${
              tempo === 'good' ? 'text-green-500' :
              tempo === 'slow' ? 'text-blue-500' :
              'text-red-500'
            }`}>
              {tempo === 'good' ? '✓' : tempo === 'slow' ? '🐌' : '⚡'}
            </div>
            <div className="text-xs text-muted-foreground">Pace</div>
          </div>
        </div>

        {/* Sheep display */}
        <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-lg p-8 min-h-56 flex flex-wrap gap-4 items-center justify-center">
          {Array.from({ length: Math.min(sheep, 10) }).map((_, i) => (
            <div 
              key={i} 
              className="text-5xl animate-bounce" 
              style={{ animationDelay: `${i * 0.2}s`, animationDuration: '2s' }}
            >
              🐑
            </div>
          ))}
          {sheep > 10 && (
            <div className="text-3xl text-muted-foreground">
              +{sheep - 10} more...
            </div>
          )}
        </div>

        {/* Counter */}
        <div className="text-center">
          <div className="text-6xl font-bold text-primary mb-2">{sheep}</div>
          <div className={`text-sm font-semibold ${
            tempo === 'good' ? 'text-green-500' :
            tempo === 'slow' ? 'text-blue-500' :
            'text-red-500 animate-pulse'
          }`}>
            {tempo === 'good' && '😌 Perfect Pace'}
            {tempo === 'slow' && '🐌 Click Faster'}
            {tempo === 'fast' && '⚡ Too Fast! Slow Down'}
          </div>
        </div>

        {/* Click button */}
        {!complete && (
          <button
            onClick={handleSheepClick}
            className="w-full h-32 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-lg font-bold text-2xl hover:scale-105 active:scale-95 transition-transform shadow-lg"
          >
            Count Sheep 🐑
          </button>
        )}

        {!startTime && (
          <Button onClick={onCancel} variant="outline" className="w-full">
            Cancel
          </Button>
        )}

        {/* Complete state */}
        {complete && (
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-accent-foreground flex items-center gap-2">
                <Star size={20} /> Sweet Dreams!
              </p>
              <div className="text-sm text-muted-foreground">
                {mistakes === 0 ? 'Perfect Rhythm! 🎵' : `${mistakes} tempo errors`}
              </div>
            </div>
            <Button onClick={handleComplete} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
              Claim Rewards
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MiniGame({ quest, onComplete, onCancel }: MiniGameProps) {
  const [pendingRewards, setPendingRewards] = useState<GameSession | null>(null);
  const gameActionAreaRef = useRef<HTMLDivElement | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const updateIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    updateIsDesktop();
    window.addEventListener('resize', updateIsDesktop);

    return () => window.removeEventListener('resize', updateIsDesktop);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        onCancel();
        return;
      }

      const actionButtons = Array.from(
        (gameActionAreaRef.current || document).querySelectorAll<HTMLButtonElement>(
          'button:not(:disabled):not([data-hotkey-ignore="true"])'
        )
      );

      if (actionButtons.length === 0) return;

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        actionButtons[0].click();
        return;
      }

      const index = Number.parseInt(event.key, 10);
      if (!Number.isNaN(index) && index >= 1 && index <= 9) {
        const targetButton = actionButtons[index - 1];
        if (!targetButton) return;
        event.preventDefault();
        targetButton.click();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDesktop, onCancel]);

  const handleGameComplete = (sessionData: GameSession) => {
    // Calculate rewards based on quest difficulty and rank
    const baseExp = quest.rewards?.experience || 50;
    const baseGold = quest.rewards?.gold || 30;
    
    let expMultiplier = 1;
    let goldMultiplier = 1;
    let bonusText = '';
    
    if (sessionData.rank === 'S') {
      expMultiplier = 1.5;
      goldMultiplier = 1.5;
      bonusText = '🌟 +50% Rank S Bonus';
    } else if (sessionData.rank === 'A') {
      expMultiplier = 1.25;
      goldMultiplier = 1.25;
      bonusText = '⭐ +25% Rank A Bonus';
    } else if (sessionData.rank === 'B') {
      expMultiplier = 1.1;
      goldMultiplier = 1.1;
      bonusText = '✨ +10% Rank B Bonus';
    }
    
    const finalExp = Math.round(baseExp * expMultiplier);
    const finalGold = Math.round(baseGold * goldMultiplier);
    
    setPendingRewards({
      ...sessionData,
      rewards: {
        experience: finalExp,
        gold: finalGold,
        bonus: bonusText,
      },
    });
  };

  const handleClaimRewards = () => {
    if (pendingRewards) {
      onComplete(pendingRewards);
    }
  };

  // Show rewards claim screen if rewards are pending
  if (pendingRewards) {
    return (
      <div className="fixed inset-0 min-h-screen bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-hidden">
        <div ref={gameActionAreaRef} className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-10 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">🎉 Quest Complete!</h2>
            <p className="text-lg text-muted-foreground">Congratulations on finishing {quest.title}!</p>
          </div>

          {/* Rank Display */}
          <div className="flex justify-center">
            <div className={`px-8 py-6 rounded-xl border-2 font-bold text-center ${
              pendingRewards.rank === 'S' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-600' :
              pendingRewards.rank === 'A' ? 'bg-purple-500/20 border-purple-500 text-purple-600' :
              pendingRewards.rank === 'B' ? 'bg-blue-500/20 border-blue-500 text-blue-600' :
              'bg-gray-500/20 border-gray-500 text-gray-600'
            }`}>
              <div className="text-7xl mb-2">{pendingRewards.rank}</div>
              <div className="text-sm">RANK</div>
            </div>
          </div>

          {/* Rewards Section */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* XP Reward */}
              <div className="bg-primary/10 border border-primary/30 rounded-xl p-6 text-center space-y-3">
                <div className="text-5xl">⭐</div>
                <div className="text-sm font-semibold text-muted-foreground">Experience</div>
                <div className="text-3xl md:text-4xl font-bold text-primary">+{pendingRewards.rewards?.experience}</div>
              </div>

              {/* Gold Reward */}
              <div className="bg-accent/10 border border-accent/30 rounded-xl p-6 text-center space-y-3">
                <div className="text-5xl">💰</div>
                <div className="text-sm font-semibold text-muted-foreground">Gold</div>
                <div className="text-3xl md:text-4xl font-bold text-accent">+{pendingRewards.rewards?.gold}</div>
              </div>
            </div>

            {/* Bonus Text */}
            {pendingRewards.rewards?.bonus && (
              <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-4 text-center font-bold text-secondary">
                {pendingRewards.rewards.bonus}
              </div>
            )}

            {/* Personal Best */}
            {pendingRewards.isPersonalBest && (
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">🏆</div>
                <div className="font-bold text-yellow-600">New Personal Best!</div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button onClick={onCancel} variant="outline" className="flex-1 text-base md:text-lg py-6">
              Cancel
            </Button>
            <Button onClick={handleClaimRewards} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base md:text-lg py-6">
              <Award className="h-5 w-5 mr-2" />
              Claim Rewards
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getGameComponent = () => {
    switch (quest.type) {
      case 'fitness':
        return <FitnessGame questId={quest.id} onComplete={handleGameComplete} onCancel={onCancel} />;
      case 'mindfulness':
        return <MindfulnessGame questId={quest.id} onComplete={handleGameComplete} onCancel={onCancel} />;
      case 'nutrition':
        return <NutritionGame questId={quest.id} onComplete={handleGameComplete} onCancel={onCancel} />;
      case 'sleep':
        return <SleepGame questId={quest.id} onComplete={handleGameComplete} onCancel={onCancel} />;
    }
  };

  return (
    <div className="fixed inset-0 min-h-screen bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4 overflow-hidden">
      <div ref={gameActionAreaRef} className="bg-card border border-border rounded-lg w-full max-w-3xl md:max-w-4xl max-h-[95vh] overflow-hidden p-3 md:p-5 space-y-2 md:space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">{quest.title}</h2>
            {isDesktop && (
              <p className="text-xs text-muted-foreground">Keyboard: 1-9 activate buttons, Enter/Space uses primary action, Esc closes.</p>
            )}
          </div>
          <button
            onClick={onCancel}
            data-hotkey-ignore="true"
            className="p-1 hover:bg-input rounded-lg transition-colors shrink-0"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        {getGameComponent()}
      </div>
    </div>
  );
}

