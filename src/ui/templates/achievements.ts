export const achievementsTemplate = `
<div id="view-achievements" class="absolute inset-0 bg-slate-900/60 hidden flex-col items-center justify-center z-[60] p-4 backdrop-blur-sm">
    <div class="bg-white rounded-3xl p-5 w-full max-w-sm flex flex-col h-[82vh] shadow-2xl relative">
        <div class="flex justify-between items-center mb-3">
            <div>
                <h3 class="text-2xl font-black text-slate-800 flex items-center gap-2">
                    🎖️ Başarımlar & Rozetler
                </h3>
                <p class="text-xs text-indigo-600 font-semibold flex items-center gap-1 mt-0.5">
                    Özel rozetleri aç, ekstra altın kazan!
                </p>
            </div>
            <button id="close-achievements" class="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors">
                ✕
            </button>
        </div>

        <!-- Rozet İlerleme Özeti -->
        <div class="bg-indigo-50 border border-indigo-100 rounded-2xl p-3.5 mb-3 flex items-center justify-between">
            <div>
                <span class="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Kazanılan Rozetler</span>
                <span id="badges-unlocked-count" class="text-lg font-black text-indigo-700">0 / 10</span>
            </div>
            <div class="w-32 bg-indigo-200/50 h-2.5 rounded-full overflow-hidden">
                <div id="badges-progress-bar" class="bg-indigo-600 h-full rounded-full transition-all duration-500" style="width: 0%"></div>
            </div>
        </div>

        <div id="achievements-list" class="flex-1 overflow-y-auto space-y-2.5 pr-1">
            <!-- Rozet kartları dinamik olarak render edilecek -->
        </div>
    </div>
</div>
`;
