import { updateGameState, getGameState } from '../store/gameState';
import { UIManager } from '../ui';
import { SudokuGen } from './sudoku';

export const GameLogic = {
  initGame(difficulty: 'basit' | 'orta' | 'zor') {
    const puzzle = SudokuGen.generate(difficulty);
    updateGameState({ currentLevel: getGameState().currentLevel + 1 });
    
    UIManager.updateHeaderGold(getGameState().gold);
    UIManager.renderBoard(puzzle.puzzle, () => {}, -1, -1, puzzle.puzzle);
  }
};
