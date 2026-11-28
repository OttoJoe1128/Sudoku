import { renderHeaderStatusMatrix } from '../components/menu/HeaderStatusMatrix';
import { renderHeroAdventureCard } from '../components/menu/HeroAdventureCard';
import { renderLiveOpsPromoCard } from '../components/menu/LiveOpsPromoCard';
import { renderBentoGridModes } from '../components/menu/BentoGridModes';
import { renderSlideDrawerMenu } from '../components/menu/SlideDrawerMenu';

export const menuTemplate = `
<div id="view-menu" class="flex-1 flex flex-col p-2.5 sm:p-3.5 gap-2 overflow-y-auto hidden-scrollbar relative justify-start h-full font-sans select-none pb-8" style="padding-top: max(env(safe-area-inset-top, 0px), 0.75rem);">

    ${renderSlideDrawerMenu()}
    ${renderHeaderStatusMatrix()}

    <div class="w-full flex flex-col shrink-0 mt-1">
        ${renderHeroAdventureCard()}
    </div>

    ${renderLiveOpsPromoCard()}

    <!-- Kayıtlı Oyunlarım Uyarı Şeridi (Şimdi Çekmecede Ana Menüde Değil, ama DOM ID bağımlılıkları için gizli tutulabilir veya Çekmeceye taşındı) -->
    <!-- Not: btn-open-saved-games ID'si artık SlideDrawerMenu içinde. -->

    ${renderBentoGridModes()}
</div>
`;
