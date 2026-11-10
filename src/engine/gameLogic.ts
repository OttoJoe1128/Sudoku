import { updateGameState, getGameState } from '../store/gameState';
import { UIManager } from '../ui/uiManager';
import { SudokuGen } from './sudoku';

export const GameLogic = {
  initGame(difficulty: 'basit' | 'orta' | 'zor') {
    const puzzle = SudokuGen.generate(difficulty);
    updateGameState({ currentLevel: getGameState().currentLevel + 1 });
    
    console.log("Oyun başladı, Puzzle:", puzzle);
    UIManager.updateUI(getGameState().currentLevel, getGameState().gold, "Oyuncu");
    UIManager.renderBoard(puzzle.puzzle);
  }
};
