export const UserManager = {
  saveUser(username: string) {
    localStorage.setItem('sudoku_username', username);
  },
  getUsername() {
    return localStorage.getItem('sudoku_username');
  },
  getCurrentLevel() {
    return parseInt(localStorage.getItem('sudoku_level') || '1');
  }
};
