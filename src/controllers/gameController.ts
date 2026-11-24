export function refreshGameLanguageUI(): void {
  // Canlı dil değişikliklerinde oyun içi metinlerin güncellenmesi
}

export function getGameRuntimeState(): any {
  return (window as any).gameRuntimeState || {
    isNotesMode: false,
    isMatchMode: false,
    userBoard: Array(9).fill(0).map(() => Array(9).fill(0)),
    currentSolution: Array(9).fill(0).map(() => Array(9).fill(0)),
    boardMechanics: null
  };
}
