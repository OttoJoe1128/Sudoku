import { UserManager } from '../store/userState';
import { t } from '../i18n/translations';

export const Rewards = {
  getTodayKey(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  },

  isClaimedToday(): boolean {
    const today = this.getTodayKey();
    const last = localStorage.getItem('last_reward_date');
    return last === today;
  },

  async claimReward(): Promise<{ success: boolean; amount: number; message: string }> {
    if (this.isClaimedToday()) {
      return {
        success: false,
        amount: 0,
        message: t('daily_reward_already_claimed')
      };
    }

    const today = this.getTodayKey();
    localStorage.setItem('last_reward_date', today);

    const currentGold = UserManager.getGold();
    const newGold = currentGold + 50;
    await UserManager.updateProgress(UserManager.getCurrentLevel(), newGold);

    return {
      success: true,
      amount: 50,
      message: t('daily_reward_success', { gold: 50 })
    };
  }
};
