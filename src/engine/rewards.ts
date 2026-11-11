import { UserManager } from '../store/userState';

export const Rewards = {
  checkDailyReward(): boolean {
    const lastRewardDate = localStorage.getItem('last_reward_date');
    const today = new Date().toDateString();
    return lastRewardDate !== today;
  },

  async claimReward(): Promise<{ success: boolean; amount: number; message: string }> {
    if (this.checkDailyReward()) {
      const currentGold = UserManager.getGold();
      const newGold = currentGold + 50;
      localStorage.setItem('last_reward_date', new Date().toDateString());
      await UserManager.updateProgress(UserManager.getCurrentLevel(), newGold);
      return { success: true, amount: 50, message: "Tebrikler! Günlük 50 🪙 ödülünü aldın!" };
    }
    return { success: false, amount: 0, message: "Bugünkü günlük ödülünü zaten aldın. Yarın tekrar gel!" };
  }
};
