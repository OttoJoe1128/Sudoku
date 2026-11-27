// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { ClanManager } from '../engine/clanSystem';
import { UserManager } from '../store/userState';
import { TRANSLATIONS } from '../i18n/translations';

describe('Faz 4 — Adım 4.3: Klan / Lonca Rün Kapıları ve Haftalık Samurai Zindanı', () => {
  beforeEach(() => {
    localStorage.clear();
    UserManager.initUser();
  });

  it('1. createClan: Yeni klan kurma, lider rolü ve etiket doğrulama', () => {
    expect(ClanManager.getUserClan()).toBeNull();

    const res = ClanManager.createClan('Ejder Yuvası', 'DRGN', 'Ejderha gücüyle zindanları fethet.');
    expect(res.success).toBe(true);
    expect(res.clan?.name).toBe('Ejder Yuvası');
    expect(res.clan?.tag).toBe('DRGN');
    expect(res.clan?.members[0].role).toBe('leader');

    // Halihazırda klandayken tekrar klan kurulamaz
    const dup = ClanManager.createClan('İkinci Klan', 'IKN', 'Test');
    expect(dup.success).toBe(false);
    expect(dup.error).toBe('already_in_clan');
  });

  it('2. joinClan & leaveClan: Klana katılma ve ayrılma akışı', () => {
    const publicClans = ClanManager.getPublicClans();
    expect(publicClans.length).toBeGreaterThan(0);

    const targetClan = publicClans[0];
    const initialMembers = targetClan.memberCount;

    const joinRes = ClanManager.joinClan(targetClan.id);
    expect(joinRes.success).toBe(true);
    expect(joinRes.clan?.memberCount).toBe(initialMembers + 1);
    expect(ClanManager.getUserClan()?.id).toBe(targetClan.id);

    // Ayrılma
    const left = ClanManager.leaveClan();
    expect(left).toBe(true);
    expect(ClanManager.getUserClan()).toBeNull();
  });

  it('3. donateRuneDust: Rün tozu bağışı ve Samuray zindanının açılması', async () => {
    ClanManager.createClan('Rün Birliği', 'RUNE', 'Haftalık zindan avcıları.');
    await UserManager.addCrystals(50); // 50 Kristal = 500 Rün Tozu

    const initialDust = ClanManager.getUserClan()?.runeDustBank || 0;
    expect(ClanManager.getUserClan()?.isDungeonUnlocked).toBe(false);

    // 50 kristal bağışla (500 Rün Tozu -> Hedef 500'e ulaşır ve zindan açılır!)
    const donateRes = await ClanManager.donateRuneDust(50);
    expect(donateRes.success).toBe(true);
    expect(donateRes.donatedDust).toBe(500);
    expect(donateRes.dungeonUnlockedNow).toBe(true);

    const updated = ClanManager.getUserClan();
    expect(updated?.runeDustBank).toBe(initialDust + 500);
    expect(updated?.isDungeonUnlocked).toBe(true);

    // Zindan canavarına hasar verme
    const dmgRes = ClanManager.damageSamuraiBoss(2500);
    expect(dmgRes.bossDefeated).toBe(false);
    expect(dmgRes.remainingHp).toBe(7500);
  });

  it('4. Çift Dilli Bütünlük: clan_* anahtarları TR ve EN içinde birebir tanımlı olmalı', () => {
    const clanKeys = [
      'clan_title',
      'clan_samurai_dungeon',
      'clan_donate_dust',
      'clan_dungeon_unlocked',
      'clan_boss_defeated',
      'clan_toast_donated'
    ];

    clanKeys.forEach(k => {
      expect(TRANSLATIONS.tr[k as keyof typeof TRANSLATIONS.tr]).toBeDefined();
      expect(TRANSLATIONS.en[k as keyof typeof TRANSLATIONS.en]).toBeDefined();
    });
  });
});
