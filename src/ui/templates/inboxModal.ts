export const inboxModalTemplate = `
<div id="view-inbox" class="absolute inset-0 bg-slate-900/60 hidden flex-col items-center justify-center z-[75] p-4 backdrop-blur-sm">
    <div class="bg-white rounded-3xl p-5 w-full max-w-sm flex flex-col h-[70vh] shadow-2xl relative border border-slate-100">
        <div class="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
            <h3 class="text-lg font-black text-slate-800 flex items-center gap-2">
                <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                Düello Gelen Kutusu
            </h3>
            <button id="close-inbox" class="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full p-2 text-xs font-bold transition-colors">
                ✕
            </button>
        </div>

        <div id="inbox-list" class="flex-1 overflow-y-auto space-y-2 pr-1 hidden-scrollbar">
            <div class="text-center text-slate-400 py-10 font-bold">Gelen davet bulunmuyor.</div>
        </div>
    </div>
</div>
`;
