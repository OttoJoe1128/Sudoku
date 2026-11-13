export const usernameModalTemplate = `
<div id="username-modal" class="absolute inset-0 bg-slate-950/85 hidden flex-col items-center justify-center z-[90] p-4 backdrop-blur-md">
    <div class="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl relative border border-slate-100 animate-in fade-in zoom-in duration-200">
        <button id="close-username-modal" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full text-xs font-bold hidden transition-colors">✕</button>

        <!-- 3x3 Minimalist Sudoku Logosu -->
        <div class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl p-2.5 mx-auto mb-4 shadow-lg shadow-indigo-200 flex flex-col justify-between">
            <div class="grid grid-cols-3 gap-1 h-full w-full">
                <div class="bg-white/90 rounded-sm"></div>
                <div class="bg-white/40 rounded-sm"></div>
                <div class="bg-white/90 rounded-sm"></div>
                <div class="bg-white/40 rounded-sm"></div>
                <div class="bg-white/100 rounded-sm flex items-center justify-center text-[9px] font-black text-indigo-700">9</div>
                <div class="bg-white/40 rounded-sm"></div>
                <div class="bg-white/90 rounded-sm"></div>
                <div class="bg-white/40 rounded-sm"></div>
                <div class="bg-white/90 rounded-sm"></div>
            </div>
        </div>

        <h3 class="text-2xl font-black text-slate-800 mb-1">SudokuMap'e Hoş Geldin!</h3>
        <p class="text-xs text-slate-500 mb-5 font-medium leading-relaxed">Oyuncu profilini oluştur veya eski kullanıcı adını girerek tüm ilerlemeni anında geri getir.</p>

        <div class="relative w-full mb-4">
            <input type="text" id="username-input" class="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-4 text-center text-lg font-black text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-inner" placeholder="Kullanıcı adını yaz..." maxlength="15">
        </div>

        <button id="save-username" class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-200 active:scale-95 transition-all text-sm tracking-wide">
            Kaydet ve Maceraya Başla ➔
        </button>
    </div>
</div>
`;
