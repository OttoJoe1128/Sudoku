export const usernameModalTemplate = `
<div id="username-modal" class="absolute inset-0 bg-slate-900/90 hidden flex-col items-center justify-center z-[90] p-4 backdrop-blur-md">
    <div class="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl relative">
        <button id="close-username-modal" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 text-sm hidden">✕</button>
        <div class="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">👤</div>
        <h3 class="text-2xl font-black text-slate-800 mb-1">Oyuncu Adı</h3>
        <p class="text-xs text-slate-500 mb-4">Eski oyuncuysanız kullanıcı adınızı girerek oyununuzu geri getirebilirsiniz.</p>
        <input type="text" id="username-input" class="w-full bg-slate-100 border-2 border-slate-200 rounded-xl px-4 py-3.5 mb-4 text-center text-lg font-bold text-slate-800 focus:outline-none focus:border-indigo-500" placeholder="Kullanıcı adınızı giriniz..." maxlength="15">
        <button id="save-username" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl shadow-lg active:scale-95 transition-all">Kaydet ve Başla!</button>
    </div>
</div>
`;
