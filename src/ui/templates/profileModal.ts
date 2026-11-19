import { Icons, renderAvatarSVG } from '../../design/icons';

export const profileModalTemplate = `
<div id="view-profile" class="absolute inset-0 bg-slate-900/80 hidden flex-col items-center justify-center z-[70] p-4 backdrop-blur-md">
    <div class="bg-[var(--bg-card)] text-[var(--text-primary)] rounded-3xl p-5 w-full max-w-sm flex flex-col max-h-[88vh] shadow-2xl relative overflow-y-auto hidden-scrollbar border border-[var(--border-strong)]">
        <!-- Üst Başlık ve Kapat Butonu -->
        <div class="flex justify-between items-center mb-3 border-b border-[var(--border-subtle)] pb-2.5 shrink-0">
            <h3 class="text-lg font-black text-[var(--accent-gold)] flex items-center gap-2">
                <span>${Icons.user}</span>
                <span>Oyuncu Profili</span>
            </h3>
            <button id="close-profile" class="text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-full p-2 text-xs">
                ✕
            </button>
        </div>

        <!-- Profil Üst Kartı -->
        <div class="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-4 mb-3 flex flex-col items-center text-center shadow-inner relative">
            <div id="profile-avatar-display" class="w-16 h-16 rounded-2xl bg-[var(--bg-card)] border-2 border-[var(--border-strong)] flex items-center justify-center text-3xl shadow-sm mb-2 relative group cursor-pointer">
                ${renderAvatarSVG('av_prism', 40)}
            </div>

            <p id="profile-player-title" class="text-[10px] font-black text-[var(--accent-gold)] uppercase tracking-wider block mb-0.5">Çırak</p>

            <div class="flex items-center gap-1.5 mb-2">
                <span id="profile-username" class="font-black text-[var(--text-primary)] text-lg">Oyuncu</span>
                <button id="btn-profile-edit-name" title="Kullanıcı Adını Düzenle" class="text-[var(--text-secondary)] hover:text-[var(--accent-gold)] p-1 rounded-lg hover:bg-[var(--bg-card-hover)] transition-colors">
                    ${Icons.pen}
                </button>
            </div>

            <div class="flex items-center gap-2">
                <span id="profile-level-badge" class="bg-[var(--accent-gold)] text-[var(--text-on-gold)] text-xs font-black px-3 py-1 rounded-full shadow-sm">Seviye 1</span>
                <span id="profile-gold-badge" class="bg-[var(--bg-card)] text-[var(--accent-gold)] text-xs font-black px-3 py-1 rounded-full border border-[var(--border-strong)] shadow-sm">100 Altın</span>
            </div>
        </div>

        <!-- Düello ve Oyun İstatistikleri -->
        <div class="mb-3">
            <h4 class="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-wider mb-2 text-left">Oyun & Düello İstatistikleri</h4>
            <div class="grid grid-cols-2 gap-2 mb-2">
                <div class="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-2.5 text-center">
                    <p class="text-[9px] text-[var(--text-secondary)] font-bold uppercase">Tamamlanan</p>
                    <p id="profile-stat-completed" class="text-base font-black text-[var(--text-primary)]">0</p>
                    <p class="text-[9px] text-[var(--text-secondary)] font-medium">Bulmaca</p>
                </div>
                <div class="bg-[var(--bg-elevated)] border border-[var(--border-strong)] rounded-2xl p-2.5 text-center">
                    <p class="text-[9px] text-[var(--accent-gold)] font-bold uppercase">Düello Karnesi</p>
                    <p id="profile-stat-duel" class="text-xs font-black text-[var(--text-primary)]">0 G / 0 M</p>
                    <div class="flex justify-between items-center text-[9px] font-black text-[var(--accent-cyan)] mt-1 px-0.5">
                        <span id="profile-stat-pvp-mmr">1000 MMR</span>
                        <span id="profile-stat-bot-mmr">1000 YZ</span>
                    </div>
                </div>
            </div>

            <!-- Rekor Süreler Grid -->
            <div class="grid grid-cols-3 gap-1.5">
                <div class="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-2 text-center">
                    <p class="text-[9px] text-emerald-400 font-bold">🟢 Basit</p>
                    <p id="profile-best-basit" class="text-xs font-black text-emerald-200">--:--</p>
                </div>
                <div class="bg-amber-950/40 border border-amber-500/40 rounded-xl p-2 text-center">
                    <p class="text-[9px] text-amber-400 font-bold">🟡 Orta</p>
                    <p id="profile-best-orta" class="text-xs font-black text-amber-200">--:--</p>
                </div>
                <div class="bg-rose-950/40 border border-rose-500/40 rounded-xl p-2 text-center">
                    <p class="text-[9px] text-rose-400 font-bold">🔴 Zor</p>
                    <p id="profile-best-zor" class="text-xs font-black text-rose-200">--:--</p>
                </div>
            </div>
        </div>

        <!-- Rozet Vitrini -->
        <div class="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-3 mb-3 flex flex-col gap-2 shadow-sm">
            <div class="flex justify-between items-center">
                <span class="text-xs font-black text-[var(--text-primary)]">Rozet Vitrini</span>
                <span id="profile-badges-count" class="text-[11px] font-bold text-[var(--accent-gold)]">0 / 10 Rozet</span>
            </div>
            <div id="profile-badges-preview" class="flex gap-2 overflow-x-auto py-1 hidden-scrollbar">
                <!-- Son kazanılan rozetler -->
            </div>
            <button id="btn-profile-open-achievements" class="w-full bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] border border-[var(--border-subtle)] font-bold py-1.5 rounded-xl text-xs transition-colors text-center">
                Tüm Rozetleri Gör ➔
            </button>
        </div>

        <!-- Kendi Profilimiz İçin Kontroller (Avatar Seçimi + Bildirimler) -->
        <div id="profile-own-controls" class="flex flex-col gap-2.5 mb-1">
            <!-- Avatar Seçici -->
            <div class="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-3 text-left">
                <p class="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-wider mb-2">Avatar Seç</p>
                <div id="profile-avatar-selector" class="grid grid-cols-4 gap-2">
                    <!-- 8 Geometrik Avatar Seçeneği -->
                </div>
            </div>

            <!-- Bildirim Toggle -->
            <div class="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-3 flex justify-between items-center">
                <div class="flex items-center gap-2">
                    <span class="text-base text-[var(--accent-gold)]">${Icons.bell}</span>
                    <div class="text-left">
                        <p class="text-xs font-black text-[var(--text-primary)]">Canlı Düello Bildirimleri</p>
                        <p class="text-[10px] text-[var(--text-secondary)] font-medium">Anlık meydan okuma istekleri al</p>
                    </div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="toggle-notifications" class="sr-only peer">
                    <div class="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--accent-gold)]"></div>
                </label>
            </div>
        </div>

        <!-- Başka Bir Oyuncunun Profili İçin Düello İsteği Butonu -->
        <div id="profile-other-controls" class="hidden w-full">
            <button id="btn-challenge-player" class="w-full bg-[var(--accent-gold)] text-[var(--text-on-gold)] font-black py-3 rounded-2xl shadow-md active:scale-95 transition-all text-xs flex items-center justify-center gap-2">
                <span>${Icons.sword}</span>
                <span>Bu Oyuncuya Düello İsteği Gönder</span>
            </button>
        </div>
    </div>
</div>
`;
