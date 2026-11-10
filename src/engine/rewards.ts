import { updateGameState, getGameState } from '../store/gameState';

export const Rewards = {
  checkDailyReward(): boolean {
    const lastRewardDate = localStorage.getItem('last_reward_date');
    const today = new Date().toDateString();
    return lastRewardDate !== today;
  },

  claimReward() {
    if (this.checkDailyReward()) {
      const currentGold = getGameState().gold;
      updateGameState({ gold: currentGold + 50 });
      localStorage.setItem('last_reward_date', new Date().toDateString());
      return { success: true, amount: 50 };
    }
    return { success: false, amount: 0 };
  }
};
