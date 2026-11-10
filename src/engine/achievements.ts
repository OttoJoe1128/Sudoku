// src/engine/achievements.ts
import { getGameState } from '../store/gameState';

export const AchievementManager = {
  checkAchievements() {
    const state = getGameState();
    const earned = [];
    if (state.totalErrors === 0 && state.currentLevel > 3) earned.push("Hatasız Şampiyon 🏆");
    if (state.gold >= 500) earned.push("Zengin Sudokucu 💰");
    return earned;
  }
};
