import { Icons } from '../../design/icons';

export const leaderboardTemplate = `
<div id="view-leaderboard" class="absolute inset-0 bg-slate-900/80 hidden flex-col items-center justify-center z-[60] p-4 backdrop-blur-md">
    <div class="bg-[var(--bg-card)] text-[var(--text-primary)] rounded-3xl p-5 w-full max-w-sm flex flex-col h-[82vh] shadow-2xl relative border border-[var(--border-strong)]">
        <div class="flex justify-between items-center mb-3">
            <div>
                <h3 class="text-xl font-black text-[var(--accent-gold)] flex items-center gap-2">
                    <span>${Icons.trophy}</span>
                    <span>Sıralama</span>
                </h3>
                <p class="text-[11px] text-[var(--text-secondary)] font-bold mt-0.5">
                    Küresel Oyuncu Sıralaması
                </p>
            </div>
            <div class="flex items-center gap-1.5">
                <button id="refresh-leaderboard" title="Yenile" class="text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-full p-2 text-xs font-bold transition-colors">
                    ↻
                </button>
                <button id="close-leaderboard" class="text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-full p-2 transition-colors">
                    ✕
                </button>
            </div>
        </div>

        <!-- Sekmeler: Genel Sıralama / En Hızlı Çözenler -->
        <div class="flex gap-1.5 p-1 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl mb-2.5">
            <button id="btn-tab-gold" class="flex-1 py-1.5 px-2 rounded-lg font-black text-xs transition-all bg-[var(--bg-card)] text-[var(--accent-gold)] border border-[var(--border-strong)] shadow-sm">
                Genel Sıralama
            </button>
            <button id="btn-tab-speed" class="flex-1 py-1.5 px-2 rounded-lg font-bold text-xs transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                En Hızlılar
            </button>
        </div>

        <!-- Genel Sıralama Filtreleri: Seviye, Altın, PvP MMR, YZ Puanı -->
        <div id="general-sort-filters" class="grid grid-cols-4 gap-1 mb-2.5">
            <button id="btn-sort-level" class="py-1.5 text-[10px] font-black rounded-xl bg-[var(--accent-gold)] text-[var(--text-on-gold)] shadow-sm flex items-center justify-center gap-1">
                <span>${Icons.target}</span> Seviye
            </button>
            <button id="btn-sort-gold" class="py-1.5 text-[10px] font-bold rounded-xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] flex items-center justify-center gap-1">
                <span>${Icons.coin}</span> Altın
            </button>
            <button id="btn-sort-pvp-mmr" class="py-1.5 text-[10px] font-bold rounded-xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] flex items-center justify-center gap-1">
                <span>${Icons.sword}</span> PvP
            </button>
            <button id="btn-sort-bot-mmr" class="py-1.5 text-[10px] font-bold rounded-xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] flex items-center justify-center gap-1">
                <span>${Icons.bot}</span> YZ
            </button>
        </div>

        <!-- En Hızlılar İçin Zorluk Filtresi -->
        <div id="speed-diff-filters" class="hidden gap-1.5 mb-2.5">
            <button data-diff="all" class="speed-filter-btn flex-1 py-1 text-[11px] font-black rounded-lg bg-[var(--accent-gold)] text-[var(--text-on-gold)] shadow-sm">Tümü</button>
            <button data-diff="basit" class="speed-filter-btn flex-1 py-1 text-[11px] font-bold rounded-lg bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]">Basit</button>
            <button data-diff="orta" class="speed-filter-btn flex-1 py-1 text-[11px] font-bold rounded-lg bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]">Orta</button>
            <button data-diff="zor" class="speed-filter-btn flex-1 py-1 text-[11px] font-bold rounded-lg bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]">Zor</button>
        </div>

        <div id="leaderboard-header-bar" class="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 border-b border-[var(--border-subtle)] mb-2 flex justify-between items-center">
            <span id="lb-header-left">Sıra & Oyuncu</span>
            <span id="lb-header-right">Seviye</span>
        </div>
        <div id="leaderboard-list" class="flex-1 overflow-y-auto space-y-2 pr-1 hidden-scrollbar">
            <div class="text-center text-[var(--text-secondary)] py-10 font-bold animate-pulse">Liderler yükleniyor...</div>
        </div>
    </div>
</div>
`;
