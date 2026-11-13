export const profileModalTemplate = `
<div id="view-profile" class="absolute inset-0 bg-slate-900/60 hidden flex-col items-center justify-center z-[70] p-4 backdrop-blur-sm">
    <div class="bg-white rounded-3xl p-5 w-full max-w-sm flex flex-col max-h-[88vh] shadow-2xl relative overflow-y-auto hidden-scrollbar">
        <!-- Üst Başlık ve Kapat Butonu -->
        <div class="flex justify-between items-center mb-3 border-b border-slate-100 pb-2.5 shrink-0">
            <h3 class="text-xl font-black text-slate-800 flex items-center gap-2">
                👤 Oyuncu Profili
            </h3>
            <button id="close-profile" class="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors">
                ✕
            </button>
        </div>

        <!-- Profil Üst Kartı -->
        <div class="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100 rounded-2xl p-4 mb-3 flex flex-col items-center text-center shadow-inner relative">
            <div id="profile-avatar-display" class="w-16 h-16 rounded-2xl bg-white border-2 border-indigo-200 flex items-center justify-center text-3xl shadow-sm mb-2 relative group cursor-pointer">
                🎮
            </div>

            <p id="profile-player-title" class="text-[10px] font-black text-indigo-600 uppercase tracking-wider block mb-0.5">Çırak</p>

            <div class="flex items-center gap-1.5 mb-2">
                <span id="profile-username" class="font-black text-slate-800 text-lg">Oyuncu</span>
                <button id="btn-profile-edit-name" title="Kullanıcı Adını Düzenle" class="text-slate-400 hover:text-indigo-600 p-1 rounded-lg hover:bg-white/60 transition-colors">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </button>
            </div>

            <div class="flex items-center gap-2">
                <span id="profile-level-badge" class="bg-indigo-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-sm">🏅 Seviye 1</span>
                <span id="profile-gold-badge" class="bg-amber-100 text-amber-800 text-xs font-black px-3 py-1 rounded-full border border-amber-200 shadow-sm">🪙 100 Altın</span>
            </div>
        </div>

        <!-- Düello ve Oyun İstatistikleri -->
        <div class="mb-3">
            <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Oyun & Düello İstatistikleri</h4>
            <div class="grid grid-cols-2 gap-2 mb-2">
                <div class="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 text-center">
                    <p class="text-[9px] text-slate-400 font-bold uppercase">Tamamlanan</p>
                    <p id="profile-stat-completed" class="text-base font-black text-slate-800">0</p>
                    <p class="text-[9px] text-slate-400 font-medium">Bulmaca</p>
                </div>
                <div class="bg-purple-50 border border-purple-200/80 rounded-2xl p-2.5 text-center">
                    <p class="text-[9px] text-purple-600 font-bold uppercase">⚔️ Düello Karnesi</p>
                    <p id="profile-stat-duel" class="text-base font-black text-purple-900">0 G / 0 M</p>
                    <p id="profile-stat-mmr" class="text-[9px] text-purple-600 font-black">1000 MMR</p>
                </div>
            </div>

            <!-- Rekor Süreler Grid -->
            <div class="grid grid-cols-3 gap-1.5">
                <div class="bg-emerald-50 border border-emerald-200/80 rounded-xl p-2 text-center">
                    <p class="text-[9px] text-emerald-600 font-bold">🟢 Basit</p>
                    <p id="profile-best-basit" class="text-xs font-black text-emerald-900">--:--</p>
                </div>
                <div class="bg-amber-50 border border-amber-200/80 rounded-xl p-2 text-center">
                    <p class="text-[9px] text-amber-600 font-bold">🟡 Orta</p>
                    <p id="profile-best-orta" class="text-xs font-black text-amber-900">--:--</p>
                </div>
                <div class="bg-rose-50 border border-rose-200/80 rounded-xl p-2 text-center">
                    <p class="text-[9px] text-rose-600 font-bold">🔴 Zor</p>
                    <p id="profile-best-zor" class="text-xs font-black text-rose-900">--:--</p>
                </div>
            </div>
        </div>

        <!-- Rozet Vitrini -->
        <div class="bg-white border border-slate-200/80 rounded-2xl p-3 mb-3 flex flex-col gap-2 shadow-sm">
            <div class="flex justify-between items-center">
                <span class="text-xs font-black text-slate-700">Rozet Vitrini</span>
                <span id="profile-badges-count" class="text-[11px] font-bold text-indigo-600">0 / 10 Rozet</span>
            </div>
            <div id="profile-badges-preview" class="flex gap-2 overflow-x-auto py-1 hidden-scrollbar">
                <!-- Son kazanılan rozetler -->
            </div>
            <button id="btn-profile-open-achievements" class="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-1.5 rounded-xl text-xs transition-colors text-center">
                Tüm Rozetleri Gör ➔
            </button>
        </div>

        <!-- Kendi Profilimiz İçin Kontroller (Avatar/Unvan Seçimi + Bildirimler) -->
        <div id="profile-own-controls" class="flex flex-col gap-2.5 mb-1">
            <!-- Avatar Seçici -->
            <div class="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-left">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Avatar Seç</p>
                <div id="profile-avatar-selector" class="flex justify-between items-center gap-1">
                    <!-- 8 Avatar Seçeneği -->
                </div>
            </div>

            <!-- Unvan Seçici -->
            <div class="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-left">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Unvan Seç</p>
                <select id="profile-title-select" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600 shadow-sm">
                    <!-- Unvan opsiyonları -->
                </select>
            </div>

            <!-- Bildirim Toggle -->
            <div class="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex justify-between items-center">
                <div class="flex items-center gap-2">
                    <span class="text-lg">🔔</span>
                    <div class="text-left">
                        <p class="text-xs font-black text-slate-800">Canlı Düello Bildirimleri</p>
                        <p class="text-[10px] text-slate-400 font-medium">Anlık meydan okuma istekleri al</p>
                    </div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="toggle-notifications" class="sr-only peer">
                    <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
            </div>
        </div>

        <!-- Başka Bir Oyuncunun Profili İçin Düello İsteği Butonu -->
        <div id="profile-other-controls" class="hidden w-full">
            <button id="btn-challenge-player" class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black py-3 rounded-2xl shadow-md active:scale-95 transition-all text-xs flex items-center justify-center gap-2">
                <span>⚔️</span>
                <span>Bu Oyuncuya Düello İsteği Gönder</span>
            </button>
        </div>
    </div>
</div>
`;
