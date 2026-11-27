import { UserManager } from '../store/userState';

export interface ClanMember {
  uid: string;
  username: string;
  role: 'leader' | 'elder' | 'member';
  contribution: number;
}

export interface ClanDef {
  id: string;
  name: string;
  tag: string;
  description: string;
  icon: string;
  level: number;
  runeDustBank: number;
  runeDustGoal: number;
  isDungeonUnlocked: boolean;
  weeklyBossMaxHealth: number;
  weeklyBossCurrentHealth: number;
  memberCount: number;
  maxMembers: number;
  members: ClanMember[];
}

const STORAGE_KEY_USER_CLAN = 'sudokumap_user_clan_v1';
const STORAGE_KEY_PUBLIC_CLANS = 'sudokumap_public_clans_v1';

export const DEFAULT_CLANS: ClanDef[] = [
  {
    id: 'clan_rune_guardians',
    name: 'Rün Muhafızları',
    tag: 'RUNE',
    description: 'Kadim mühürleri koruyan bilge samuraylar birliği.',
    icon: '⛩️',
    level: 3,
    runeDustBank: 350,
    runeDustGoal: 500,
    isDungeonUnlocked: false,
    weeklyBossMaxHealth: 10000,
    weeklyBossCurrentHealth: 10000,
    memberCount: 18,
    maxMembers: 30,
    members: []
  },
  {
    id: 'clan_zen_masters',
    name: 'Zen Ustaları',
    tag: 'ZEN',
    description: 'Saf mantık ve odaklanma yolunda ilerleyen bulmaca keşişleri.',
    icon: '🧘',
    level: 4,
    runeDustBank: 480,
    runeDustGoal: 500,
    isDungeonUnlocked: false,
    weeklyBossMaxHealth: 12000,
    weeklyBossCurrentHealth: 12000,
    memberCount: 24,
    maxMembers: 30,
    members: []
  }
];

export const ClanManager = {
  getPublicClans(): ClanDef[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PUBLIC_CLANS);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY_PUBLIC_CLANS, JSON.stringify(DEFAULT_CLANS));
        return JSON.parse(JSON.stringify(DEFAULT_CLANS));
      }
      return JSON.parse(raw);
    } catch {
      return JSON.parse(JSON.stringify(DEFAULT_CLANS));
    }
  },

  savePublicClans(clans: ClanDef[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_PUBLIC_CLANS, JSON.stringify(clans));
    } catch {
      // ignore
    }
  },

  getUserClan(): ClanDef | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_USER_CLAN);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  saveUserClan(clan: ClanDef | null): void {
    try {
      if (!clan) {
        localStorage.removeItem(STORAGE_KEY_USER_CLAN);
      } else {
        localStorage.setItem(STORAGE_KEY_USER_CLAN, JSON.stringify(clan));
      }
    } catch {
      // ignore
    }
  },

  createClan(name: string, tag: string, description: string, icon: string = '⛩️'): { success: boolean; clan?: ClanDef; error?: string } {
    if (!name || name.trim().length < 3) {
      return { success: false, error: 'invalid_name' };
    }
    const cleanTag = tag.trim().toUpperCase().slice(0, 4);
    if (cleanTag.length < 2) {
      return { success: false, error: 'invalid_tag' };
    }

    const currentClan = this.getUserClan();
    if (currentClan) {
      return { success: false, error: 'already_in_clan' };
    }

    const newClan: ClanDef = {
      id: `clan_${Date.now()}`,
      name: name.trim(),
      tag: cleanTag,
      description: description.trim() || 'Aktif Sudoku Klanı',
      icon,
      level: 1,
      runeDustBank: 0,
      runeDustGoal: 500,
      isDungeonUnlocked: false,
      weeklyBossMaxHealth: 10000,
      weeklyBossCurrentHealth: 10000,
      memberCount: 1,
      maxMembers: 30,
      members: [
        {
          uid: 'user_' + Date.now(),
          username: UserManager.getUsername() || 'Oyuncu',
          role: 'leader',
          contribution: 0
        }
      ]
    };

    this.saveUserClan(newClan);
    const publicList = this.getPublicClans();
    publicList.unshift(newClan);
    this.savePublicClans(publicList);

    return { success: true, clan: newClan };
  },

  joinClan(clanId: string): { success: boolean; clan?: ClanDef; error?: string } {
    const current = this.getUserClan();
    if (current) {
      return { success: false, error: 'already_in_clan' };
    }

    const publicList = this.getPublicClans();
    const target = publicList.find(c => c.id === clanId);
    if (!target) {
      return { success: false, error: 'clan_not_found' };
    }

    if (target.memberCount >= target.maxMembers) {
      return { success: false, error: 'clan_full' };
    }

    target.memberCount += 1;
    target.members.push({
      uid: 'user_' + Date.now(),
      username: UserManager.getUsername() || 'Oyuncu',
      role: 'member',
      contribution: 0
    });

    this.saveUserClan(target);
    this.savePublicClans(publicList);
    return { success: true, clan: target };
  },

  leaveClan(): boolean {
    const current = this.getUserClan();
    if (!current) return false;

    const publicList = this.getPublicClans();
    const target = publicList.find(c => c.id === current.id);
    if (target) {
      target.memberCount = Math.max(0, target.memberCount - 1);
      target.members = target.members.filter(m => m.username !== UserManager.getUsername());
      this.savePublicClans(publicList);
    }

    this.saveUserClan(null);
    return true;
  },

  async donateRuneDust(amountCrystals: number): Promise<{ success: boolean; donatedDust: number; dungeonUnlockedNow: boolean }> {
    const clan = this.getUserClan();
    if (!clan || amountCrystals <= 0) {
      return { success: false, donatedDust: 0, dungeonUnlockedNow: false };
    }

    const spent = await UserManager.spendCrystals(amountCrystals);
    if (!spent) {
      return { success: false, donatedDust: 0, dungeonUnlockedNow: false };
    }

    const dustGain = amountCrystals * 10;
    clan.runeDustBank += dustGain;
    let unlockedNow = false;

    if (clan.runeDustBank >= clan.runeDustGoal && !clan.isDungeonUnlocked) {
      clan.isDungeonUnlocked = true;
      unlockedNow = true;
    }

    this.saveUserClan(clan);

    const publicList = this.getPublicClans();
    const targetIdx = publicList.findIndex(c => c.id === clan.id);
    if (targetIdx !== -1) {
      publicList[targetIdx] = clan;
      this.savePublicClans(publicList);
    }

    return {
      success: true,
      donatedDust: dustGain,
      dungeonUnlockedNow: unlockedNow
    };
  },

  damageSamuraiBoss(damageHp: number): { bossDefeated: boolean; remainingHp: number } {
    const clan = this.getUserClan();
    if (!clan || !clan.isDungeonUnlocked) {
      return { bossDefeated: false, remainingHp: clan?.weeklyBossCurrentHealth || 0 };
    }

    clan.weeklyBossCurrentHealth = Math.max(0, clan.weeklyBossCurrentHealth - damageHp);
    const defeated = clan.weeklyBossCurrentHealth === 0;

    this.saveUserClan(clan);
    return { bossDefeated: defeated, remainingHp: clan.weeklyBossCurrentHealth };
  }
};
