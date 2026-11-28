// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { UIManager } from '../ui';
import { openPostcardModal, closePostcardModal, initPostcardController } from '../controllers/postcardController';
import { SeasonalEventManager, getCurrentSeason } from '../engine/seasonalEvents';
import { setLang } from '../i18n/translations';

describe('Faz 3 Görsel & Entegrasyon: Postcard Modal & Menu Button Test Paketi', () => {
  beforeEach(() => {
    localStorage.clear();
    setLang('tr');
    document.body.innerHTML = '<div id="app"></div>';
    UIManager.mountUI();
    initPostcardController();
  });

  it('1. #btn-open-postcards tıklandığında #postcard-modal açılmalı ve 9 pul render edilmeli', () => {
    const openBtn = document.getElementById('btn-open-postcards');
    expect(openBtn).not.toBeNull();

    openBtn?.click();

    const modal = document.getElementById('postcard-modal');
    expect(modal?.classList.contains('hidden')).toBe(false);

    const grid = document.getElementById('postcard-grid');
    expect(grid?.children.length).toBe(9);

    closePostcardModal();
    expect(modal?.classList.contains('hidden')).toBe(true);
  });

  it('2. Pul toplandığında ilerleme çubuğu ve pul karoları güncellenmeli', () => {
    const season = getCurrentSeason();
    SeasonalEventManager.awardRandomStamp(season.id);
    SeasonalEventManager.awardRandomStamp(season.id);

    openPostcardModal();

    const countLabel = document.getElementById('postcard-stamps-count-label');
    const progressBar = document.getElementById('postcard-progress-bar');

    expect(countLabel?.innerText).toBe('2 / 9');
    expect(progressBar?.style.width).toBe('22%');

    closePostcardModal();
  });
});
