export const customModeTemplate = `
<div id="view-custom" class="flex-1 flex flex-col items-center justify-center p-6 gap-4 relative bg-slate-50">
    <div class="absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle_at_center,_#334155_2px,_transparent_2px)] bg-[size:24px_24px] pointer-events-none"></div>
    <h2 class="text-xl font-bold text-slate-600 mb-2 z-10">Bir Zorluk Seçin</h2>
    <button id="btn-diff-basit" class="tap-effect z-10 w-full bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 flex justify-between items-center shadow-sm">
        <span class="text-lg font-black text-emerald-700">Basit</span><span class="bg-emerald-200 text-emerald-800 text-xs font-bold px-2 py-1 rounded-md">🪙 +5 Altın</span>
    </button>
    <button id="btn-diff-orta" class="tap-effect z-10 w-full bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 flex justify-between items-center shadow-sm">
        <span class="text-lg font-black text-amber-700">Orta</span><span class="bg-amber-200 text-amber-800 text-xs font-bold px-2 py-1 rounded-md">🪙 +10 Altın</span>
    </button>
    <button id="btn-diff-zor" class="tap-effect z-10 w-full bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 flex justify-between items-center shadow-sm">
        <span class="text-lg font-black text-rose-700">Zor</span><span class="bg-rose-200 text-rose-800 text-xs font-bold px-2 py-1 rounded-md">🪙 +20 Altın</span>
    </button>
</div>
`;
