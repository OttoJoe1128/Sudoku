export const mapTemplate = `
<div id="view-map" class="flex-1 overflow-y-auto hidden-scrollbar relative bg-slate-50">
    <div class="absolute inset-0 opacity-[0.15] bg-[radial-gradient(circle_at_center,_#334155_2px,_transparent_2px)] bg-[size:24px_24px] pointer-events-none"></div>
    <div class="relative min-h-full py-16 flex flex-col-reverse justify-start items-center">
        <div class="absolute top-16 bottom-16 left-1/2 -ml-[6px] w-[12px] bg-indigo-200/50 rounded-full z-0"></div>
        <button id="btn-reset-journey" class="z-10 mt-12 mb-4 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors bg-white px-3 py-1 rounded-full shadow-sm border border-slate-200">İlerlemeyi Sıfırla</button>
        <div id="map-nodes" class="relative z-10 flex flex-col-reverse w-full gap-6"></div>
    </div>
</div>
`;
