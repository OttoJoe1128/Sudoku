// src/engine/shop.ts
import { getGameState, updateGameState } from '../store/gameState';

export const ShopItems = [
  { id: 'theme-dark', name: 'Karanlık Tema', price: 200 },
  { id: 'theme-neon', name: 'Neon Tema', price: 500 }
];

export const ShopManager = {
  buyItem(itemId: string) {
    const item = ShopItems.find(i => i.id === itemId);
    if (!item) return { success: false, msg: "Ürün bulunamadı." };
    
    const state = getGameState();
    if (state.gold < item.price) return { success: false, msg: "Altın yetersiz!" };
    
    updateGameState({ gold: state.gold - item.price });
    return { success: true, msg: "Satın alındı!" };
  }
};
