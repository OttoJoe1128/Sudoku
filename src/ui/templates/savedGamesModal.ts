export const savedGamesModalTemplate = `
<div id="view-saved-games" class="absolute inset-0 bg-slate-900/60 hidden flex-col items-center justify-center z-[75] p-4 backdrop-blur-sm">
    <div class="bg-white rounded-3xl p-5 w-full max-w-sm flex flex-col max-h-[75vh] shadow-2xl relative border border-slate-100">
        <div class="flex justify-between items-center mb-3 pb-2 border-b border-slate-100 shrink-0">
            <h3 class="text-lg font-black text-slate-800 flex items-center gap-2">
                🕹️ Aktif Oyunlarım
            </h3>
            <button id="close-saved-games" class="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full p-2 text-xs font-bold transition-colors">
                ✕
            </button>
        </div>

        <div id="saved-games-list" class="flex-1 overflow-y-auto space-y-2 pr-0.5 hidden-scrollbar">
            <div class="text-center text-slate-400 py-10 font-bold">Kayıtlı aktif oyununuz yok.</div>
        </div>
    </div>
</div>
`;
