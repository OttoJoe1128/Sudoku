export const usernameModalTemplate = `
<div id="username-modal" class="absolute inset-0 bg-slate-900/90 hidden flex-col items-center justify-center z-[90] p-4 backdrop-blur-md">
    <div class="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl">
        <h3 class="text-2xl font-black text-slate-800 mb-2">Aramıza Hoş Geldin!</h3>
        <input type="text" id="username-input" class="w-full bg-slate-100 border-2 border-slate-200 rounded-xl px-4 py-4 mb-4 text-center text-lg" placeholder="Oyuncu Adın..." maxlength="15">
        <button id="save-username" class="w-full bg-indigo-600 text-white font-black py-4 rounded-xl">Kaydet ve Başla!</button>
    </div>
</div>
`;
