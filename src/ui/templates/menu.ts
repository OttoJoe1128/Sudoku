import { Icons } from '../../design/icons';
import { renderHeaderStatusMatrix } from '../components/menu/HeaderStatusMatrix';
import { renderHeroAdventureCard } from '../components/menu/HeroAdventureCard';
import { renderLiveOpsPromoCard } from '../components/menu/LiveOpsPromoCard';
import { renderSavedGamesStrip } from '../components/menu/SavedGamesStrip';
import { renderBentoGridModes } from '../components/menu/BentoGridModes';
import { renderQuickMapStrip } from '../components/menu/QuickMapStrip';
import { renderFloatingBottomDock } from '../components/menu/FloatingBottomDock';

export const menuTemplate = `
<div id="view-menu" class="flex-1 flex flex-col p-2.5 sm:p-3.5 gap-2 pb-16 sm:pb-20 overflow-hidden relative justify-between h-full font-sans select-none">
    ${renderHeaderStatusMatrix()}

    <!-- PWA Yükleme Kartı (Yalnızca masaüstü/web tarayıcısında koşullu) -->
    <button id="btn-install-pwa" class="hidden w-full bg-[var(--bg-card)] text-[var(--text-primary)] p-2 rounded-2xl text-xs font-bold items-center justify-between shadow-sm transition-all border border-[var(--border-subtle)] shrink-0">
        <div class="flex items-center gap-2">
            <span>${Icons.zap}</span>
            <span class="font-bold" data-i18n="menu_install_pwa">Uygulamayı Cihazına Yükle (PWA)</span>
        </div>
        <span class="bg-[var(--accent-gold)] text-[var(--text-on-gold)] text-[10px] font-black px-2 py-0.5 rounded-lg" data-i18n="menu_install_btn">YÜKLE</span>
    </button>

    <div class="w-full flex flex-col gap-1.5 shrink-0">
        ${renderHeroAdventureCard()}
        ${renderLiveOpsPromoCard()}
    </div>

    ${renderSavedGamesStrip()}
    ${renderBentoGridModes()}
    ${renderQuickMapStrip()}
    ${renderFloatingBottomDock()}
</div>
`;
