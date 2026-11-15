export const matchModalTemplate = `
<!-- Eşleşme Arama Modalı -->
<div id="match-search-modal" class="absolute inset-0 bg-slate-900/80 hidden flex-col items-center justify-center z-[80] p-4 backdrop-blur-md">
    <div class="bg-white rounded-3xl p-5 w-full max-w-sm flex flex-col max-h-[88vh] shadow-2xl relative overflow-y-auto hidden-scrollbar border border-slate-100">
        <button id="close-match-search" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 text-sm">✕</button>

        <div class="w-12 h-12 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-2 shadow-inner">
            ⚔️
        </div>
        <h3 class="text-xl font-black text-slate-800 mb-0.5">Düello Arenası</h3>
        <p class="text-[11px] text-slate-500 mb-3 font-medium">Canlı oyuncularla yarış veya Seviyeli YZ Karakterlere meydan oku!</p>

        <!-- Ortak Ayarlar: Disiplin Seçimi (5 Sembol) -->
        <div class="mb-2.5 w-full">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-wider text-left mb-1 flex justify-between items-center">
                <span>Oyun Disiplini</span>
                <span id="arena-variant-multiplier-badge" class="text-indigo-600 font-bold">1.0x Puan</span>
            </p>
            <div class="grid grid-cols-5 gap-1.5 bg-slate-200/80 p-1.5 rounded-2xl">
                <button id="arena-variant-classic" data-variant="classic" class="arena-variant-btn p-1.5 rounded-xl bg-white text-indigo-600 shadow-sm flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform" title="Klasik">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>
                    <span class="text-[9px] font-black leading-none">Klasik</span>
                </button>
                <button id="arena-variant-irregular" data-variant="irregular" class="arena-variant-btn p-1.5 rounded-xl bg-transparent text-slate-600 hover:bg-white/60 flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform" title="Parçalı">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h6v6H4zM10 10h6v6h-6zM14 4h6v6H4z"/></svg>
                    <span class="text-[9px] font-bold leading-none">Parçalı</span>
                </button>
                <button id="arena-variant-killer" data-variant="killer" class="arena-variant-btn p-1.5 rounded-xl bg-transparent text-slate-600 hover:bg-white/60 flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform" title="Hesap">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path stroke-dasharray="2 2" d="M3 3h18v18H3z"/><path d="M7 7h10L10 12l7 5H7"/></svg>
                    <span class="text-[9px] font-bold leading-none">Hesap</span>
                </button>
                <button id="arena-variant-wordoku" data-variant="wordoku" class="arena-variant-btn p-1.5 rounded-xl bg-transparent text-slate-600 hover:bg-white/60 flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform" title="Harfli">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7l-4 10h8M9 13h6"/></svg>
                    <span class="text-[9px] font-bold leading-none">Harfli</span>
                </button>
                <button id="arena-variant-samurai" data-variant="samurai" class="arena-variant-btn p-1.5 rounded-xl bg-transparent text-slate-600 hover:bg-white/60 flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform" title="Samurai">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="8" height="8" rx="1"/><rect x="2" y="2" width="6" height="6" rx="1"/><rect x="16" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/></svg>
                    <span class="text-[9px] font-bold leading-none">Samurai</span>
                </button>
            </div>
        </div>

        <!-- Ortak Ayarlar: Süre Modu -->
        <div class="mb-2.5 w-full">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-wider text-left mb-1">Süre Modu</p>
            <div class="flex gap-1 p-1 bg-slate-100 rounded-xl">
                <button id="btn-match-time-3m" data-time="180" class="match-time-btn flex-1 py-1 rounded-lg font-black text-[10px] transition-all bg-indigo-600 text-white shadow-sm">
                    ⚡ 3 Dk
                </button>
                <button id="btn-match-time-7m" data-time="420" class="match-time-btn flex-1 py-1 rounded-lg font-bold text-[10px] transition-all text-slate-600 hover:text-slate-900">
                    ⏱️ 7 Dk
                </button>
                <button id="btn-match-time-no-limit" data-time="0" class="match-time-btn flex-1 py-1 rounded-lg font-bold text-[10px] transition-all text-slate-600 hover:text-slate-900">
                    ♾️ Süresiz
                </button>
            </div>
        </div>

        <!-- Ortak Ayarlar: Zorluk Modu -->
        <div class="mb-3 w-full">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-wider text-left mb-1">Zorluk Seviyesi</p>
            <div class="flex gap-1 p-1 bg-slate-100 rounded-xl">
                <button id="btn-diff-basit" data-diff="basit" class="arena-diff-btn flex-1 py-1 rounded-lg font-black text-[10px] transition-all bg-emerald-600 text-white shadow-sm">
                    🟢 Basit
                </button>
                <button id="btn-diff-orta" data-diff="orta" class="arena-diff-btn flex-1 py-1 rounded-lg font-bold text-[10px] transition-all text-slate-600 hover:text-slate-900">
                    🟡 Orta
                </button>
                <button id="btn-diff-zor" data-diff="zor" class="arena-diff-btn flex-1 py-1 rounded-lg font-bold text-[10px] transition-all text-slate-600 hover:text-slate-900">
                    🔴 Zor
                </button>
            </div>
        </div>

        <!-- İkili Ana Sekme: Canlı Oyuncu Lobisi vs. Yapay Zekâ Botları -->
        <div class="flex gap-1 p-1 bg-slate-200/80 rounded-2xl mb-3 w-full">
            <button id="tab-arena-lobby" class="flex-1 py-2 rounded-xl font-black text-xs transition-all bg-white text-indigo-700 shadow-sm flex items-center justify-center gap-1">
                <span>🌐</span>
                <span>Oyuncu Lobisi</span>
            </button>
            <button id="tab-arena-bots" class="flex-1 py-2 rounded-xl font-bold text-xs transition-all text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1">
                <span>🤖</span>
                <span>YZ Rakipler</span>
            </button>
        </div>

        <!-- SEKME 1: CANLI OYUNCU LOBİSİ -->
        <div id="section-arena-lobby" class="w-full flex flex-col gap-2">
            <div id="lobby-players-list" class="flex flex-col gap-2 max-h-[220px] overflow-y-auto hidden-scrollbar pr-0.5">
                <!-- Canlı Oyuncular Render Edilecek -->
            </div>
            <button id="btn-quick-online-match" class="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-2.5 rounded-2xl shadow-md active:scale-95 transition-all text-xs flex items-center justify-center gap-2 mt-1">
                <span>🎲</span>
                <span>Rastgele Çevrimiçi Rakip Ara</span>
            </button>
        </div>

        <!-- SEKME 2: YAPAY ZEKÂ BOT RAKİPLERİ -->
        <div id="section-arena-bots" class="hidden w-full flex-col gap-2">
            <div id="bot-characters-list" class="flex flex-col gap-2 max-h-[240px] overflow-y-auto hidden-scrollbar pr-0.5">
                <!-- Bot Kartları Render Edilecek -->
            </div>
        </div>

        <!-- Arama Durum Göstergesi -->
        <div id="match-search-status-box" class="hidden flex-col items-center gap-2 py-3 bg-indigo-50 border border-indigo-100 rounded-2xl mt-2">
            <div class="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p id="match-search-status-text" class="text-xs font-bold text-indigo-700 animate-pulse">Açık maçlar taranıyor...</p>
        </div>
    </div>
</div>

<!-- Düello Çıkış Onay Modalı -->
<div id="duel-exit-modal" class="absolute inset-0 bg-slate-900/85 hidden flex-col items-center justify-center z-[92] p-4 backdrop-blur-md">
    <div class="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl relative border border-slate-100">
        <div class="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">
            ⚠️
        </div>
        <h3 class="text-xl font-black text-slate-800 mb-1">Düellodan Çekiliyor Musunuz?</h3>
        <p class="text-xs font-medium text-slate-500 mb-5 leading-relaxed">
            Maç henüz bitmedi. Çekilmeniz durumunda kasanızdan ceza olarak <strong class="text-rose-600 font-black">50 🪙 Altın</strong> düşülecektir.
        </p>

        <div class="flex flex-col gap-2.5 w-full">
            <button id="btn-confirm-duel-exit" class="w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-3.5 rounded-2xl shadow-lg active:scale-95 transition-all text-xs tracking-wide">
                Çekil (-50 🪙)
            </button>
            <button id="btn-cancel-duel-exit" class="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl active:scale-95 transition-all text-xs">
                Maça Dön
            </button>
        </div>
    </div>
</div>

<!-- Düello Sonuç Modalı -->
<div id="match-result-modal" class="absolute inset-0 bg-slate-900/85 hidden flex-col items-center justify-center z-[88] p-4 backdrop-blur-md">
    <div class="bg-white rounded-3xl p-6 w-full max-w-sm flex flex-col items-center text-center shadow-2xl relative">
        <div id="match-result-icon" class="text-6xl mb-2 animate-bounce">🏆</div>
        <h3 id="match-result-title" class="text-2xl font-black text-slate-800 mb-1">DÜELLO ZAFERİ!</h3>
        <p id="match-result-subtitle" class="text-xs font-bold text-slate-500 mb-4">Rakibinizi geride bırakarak maçı kazandınız!</p>

        <div class="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex justify-around items-center mb-4 shadow-inner">
            <div>
                <p class="text-[10px] text-slate-400 font-bold uppercase">Süre</p>
                <p id="match-result-time" class="text-sm font-black text-slate-700">02:30</p>
            </div>
            <div class="w-[1px] h-8 bg-slate-200"></div>
            <div>
                <p class="text-[10px] text-slate-400 font-bold uppercase">Hata</p>
                <p id="match-result-errors" class="text-sm font-black text-slate-700">0 / 3</p>
            </div>
            <div class="w-[1px] h-8 bg-slate-200"></div>
            <div>
                <p class="text-[10px] text-slate-400 font-bold uppercase">Ödül</p>
                <p id="match-result-reward" class="text-sm font-black text-amber-600">+50 🪙</p>
            </div>
        </div>

        <button id="btn-close-match-result" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 rounded-xl shadow-lg active:scale-95 transition-all text-sm">
            Ana Menüye Dön ➔
        </button>
    </div>
</div>
`;
