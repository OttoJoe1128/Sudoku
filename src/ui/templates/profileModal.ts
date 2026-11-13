export const profileModalTemplate = `
<div id="view-profile" class="absolute inset-0 bg-slate-900/60 hidden flex-col items-center justify-center z-[70] p-4 backdrop-blur-sm">
    <div class="bg-white rounded-3xl p-5 w-full max-w-sm flex flex-col max-h-[85vh] shadow-2xl relative overflow-y-auto hidden-scrollbar">
        <!-- Üst Başlık ve Kapat Butonu -->
        <div class="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
            <h3 class="text-xl font-black text-slate-800 flex items-center gap-2">
                👤 Oyuncu Profili
            </h3>
            <button id="close-profile" class="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors">
                ✕
            </button>
        </div>

        <!-- Profil Üst Kartı -->
        <div class="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-4 mb-4 flex flex-col items-center text-center shadow-inner relative">
            <div class="w-16 h-16 rounded-2xl bg-white border-2 border-indigo-200 flex items-center justify-center text-3xl shadow-sm mb-2">
                🎮
            </div>
            <div class="flex items-center gap-1.5 mb-1">
                <span id="profile-username" class="font-black text-slate-800 text-lg">Oyuncu</span>
                <button id="btn-profile-edit-name" title="İsmi Değiştir" class="text-slate-400 hover:text-indigo-600 text-sm p-1">✏️</button>
            </div>
            <div class="flex items-center gap-2 mt-1">
                <span id="profile-level-badge" class="bg-indigo-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-sm">🏅 Seviye 1</span>
                <span id="profile-gold-badge" class="bg-amber-100 text-amber-800 text-xs font-black px-3 py-1 rounded-full border border-amber-200 shadow-sm">🪙 100 Altın</span>
            </div>
        </div>

        <!-- İstatistikler Kartı -->
        <div class="mb-4">
            <h4 class="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Oyun İstatistikleri</h4>
            <div class="grid grid-cols-2 gap-2.5">
                <div class="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-center">
                    <p class="text-[10px] text-slate-400 font-bold uppercase">Tamamlanan</p>
                    <p id="profile-stat-completed" class="text-lg font-black text-slate-800">0</p>
                    <p class="text-[9px] text-slate-400 font-medium">Bulmaca</p>
                </div>
                <div class="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3 text-center">
                    <p class="text-[10px] text-emerald-600 font-bold uppercase">🟢 Basit Rekor</p>
                    <p id="profile-best-basit" class="text-lg font-black text-emerald-800">--:--</p>
                    <p class="text-[9px] text-emerald-600 font-medium">En Hızlı Süre</p>
                </div>
                <div class="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 text-center">
                    <p class="text-[10px] text-amber-600 font-bold uppercase">🟡 Orta Rekor</p>
                    <p id="profile-best-orta" class="text-lg font-black text-amber-800">--:--</p>
                    <p class="text-[9px] text-amber-600 font-medium">En Hızlı Süre</p>
                </div>
                <div class="bg-rose-50 border border-rose-200/80 rounded-2xl p-3 text-center">
                    <p class="text-[10px] text-rose-600 font-bold uppercase">🔴 Zor Rekor</p>
                    <p id="profile-best-zor" class="text-lg font-black text-rose-800">--:--</p>
                    <p class="text-[9px] text-rose-600 font-medium">En Hızlı Süre</p>
                </div>
            </div>
        </div>

        <!-- Rozet Vitrini -->
        <div class="bg-white border border-slate-200 rounded-2xl p-3.5 flex flex-col gap-2.5">
            <div class="flex justify-between items-center">
                <span class="text-xs font-black text-slate-700">Rozet Vitrini</span>
                <span id="profile-badges-count" class="text-[11px] font-bold text-indigo-600">0 / 10 Rozet</span>
            </div>
            <div id="profile-badges-preview" class="flex gap-2 overflow-x-auto py-1 hidden-scrollbar">
                <!-- Son kazanılan rozetler buraya gelecek -->
            </div>
            <button id="btn-profile-open-achievements" class="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xs transition-colors text-center mt-1">
                Tüm Rozetleri & Ödülleri Gör ➔
            </button>
        </div>
    </div>
</div>
`;
