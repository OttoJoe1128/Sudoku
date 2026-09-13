# SudokuMap 🧩

A highly competitive, mobile-first Sudoku Progressive Web Application (PWA) built with Vanilla JavaScript and Tailwind CSS. SudokuMap goes beyond a classic puzzle game by offering a robust in-game economy, time-attack modes, algorithmic puzzle generation, and a highly secure real-time global leaderboard powered by Firebase.

[![Play Live](https://img.shields.io/badge/Play-Live_On_Vercel-blue?style=for-the-badge&logo=vercel)](https://sudoku-three-topaz.vercel.app/)

## ✨ Key Features & Gameplay

*   🗺️ **1000-Level Campaign:** A massive progressive journey map starting from Level 1 up to Level 1000, seamlessly scaling in difficulty.
*   ⏱️ **Dynamic Game Modes:** Play custom generated boards in 'Normal Mode' or challenge yourself in 'Time Attack Mode' with strict countdown timers (10, 15, or 25 minutes).
*   💰 **In-Game Economy & Penalties:** Earn Gold by conquering levels. Spend Gold to use hints. Beware: entering an incorrect number deducts 5 Gold and triggers a screen shake!
*   📊 **End-Game Report Cards & PB:** Detailed post-game statistics showing total time elapsed, total errors made, and "New Personal Best" alerts.
*   🏆 **Secure Global Leaderboard:** Powered by Firebase Anonymous Auth and Firestore. Fully cheat-proof (users can only write to their own UID document). Players can filter the global ranks by **Total Gold**, **Max Level**, or **Best Clear Times** per difficulty.
*   🔊 **Native-like Haptics & 8-Bit Audio Engine:** Utilizes the Web Audio API to synthesize lightweight 8-bit sound effects (taps, errors, win chimes) dynamically without external `.mp3` files. Includes vibration feedback (toggleable via Settings).
*   🚀 **Smart Auto-Save & PWA Auto-Update:** Close the app anytime; your exact board state, timer, and errors are saved offline. Uses an advanced `Service Worker` strategy to silently push new updates to clients, combined with a "Failsafe" mechanism that wipes corrupted local states to prevent white-screens.
*   🤝 **Social Web Share:** Native sharing integration allows players to boast about their Personal Bests directly to WhatsApp, X, or Instagram.
*   📺 **Ad Monetization Ready:** Includes a simulated "Watch Ad for Gold" loop, structurally ready for Google AdMob integration.

## 🛠️ Tech Stack & Architecture

*   **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) (via CDN)
*   **Database & Auth:** [Firebase SDK v10](https://firebase.google.com/docs/web/setup) (Firestore + Anonymous Authentication)
*   **Audio/Visual Effects:** Web Audio API, [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
*   **Deployment & CI/CD:** [Vercel](https://vercel.com/) 

## 🚀 Getting Started

No heavy build tools required! To run this project locally:

### 1. Clone the Repository
```bash
git clone [https://github.com/OttoJoe1128/Sudoku.git](https://github.com/OttoJoe1128/Sudoku.git)
cd Sudoku
