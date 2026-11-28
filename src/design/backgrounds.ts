export function getAmbientBackgroundHTML(): string {
  return `
    <div id="ambient-bg-layer" class="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-60 transition-opacity duration-700">
      <!-- Floating Spatial Ambient Light Orbs -->
      <div class="absolute -top-40 -left-40 w-[420px] h-[420px] rounded-full bg-[radial-gradient(circle,rgba(200,155,60,0.22)_0%,transparent_70%)] blur-3xl floating-orb"></div>
      <div class="absolute -bottom-40 -right-40 w-[420px] h-[420px] rounded-full bg-[radial-gradient(circle,rgba(10,200,185,0.18)_0%,transparent_70%)] blur-3xl floating-orb" style="animation-delay: -3s;"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-[radial-gradient(circle,rgba(147,51,234,0.12)_0%,transparent_70%)] blur-3xl floating-orb" style="animation-delay: -1.5s;"></div>

      <!-- Abstract Mystic Rune Constellation SVG Overlay -->
      <svg class="w-full h-full opacity-15" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="spatialRuneMatrix" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="currentColor" stroke-width="1" class="text-[var(--border-subtle)]"/>
            <circle cx="40" cy="40" r="2" class="fill-[var(--accent-gold)]"/>
            <path d="M 40 25 L 55 40 L 40 55 L 25 40 Z" fill="none" stroke="currentColor" stroke-width="0.75" class="text-[var(--accent-gold)] opacity-40"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#spatialRuneMatrix)"/>
      </svg>
    </div>
  `;
}
