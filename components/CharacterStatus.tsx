'use client';

import { Character } from '@/lib/types';
import { XP_PER_LEVEL, getLevelProgress } from '@/lib/progression';

interface CharacterStatusProps {
  character: Character;
}

export default function CharacterStatus({ character }: CharacterStatusProps) {
  const { stats } = character;
  const healthPercent = (stats.health / stats.maxHealth) * 100;
  const expPercent = getLevelProgress(stats.experience);

  return (
    <div className="card-elevated border rounded-xl p-8 space-y-8 glow-primary">
      {/* Header Section */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-sm text-primary font-semibold tracking-widest mb-2">CHARACTER PROFILE</div>
          <h2 className="text-5xl font-black text-gradient">{character.name}</h2>
          <p className="text-muted-foreground mt-2 text-lg">
            <span className="text-primary font-bold">Level {stats.level}</span> Adventurer • {character.questsCompleted} Quests Conquered
          </p>
        </div>
        <div className="text-right space-y-2">
          <div className="text-sm text-muted-foreground">TOTAL WEALTH</div>
          <div className="text-4xl font-black text-accent glow-accent px-4 py-2 rounded-lg bg-accent/10">{character.gold}</div>
        </div>
      </div>

      {/* Combo Streak Section */}
      {character.currentComboStreak > 0 && (
        <div className="p-4 rounded-lg bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/50">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-primary font-semibold tracking-widest mb-1">COMBO STREAK</div>
              <div className="text-2xl font-black text-primary">🔥 {character.currentComboStreak} STREAK</div>
              <div className="text-xs text-muted-foreground mt-1">Max: {character.maxComboStreak} • Multiplier: {(character.comboMultiplier).toFixed(1)}x</div>
            </div>
            <div className="text-4xl">🎯</div>
          </div>
        </div>
      )}

      {/* Progress Bars */}
      <div className="space-y-6">
        {/* Health Bar */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold tracking-widest text-foreground">HP</span>
            <span className="text-xs font-mono text-muted-foreground">{stats.health} / {stats.maxHealth}</span>
          </div>
          <div className="progress-bar-glow">
            <div
              className="bg-gradient-to-r from-accent/80 to-accent h-full transition-all duration-500 shadow-[inset_0_0_10px_rgba(var(--color-accent),0.3)]"
              style={{ width: `${healthPercent}%` }}
            />
          </div>
        </div>

        {/* Experience Bar */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold tracking-widest text-foreground">EXPERIENCE</span>
            <span className="text-xs font-mono text-muted-foreground">{stats.experience} / {XP_PER_LEVEL}</span>
          </div>
          <div className="progress-bar-glow">
            <div
              className="bg-gradient-to-r from-primary to-secondary h-full transition-all duration-500 shadow-[inset_0_0_10px_rgba(14,165,165,0.3)]"
              style={{ width: `${expPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid - Gamified */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-box hover:border-primary/50 transition-all">
          <div className="text-xs text-primary font-bold tracking-wider mb-2">STR</div>
          <div className="text-3xl font-black text-secondary">{stats.strength}</div>
          <div className="text-xs text-muted-foreground mt-1">Strength</div>
        </div>
        <div className="stat-box hover:border-primary/50 transition-all">
          <div className="text-xs text-primary font-bold tracking-wider mb-2">END</div>
          <div className="text-3xl font-black text-secondary">{stats.endurance}</div>
          <div className="text-xs text-muted-foreground mt-1">Endurance</div>
        </div>
        <div className="stat-box hover:border-primary/50 transition-all">
          <div className="text-xs text-primary font-bold tracking-wider mb-2">WIS</div>
          <div className="text-3xl font-black text-secondary">{stats.wisdom}</div>
          <div className="text-xs text-muted-foreground mt-1">Wisdom</div>
        </div>
        <div className="stat-box hover:border-primary/50 transition-all">
          <div className="text-xs text-primary font-bold tracking-wider mb-2">AGI</div>
          <div className="text-3xl font-black text-secondary">{stats.agility}</div>
          <div className="text-xs text-muted-foreground mt-1">Agility</div>
        </div>
      </div>
    </div>
  );
}
