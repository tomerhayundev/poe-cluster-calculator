# PoE Cluster Jewel Calculator

A modern Path of Exile Cluster Jewel Calculator that helps you find the cheapest 8-passive Large Cluster Jewels with the notables you want.

**Live:** [cluster.tichoh.com](https://cluster.tichoh.com) | [poe-cluster-calculator.pages.dev](https://poe-cluster-calculator.pages.dev)

## Features

- **Smart Notable Detection** — Select 1 or 2 notables and the calculator adapts automatically
- **Single Notable Mode** — Pick one notable and choose if you want it on the side (pos 1/3) or middle (pos 2). Finds all valid companion pairings based on sort-order logic
- **Two Notable Mode** — Select two desired notables for positions 1 & 3, find all valid position 2 (middle) notables
- **Master Trade Link** — One-click search that finds the cheapest jewel across ALL valid combinations
- **Breakdown View** — Expandable detailed view per enchant type or companion notable
- **Trade Templates** — Quick links for base jewel shopping

## How It Works

Cluster jewels with 3 notables place them at positions 1, 2, and 3 based on an internal sort order (`Stat._rid`). Position 1 and 3 are on the sides (desired), position 2 is in the middle (undesired). The calculator uses this sort order to determine which notable combinations are valid and generates PoE trade search URLs.

## Tech Stack

- React + Vite
- Deployed on Cloudflare Pages via GitHub Actions
- Game data sourced from [TheodoreJBieber/PoEClusterJewelCalculator](https://github.com/TheodoreJBieber/PoEClusterJewelCalculator)

## Development

```bash
npm install
npm run dev
```

## Deployment

Pushes to `master` automatically deploy to Cloudflare Pages via GitHub Actions.

## Credits

- Original calculation logic by [TheodoreJBieber](https://github.com/TheodoreJBieber/PoEClusterJewelCalculator)
- No affiliation with Grinding Gear Games
