# Venga · Swap

Landing page for Swap, built from the Figma section "Swap" (node 10553:75582) in the "🎨 Website" file, with the working swap calculator from `swap-calculator.html` in the hero.

Plain HTML, CSS and a little JavaScript: no build step or dependencies.

## Files
- `index.html`: markup and copy (English)
- `styles.css`: all styles, the breakpoints and the motion states at the bottom
- `swap.js`: the swap calculator (coin list, prices, maths, dropdowns, flip)
- `main.js`: nav, scroll reveals, the steps carousel, the FAQ and the asset chips
- `assets/`: SVGs and images exported from Figma (hero photo compressed to JPEG, 3D coins resized to 2x)
- `assets/coins/`: coin icons from the "Swap with any of these assets" chips, one SVG per ticker (also used by the calculator)
- `fonts/`: Labil Grotesk (excluded from git by `.gitignore`, see below)

## Swap calculator
- Type in either field: the other side updates. Click the coin (or use the arrow keys) to open the list; picking the coin from the other side switches them. The arrows in the middle flip the pair and keep the amount you typed.
- **Prices are static reference prices** set in `COINS` at the top of `swap.js`, with `LAST_UPDATED` for the note. BTC and ETH match the Figma mock; the rest are placeholders. Connect a real price feed before going live (check the data source with Legal).
- The coin list matches the coins on the page (the asset chips) plus LINK, which the copy mentions. Clicking a chip sets it as "You receive" and scrolls up to the calculator.
- The note says the amount is an estimate, fees aren't included, and the final price is confirmed in the app.

## Before going live
- `DOWNLOAD_URL` at the top of `main.js` sets every Download button (currently `#`). Nav, footer and "See all our available coins" links are `#` placeholders.
- Steps 2 and 3 in the carousel are draft copy (`STEPS` in `main.js`); Figma only has step 1. The card illustration stays the same for each step.
- FAQ answers are drafts (Figma only has the questions).
- Copy changes from Figma, for MiCA wording and typos: see the hand-off message. The Lokalise keys are in `../swap_v1.3_keys.md`.

## Breakpoints
| Range | Figma frame |
|---|---|
| 1280px and up | Desktop 1440 |
| 1025–1279px | 1026 (hero stacks, calculator under the copy) |
| 768–1024px | Tablet |
| below 768px | Mobile (calculator stacks and turns light) |

## Run locally

    python3 -m http.server 3500

then open http://localhost:3500.

## Fonts
Labil Grotesk is a licensed typeface, so `fonts/` is ignored by git. Without it the page falls back to the system font. Copy the four `.otf` files into `fonts/` locally (they are in the other Venga projects).
