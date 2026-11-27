import { UIManager } from '../ui/uiManager';
import { SoundManager } from '../engine/soundManager';
import { ClanManager, ClanDef } from '../engine/clanSystem';
import { t, getLang, applyStaticTranslations } from '../i18n/translations';

export function openClanModal(): void {
  UIManager.toggleModal('clan-modal', true);
  applyStaticTranslations();
  renderClanModalUI();
}

export function closeClanModal(): void {
  SoundManager.playTap();
  UIManager.toggleModal('clan-modal', false);
}

export function renderClanModalUI(): void {
  let clan = ClanManager.getUserClan();
  if (!clan) {
    const publicList = ClanManager.getPublicClans();
    clan = publicList.length > 0 ? publicList[0] : null;
  }
  if (!clan) return;

  const iconEl = document.getElementById('clan-modal-icon');
  const nameEl = document.getElementById('clan-modal-name');
  const descEl = document.getElementById('clan-modal-desc');
  const bossHpLabel = document.getElementById('clan-boss-hp-label');
  const bossHpBar = document.getElementById('clan-boss-hp-bar');
  const dustProgressLabel = document.getElementById('clan-dust-progress-label');
  const dustProgressBar = document.getElementById('clan-dust-progress-bar');
  const donateBtn = document.getElementById('btn-clan-donate-dust');

  const isEn = getLang() === 'en';
  if (iconEl) iconEl.innerText = clan.icon;
  if (nameEl) nameEl.innerText = isEn ? `[${clan.tag}] Rune Guardians` : `[${clan.tag}] ${clan.name}`;
  if (descEl) descEl.innerText = isEn ? 'Weekly Samurai Dungeon & Clan Rune Vault' : clan.description;

  if (bossHpLabel) bossHpLabel.innerText = `${clan.weeklyBossCurrentHealth} / ${clan.weeklyBossMaxHealth} HP`;
  if (bossHpBar) {
    const hpPct = Math.round((clan.weeklyBossCurrentHealth / clan.weeklyBossMaxHealth) * 100);
    bossHpBar.style.width = `${hpPct}%`;
  }

  if (dustProgressLabel) dustProgressLabel.innerText = `${clan.runeDustBank} / ${clan.runeDustGoal} ✨`;
  if (dustProgressBar) {
    const dustPct = Math.min(100, Math.round((clan.runeDustBank / clan.runeDustGoal) * 100));
    dustProgressBar.style.width = `${dustPct}%`;
  }

  if (donateBtn) {
    donateBtn.onclick = async () => {
      SoundManager.playNumber();
      const res = await ClanManager.donateRuneDust(5);
      if (res.success) {
        UIManager.showToast(t('clan_toast_donated', { amount: res.donatedDust }), 'success');
        if (res.dungeonUnlockedNow) {
          UIManager.showToast(t('clan_dungeon_unlocked'), 'success');
        }
        renderClanModalUI();
      } else {
        UIManager.showToast(t('ability_toast_no_crystals'), 'error');
      }
    };
  }
}

export function initClanController(): void {
  document.getElementById('btn-open-clan')?.addEventListener('click', () => {
    SoundManager.playTap();
    openClanModal();
  });

  document.getElementById('btn-close-clan')?.addEventListener('click', () => {
    closeClanModal();
  });

  document.getElementById('clan-modal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      closeClanModal();
    }
  });
}
