# 🟡 iYellowBall (web)

> Roll, freeze, smash the maze. A neon maze game where every level is a new, generated labyrinth.

**🎮 [Play in the browser](https://vidipt89.github.io/iYellowBallWeb/)** · 📱 iOS version: [iYellowBall](https://github.com/VidiPT89/iYellowBall)

iYellowBall is an original maze game built with vanilla HTML, CSS and JavaScript (no frameworks, no build step). Roll the yellow ball through the corridors, collect every gem and keep away from four grumpy cubes. Roll over an ice orb and every cube freezes solid, ready to be smashed.

## 📦 What's Inside

- 🧩 **A new maze every level**: generated from a seed, left/right symmetric, full of loops and with no dead ends, so there is always a way out
- 📅 **Daily maze**: today's date is the seed, so every player (web and iOS) gets the same mazes on the same day, with its own best score
- 🧊 **Four cubes, four habits**:
  - the hunter comes straight for you
  - the cutter races to the next junction you are rolling towards
  - the drifter wanders until you get close, then pounces
  - the guard camps the ice orb nearest to you
- ❄️ **Freeze and smash**: ice orbs freeze every cube; smash them for 100, 200, 400 and 800 points. Smashed cubes rebuild in the central plaza, and the freeze gets shorter every level
- 🌈 Neon pipe walls that change colour each level, gem diamonds and spinning snowflake orbs
- 🎯 Three difficulties (Easy 4 lives, Normal 3, Hard 2) tuning ball and cube speed, freeze time and release timing
- 🏆 Best score per difficulty and per daily maze, saved locally
- 🔊 Synthesised retro sound effects with the Web Audio API (no audio files)
- 🇵🇹 🇬🇧 Portuguese and English, switchable and remembered
- ⌨️ 📱 Arrows/WASD, swipe on the maze or the on-screen pad; short taps are buffered until the next valid turn
- ♿ Translated accessible labels and `prefers-reduced-motion` support

## 🛠️ Tech Stack

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

## 🏗️ Project Structure

```
iYellowBallWeb/
├── index.html       # Page, mode picker, HUD, canvas, overlays
├── style.css        # Theme, layout, responsive rules
├── script.js        # Maze generator, movement, cube AI, freeze, i18n, sound, rendering
├── tests/
│   ├── gameplay.cjs # Engine checks in Node (no dependencies)
│   └── browser.cjs  # Optional Playwright integration suite
├── LICENSE
└── README.md
```

## ⚙️ How the maze is generated

```
1. Randomised depth-first carve on the left half of a 27×27 grid, mirrored to the right
2. A few extra openings so areas connect by more than one route
3. A 5×5 central plaza (cube spawn) and a wrap-around side tunnel
4. Every dead end is knocked through into a loop
5. Gems on every corridor tile, the start tile cleared, four ice orbs near the corners
```

The generator uses a 64-bit SplitMix RNG with the same draws as the Swift version, so a seed produces exactly the same maze on the web and on iOS (checked by the test suite).

## 🚀 How to Run

```bash
git clone https://github.com/VidiPT89/iYellowBallWeb.git
cd iYellowBallWeb
open index.html          # or serve it: python3 -m http.server
```

## 🧪 Tests

```bash
node tests/gameplay.cjs            # 20 engine checks, no dependencies
PARITY=1 node tests/gameplay.cjs   # also compares mazes with the Swift generator (needs swiftc and the iOS repo next to this one)
```

Optional browser tests need Playwright: `node tests/browser.cjs`, with `PLAYWRIGHT_MODULE` pointing at an installation and optionally `CHROMIUM_PATH` at a browser. They cover desktop and phone layouts, start/pause/menu, difficulty and daily mode, language, swipe steering and missing storage/audio.

---

Developed by **David Arsénio Martins** · [ividi.dev](https://ividi.dev/)
