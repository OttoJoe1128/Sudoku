export function getAmbientBackgroundHTML(): string {
  return `
    <div id="ambient-bg-layer" class="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-40 transition-opacity duration-500">
      <!-- Soft Radial Light Glow -->
      <div class="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[radial-gradient(circle,rgba(200,155,60,0.15)_0%,transparent_70%)]"></div>
      <div class="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[radial-gradient(circle,rgba(10,200,185,0.12)_0%,transparent_70%)]"></div>

      <!-- Abstract Geometric Prism Grid Overlay -->
      <svg class="w-full h-full opacity-10" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="matrixPattern" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" stroke-width="1" class="text-[var(--border-subtle)]"/>
            <circle cx="30" cy="30" r="1.5" class="fill-[var(--accent-gold)]"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#matrixPattern)"/>
      </svg>
    </div>
  `;
}
