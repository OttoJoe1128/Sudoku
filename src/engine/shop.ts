import { UserManager } from '../store/userState';

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  type: 'theme';
  previewColor: string;
}

export const ShopItems: ShopItem[] = [
  { id: 'theme-default', name: 'Klasik Açık Tema', price: 0, type: 'theme', previewColor: '#f8fafc' },
  { id: 'theme-dark', name: 'Karanlık Tema 🌙', price: 200, type: 'theme', previewColor: '#0f172a' },
  { id: 'theme-neon', name: 'Neon Siber Tema ⚡', price: 500, type: 'theme', previewColor: '#312e81' },
  { id: 'theme-emerald', name: 'Zümrüt Yeşil Tema 🌲', price: 300, type: 'theme', previewColor: '#064e3b' }
];

export const ShopManager = {
  getPurchasedThemes(): string[] {
    try {
      const raw = localStorage.getItem('sudoku_purchased_themes');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return ['theme-default']; // Klasik tema varsayılan olarak açık
  },

  getActiveTheme(): string {
    return localStorage.getItem('sudoku_active_theme') || 'theme-default';
  },

  setActiveTheme(themeId: string): boolean {
    const purchased = this.getPurchasedThemes();
    if (!purchased.includes(themeId)) {
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
      return { success: false, msg: `Altın yetersiz! Bu tema için ${item.price} 🪙 gerekiyor.` };
    }

    const newGold = currentGold - item.price;
    await UserManager.updateProgress(UserManager.getCurrentLevel(), newGold);

    purchased.push(itemId);
    localStorage.setItem('sudoku_purchased_themes', JSON.stringify(purchased));
    localStorage.setItem('sudoku_active_theme', itemId);

    return { success: true, msg: `Tebrikler! "${item.name}" satın alındı ve aktifleştirildi.` };
  }
};
