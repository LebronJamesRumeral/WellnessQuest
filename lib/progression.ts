import { CharacterStats } from './types';

export const XP_PER_LEVEL = 100;

export function getTotalXp(level: number, experience: number): number {
  const safeLevel = Math.max(1, level || 1);
  const safeExperience = Math.max(0, experience || 0);
  return ((safeLevel - 1) * XP_PER_LEVEL) + safeExperience;
}

export function getLevelProgress(experience: number): number {
  const safeExperience = Math.max(0, experience || 0);
  return Math.min((safeExperience / XP_PER_LEVEL) * 100, 100);
}

export function applyExperienceGain(stats: CharacterStats, gain: number): CharacterStats {
  const safeGain = Math.max(0, gain || 0);
  const updatedStats: CharacterStats = {
    ...stats,
    experience: Math.max(0, (stats.experience || 0) + safeGain),
    level: Math.max(1, stats.level || 1),
  };

  const levelUps = Math.floor(updatedStats.experience / XP_PER_LEVEL);
  if (levelUps <= 0) {
    return updatedStats;
  }

  updatedStats.level += levelUps;
  updatedStats.experience = updatedStats.experience % XP_PER_LEVEL;
  updatedStats.maxHealth += levelUps * 5;
  updatedStats.health = updatedStats.maxHealth;
  updatedStats.strength += levelUps * 2;
  updatedStats.endurance += levelUps * 2;
  updatedStats.wisdom += levelUps * 1;
  updatedStats.agility += levelUps * 2;

  return updatedStats;
}
