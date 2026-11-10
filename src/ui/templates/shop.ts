export const shopTemplate = `
<div id="view-shop" class="absolute inset-0 bg-slate-900/60 hidden flex-col items-center justify-center z-[60] p-4 backdrop-blur-sm">
    <div class="bg-white rounded-3xl p-5 w-full max-w-sm flex flex-col h-[80vh] shadow-2xl relative">
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-2xl font-black text-slate-800">🛍️ Mağaza</h3>
            <button id="close-shop" class="text-slate-400 bg-slate-100 rounded-full p-2">✕</button>
        </div>
        <div id="shop-list" class="flex-1 overflow-y-auto space-y-3">
            <div class="p-4 border rounded-xl flex justify-between items-center">
                <span>Karanlık Tema</span>
                <button class="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold">200 🪙</button>
            </div>
        </div>
    </div>
</div>
`;
