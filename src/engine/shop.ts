import { UserManager } from '../store/userState';

export interface ShopItem {
  id: string;
  name: string;
  nameEn: string;
  price: number;
  type: 'theme';
  previewColor: string;
  accentColor: string;
}

export const ShopItems: ShopItem[] = [
  { id: 'theme-ivory', name: 'Fildişi & Mermer (Gündüz)', nameEn: 'Ivory & Marble (Daylight)', price: 0, type: 'theme', previewColor: '#F7F3EA', accentColor: '#A67C2E' },
  { id: 'theme-obsidian', name: 'Obsidyen & Altın', nameEn: 'Obsidian & Gold', price: 0, type: 'theme', previewColor: '#070D19', accentColor: '#C89B3C' },
  { id: 'theme-shogun', name: 'Kızıl Shogun', nameEn: 'Crimson Shogun', price: 250, type: 'theme', previewColor: '#0F090C', accentColor: '#D4A853' },
  { id: 'theme-cyber', name: 'Siber Akşam', nameEn: 'Cyber Dusk', price: 300, type: 'theme', previewColor: '#0B0718', accentColor: '#22D3EE' },
  { id: 'theme-jade', name: 'Antik Yeşim', nameEn: 'Ancient Jade', price: 350, type: 'theme', previewColor: '#051613', accentColor: '#D4B475' }
];

export const ShopManager = {
  getPurchasedThemes(): string[] {
    let parsed: string[] = [];
    try {
      const raw = localStorage.getItem('sudoku_purchased_themes');
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) parsed = arr;
      }
    } catch {
      // ignore
    }
    const merged = Array.from(new Set(['theme-ivory', 'theme-obsidian', ...parsed]));
    return merged;
  },

  getActiveTheme(): string {
    const raw = localStorage.getItem('sudoku_active_theme');
    if (!raw || raw === 'theme-default' || raw === 'theme-light' || raw === 'theme-dark') {
      return 'theme-ivory';
    }
    return raw;
  },

  setActiveTheme(themeId: string): boolean {
    const purchased = this.getPurchasedThemes();
    if (!purchased.includes(themeId) && themeId !== 'theme-obsidian' && themeId !== 'theme-ivory') {
      return false;
    }
    localStorage.setItem('sudoku_active_theme', themeId);
    return true;
  },

  async buyItem(itemId: string): Promise<{ success: boolean; msg: string }> {
    const item = ShopItems.find(i => i.id === itemId);
    if (!item) return { success: false, msg: "Ürün bulunamadı." };

    const purchased = this.getPurchasedThemes();
    if (purchased.includes(itemId)) {
      this.setActiveTheme(itemId);
      return { success: true, msg: "Tema aktifleştirildi!" };
    }

    const currentGold = UserManager.getGold();
    if (currentGold < item.price) {
      return { success: false, msg: `Altın yetersiz! Bu tema için ${item.price} Altın gerekiyor.` };
    }

    const newGold = currentGold - item.price;
    await UserManager.updateProgress(UserManager.getCurrentLevel(), newGold);

    purchased.push(itemId);
    localStorage.setItem('sudoku_purchased_themes', JSON.stringify(purchased));
    localStorage.setItem('sudoku_active_theme', itemId);

    return { success: true, msg: `Tebrikler! "${item.name}" temasını satın aldınız.` };
  }
};
