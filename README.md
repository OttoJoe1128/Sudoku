
# SudokuMap 🧩

A modern, mobile-first Sudoku Web Application (PWA) built with Vanilla JavaScript and Tailwind CSS. SudokuMap offers a 1000-level progressive journey, custom difficulty modes, time-attack challenges, and a real-time global leaderboard powered by Firebase.

[![Play Live](https://img.shields.io/badge/Play-Live_On_Vercel-blue?style=for-the-badge&logo=vercel)](https://sudoku-three-topaz.vercel.app/)

## ✨ Key Features

*   🗺️ **1000-Level Campaign:** A progressive journey map from Level 1 up to Level 1000 with increasing difficulties.
*   🎯 **Custom Game Modes:** Generate unique 'Easy', 'Medium', or 'Hard' puzzles on the fly.
*   ⏱️ **Time Attack & Normal Modes:** Play casually without a timer, or race against the clock (10, 15, or 25-minute limits).
*   🏆 **Real-Time Global Leaderboard:** Firebase Firestore integration allows players to compete globally. Filter rankings by Total Gold, Max Level, or Personal Best Times.
*   💰 **In-Game Economy:** Earn gold by solving puzzles. Spend gold to use hints. Be careful: entering wrong numbers deducts 5 gold!
*   📊 **Detailed Statistics:** End-game report cards showing elapsed time, error counts, and "New Record" alerts for personal bests.
*   📱 **PWA Ready & Native Feel:** Installable on Android and iOS. Features a custom Numpad, CSS shake animations for errors, and haptic feedback (vibration) for a true native app experience.
*   💾 **Smart Auto-Save:** Safely close the app anytime. Your exact board state, timer, and errors are saved offline and will resume flawlessly.
*   🧠 **Algorithmic Puzzle Generation:** Puzzles are not pre-baked. The app uses a backtracking algorithm to generate logically solvable Sudokus with a unique solution every time.

## 🛠️ Tech Stack

*   **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) (via CDN)
*   **Database / Backend:** [Firebase Firestore](https://firebase.google.com/docs/firestore) (Web SDK v10)
*   **Effects:** [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
*   **Deployment:** [Vercel](https://vercel.com/)
*   **Packaging:** PWA to APK/AAB via [PWABuilder](https://www.pwabuilder.com/)

## 🚀 Getting Started

Since this is a client-side vanilla web application, no build tools (like Webpack or Vite) are strictly required.

### 1. Clone the Repository
```bash
git clone [https://github.com/OttoJoe1128/Sudoku.git](https://github.com/OttoJoe1128/Sudoku.git)
cd Sudoku

```

### 2. Run Locally

You can simply open `index.html` in your browser, or use an extension like **Live Server** in VS Code for hot-reloading:

```bash
# If you have python installed, you can also run a quick server:
python -m http.server 8000

```

Then navigate to `http://localhost:8000`.

### 3. Firebase Configuration (Optional for Forks)

If you fork this project and want to use your own database:

1. Create a project on [Firebase Console](https://console.firebase.google.com/).
2. Enable **Firestore Database** in "Test Mode".
3. Get your Web App Firebase config.
4. Replace the `firebaseConfig` object inside `index.html` with your own keys.

## 🕹️ How to Play

1. **Enter a Username:** Upon first launch, pick a username to join the leaderboard.
2. **Pick a Mode:** Choose the 1000-Level Journey or a Custom Game.
3. **Fill the Board:** Select an empty cell and use the bottom Numpad to enter a number (1-9).
4. **Use Hints:** Stuck? Use the "💡 Hint" button (costs 20 Gold).
5. **Win & Climb:** Complete the board with 0 errors to earn Gold and climb the global ranks!

## 📜 License

This project is open-source and available under the [MIT License](https://www.google.com/search?q=LICENSE).

---

*Developed by [Osman Can](https://www.google.com/search?q=https://github.com/OttoJoe1128).*

```

```
