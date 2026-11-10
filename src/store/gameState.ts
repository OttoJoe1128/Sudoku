export interface GameState {
  gold: number;
  currentLevel: number;
  bestTimes: {
    basit: number;
    orta: number;
    zor: number;
  };
  totalErrors: number;
}

const defaultState: GameState = {
  gold: 0,
  currentLevel: 1,
  bestTimes: { basit: 0, orta: 0, zor: 0 },
  totalErrors: 0,
};

let state: GameState = { ...defaultState };

export const getGameState = (): GameState => ({ ...state });

export const updateGameState = (newState: Partial<GameState>) => {
  state = { ...state, ...newState };
};
