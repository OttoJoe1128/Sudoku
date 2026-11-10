export class SudokuGen {
  static getStartLevelForDifficulty(diff: 'basit' | 'orta' | 'zor'): number {
    if (diff === 'basit') return 1;
    if (diff === 'orta') return 301;
    return 701;
  }

  static generate(difficulty: string) {
    let board = Array.from({ length: 9 }, () => Array(9).fill(0));
    this.fillDiagonal(board);
    this.solve(board);
    let solution = board.map(row => [...row]);
    
    let targetRemoves = difficulty === 'basit' ? 30 : difficulty === 'orta' ? 45 : 55;
    let positions = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        positions.push({ r, c });
      }
    }
    
    let removes = 0;
    while (removes < targetRemoves) {
      let idx = Math.floor(Math.random() * positions.length);
      let { r, c } = positions[idx];
      let backup = board[r][c];
      board[r][c] = 0;
      
      let boardCopy = board.map(row => [...row]);
      if (this.countSolutions(boardCopy) !== 1) {
        board[r][c] = backup;
      } else {
        removes++;
      }
      positions.splice(idx, 1);
    }
    return { puzzle: board, solution: solution };
  }

  private static countSolutions(board: number[][], count: number = 0): number {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (this.isSafe(board, r, c, num)) {
              board[r][c] = num;
              count = this.countSolutions(board, count);
              board[r][c] = 0;
            }
          }
          return count;
        }
      }
    }
    return count + 1;
  }

  private static fillDiagonal(board: number[][]) {
    for (let i = 0; i < 9; i += 3) this.fillBox(board, i, i);
  }

  private static fillBox(board: number[][], row: number, col: number) {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        let num;
        do { num = Math.floor(Math.random() * 9) + 1; } while (!this.isSafeInBox(board, row, col, num));
        board[row + i][col + j] = num;
      }
    }
  }

  private static isSafeInBox(board: number[][], row: number, col: number, num: number) {
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        if (board[row + i][col + j] === num) return false;
    return true;
  }

  private static solve(board: number[][]): boolean {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (this.isSafe(board, r, c, num)) {
              board[r][c] = num;
              if (this.solve(board)) return true;
              board[r][c] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  private static isSafe(board: number[][], row: number, col: number, num: number) {
    for (let i = 0; i < 9; i++) if (board[row][i] === num || board[i][col] === num) return false;
    let br = Math.floor(row / 3) * 3, bc = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        if (board[br + i][bc + j] === num) return false;
    return true;
  }
}
