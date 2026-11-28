// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { UIManager } from '../ui';
import { openLeagueModal, closeLeagueModal, renderLeagueModalUI } from '../controllers/leagueController';
import { setLang } from '../i18n/translations';

describe('Faz IV — Adım 3: Zafer Akışı Pul Animasyonu & Sezonluk Ligler', () => {
  beforeEach(() => {
    localStorage.clear();
    setLang('tr');
    document.body.innerHTML = '<div id="app"></div>';
    UIManager.mountUI();
  });

  it('1. animateStampDropAndFly: Tahtada zafer pulu belirmeli ve uçuş akışı tamamlanmalı', () => {
    let completed = false;
    UIManager.animateStampDropAndFly(3, 'season_egypt_name', () => {
      completed = true;
    });

    const flyer = document.getElementById('victory-stamp-flyer');
    expect(flyer).not.toBeNull();
    expect(flyer?.textContent).toContain('#4 Pul');
  });

  it('2. Lig Modalı Kapsamı: Kalan sezon günleri ve lig sandığı ödülü render edilmeli', () => {
    openLeagueModal();

    const leagueModal = document.getElementById('league-modal');
    expect(leagueModal?.classList.contains('hidden')).toBe(false);

    const daysLabel = document.getElementById('league-season-days-label');
    expect(daysLabel).not.toBeNull();
    expect(daysLabel?.innerText).toContain('Gün Kaldı');

    const claimBtn = document.getElementById('btn-claim-league-reward');
    expect(claimBtn).not.toBeNull();

    closeLeagueModal();
    expect(leagueModal?.classList.contains('hidden')).toBe(true);
  });
});
