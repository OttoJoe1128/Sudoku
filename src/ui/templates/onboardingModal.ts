export const onboardingModalTemplate = `
<div id="onboarding-modal" class="absolute inset-0 bg-slate-950/85 hidden flex-col items-center justify-center z-[90] p-4 backdrop-blur-md">
    <div class="bg-[var(--bg-card)] text-[var(--text-primary)] rounded-3xl p-5 w-full max-w-sm text-center shadow-2xl relative border border-[var(--border-strong)] flex flex-col items-center">
        <!-- Üst Header (Adım Göstergesi + Uygulama Turu + Atla Düğmesi) -->
        <div class="w-full flex justify-between items-center mb-3 border-b border-[var(--border-subtle)] pb-2.5">
            <span id="onboarding-step-indicator" class="text-xs font-black text-[var(--accent-gold)] tracking-wider">1 / 3</span>
            <div class="flex items-center gap-2">
                <button id="btn-start-app-tour" class="text-[10px] font-black text-[var(--accent-gold)] hover:underline cursor-pointer" data-i18n="btn_app_tour">✨ Uygulama Turunu Başlat</button>
                <button id="btn-onboarding-skip" class="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer" data-i18n="btn_skip">Atla ✕</button>
            </div>
        </div>

        <!-- Dinamik Adım İçeriği Kapsayıcısı -->
        <div id="onboarding-content" class="w-full flex flex-col items-center">
            <!-- onboardingController tarafından render edilir -->
        </div>
    </div>
</div>
`;
