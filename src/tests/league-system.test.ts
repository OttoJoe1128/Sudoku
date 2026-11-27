// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  LEAGUE_TIERS,
  getLeagueByRating,
  getLeagueProgress,
  LeagueManager
} from '../engine/leagueSystem';
import { UserManager } from '../store/userState';
import { TRANSLATIONS } from '../i18n/translations';

describe('Faz 4 — Adım 4.2: Küresel Sezonluk Ligler ve Rütbe Hiyerarşisi', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. getLeagueByRating: MMR baremlerine göre doğru lig kademesini döndürmeli', () => {
    expect(getLeagueByRating(500).id).toBe('bronze');
    expect(getLeagueByRating(1000).id).toBe('silver');
    expect(getLeagueByRating(1600).id).toBe('gold');
    expect(getLeagueByRating(1900).id).toBe('platinum');
    expect(getLeagueByRating(2400).id).toBe('diamond');
    expect(getLeagueByRating(3000).id).toBe('grandmaster');
  });

  it('2. getLeagueProgress: Bir sonraki lige olan mesafeyi ve ilerleme yüzdesini doğru hesaplamalı', () => {
    // Silver ligi: 1000 - 1399 (Aralık 400). 1200 MMR -> 200/400 = %50
    const prog = getLeagueProgress(1200);
    expect(prog.currentLeague.id).toBe('silver');
    expect(prog.nextLeague?.id).toBe('gold');
    expect(prog.progressPct).toBe(50);
    expect(prog.mmrToNext).toBe(200);

    // Grandmaster: Son lig, next null olmalı
    const gmProg = getLeagueProgress(2800);
    expect(gmProg.currentLeague.id).toBe('grandmaster');
    expect(gmProg.nextLeague).toBeNull();
    expect(gmProg.progressPct).toBe(100);
    expect(gmProg.mmrToNext).toBe(0);
  });

  it('3. LeagueManager: Sezon sonu ödülü alma ve mükerrer engelleme', async () => {
    UserManager.initUser();
    const initialGold = UserManager.getGold();
    const initialCrystals = UserManager.getCrystals();

    // Gold lig ödülü: +200 🪙 +20 💎
    const res = await LeagueManager.claimLeagueSeasonReward('season_1', 1500);
    expect(res.success).toBe(true);
    expect(res.gold).toBe(200);
    expect(res.crystals).toBe(20);

    expect(UserManager.getGold()).toBe(initialGold + 200);
    expect(UserManager.getCrystals()).toBe(initialCrystals + 20);

    // Aynı sezon için tekrar talep edilemez
    const dupRes = await LeagueManager.claimLeagueSeasonReward('season_1', 1500);
    expect(dupRes.success).toBe(false);
  });

  it('4. Çift Dilli Bütünlük: Tüm lig anahtarları TR ve EN içinde tanımlı olmalı', () => {
    LEAGUE_TIERS.forEach(t => {
      expect(TRANSLATIONS.tr[t.nameKey as keyof typeof TRANSLATIONS.tr]).toBeDefined();
      expect(TRANSLATIONS.en[t.nameKey as keyof typeof TRANSLATIONS.en]).toBeDefined();
    });
  });
});
