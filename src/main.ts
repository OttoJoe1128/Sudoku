import { UIManager } from './ui/uiManager';
import { GameLogic } from './engine/gameLogic';
import { Rewards } from './engine/rewards';

UIManager.mountUI();

// Navigasyon
document.getElementById('btn-journey')?.addEventListener('click', () => UIManager.navigate('map'));
document.getElementById('btn-custom')?.addEventListener('click', () => UIManager.navigate('custom'));
import { Leaderboard } from './engine/leaderboard';

// Modallar
document.getElementById('btn-leaderboard')?.addEventListener('click', async () => {
  UIManager.toggleModal('view-leaderboard', true);
  const players = await Leaderboard.fetchTopPlayers();
  UIManager.renderLeaderboard(players);
});
document.getElementById('close-leaderboard')?.addEventListener('click', () => UIManager.toggleModal('view-leaderboard', false));

document.getElementById('btn-shop')?.addEventListener('click', () => UIManager.toggleModal('view-shop', true));
document.getElementById('close-shop')?.addEventListener('click', () => UIManager.toggleModal('view-shop', false));

// Oyun Mantığı
document.getElementById('btn-diff-basit')?.addEventListener('click', () => GameLogic.initGame('basit'));

// Ödül Sistemi
document.getElementById('btn-daily-reward')?.addEventListener('click', () => {
    const result = Rewards.claimReward();
    if(result.success) {
        alert(`Tebrikler! ${result.amount} Altın kazandın.`);
        const status = document.getElementById('reward-status');
        if(status) status.innerText = "Alındı";
    } else {
        alert("Ödülünü zaten aldın, yarın tekrar gel!");
    }
});
