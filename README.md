# Leonida Legend — GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/ahmadzeenok/makefun-gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/ahmadzeenok/makefun-gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of **Grand Theft Auto VI** (released 19 November 2026, PS5 and Xbox Series X|S). Every trophy is single-player and offline — there are no online trophies.

## What it is

- **Checklist of all 55 trophies** with the official name, description and grade for each, plus a full guide in original words: what to do, where, how, and when it can be missed. Each guide names its sources.
- **Tracker:** tick a trophy and your progress is saved in the browser (localStorage). Export your progress to a JSON file and import it back.
- **Filters:** by grade (Platinum / Gold / Silver / Bronze), by kind (story, collectible, activity, challenge, exploration, misc), by earned / unearned, a missable-only filter, and a text search box.
- **Spoiler setting:** a toggle hides the names and descriptions of story trophies until they are earned (shown as "Hidden story trophy").
- **Roadmap view:** six ordered stages to the Platinum — story first, then stranger missions, activities and challenges, collectibles and exploration, robberies and money, then 100% cleanup.
- **Missables view:** flags the one possibly missable trophy and the save discipline that protects it.
- **Progress summary:** X of 55 earned, percent complete, and counts by grade.

## The list at a glance

55 trophies: **1 Platinum, 2 Gold, 6 Silver, 46 Bronze**; **28 hidden** until earned; all offline. PowerPyx rates the Platinum **4/10 difficulty, about 200 hours**, with **A Long Road** (100% completion) the hardest trophy. The only possibly missable trophy is **Positive Mental Attitude** (meditate at every spot): Lucia's balcony meditation in Chapter 1 disappears after that chapter, and there is no mission replay and no New Game Plus, so keep a manual save at the start of every chapter and one before the final mission. Cheats disable trophies. There are no difficulty trophies and no mission medals.

## How to run it

No build step, no network needed. Every file the app loads lives under `app/`.

```sh
node serve.ts
```

Then open <http://localhost:8080> in desktop Chrome. Or serve `app/` with any static HTTP server.

To hand the entry in (the make.fun dossier build):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Layout

- `main.ts` — copies `app/` and `screenshots/` to the output directory and writes `dossier.json`.
- `serve.ts` — tiny static server for local development.
- `vendor/makefun-frontend.ts` — the make.fun dossier library, unchanged.
- `app/index.html`, `app/app.js`, `app/style.css` — the guide app (static, offline).
- `app/data/trophies.json` — the 55 trophies: official name, description and grade, plus kind, missable and hidden flags, the original guide text, and its sources.
- `screenshots/` — four real renders of the app (see `shots.json`).
- `shots.json` — describes the screenshots.

## Sources

The trophy names, descriptions and grades are the official PS5 list as published by PlayStation (frozen 2026-11-18). The guides draw on, and cite per trophy:

- Exophase — https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/
- PSNProfiles — https://psnprofiles.com/trophies/43531-grand-theft-auto-vi
- PowerPyx — https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/
- GTABase — https://www.gtabase.com/articles/gta-6/gta-6-achievements-trophies-list-ps5-xbox-series
- Output Lag — https://outputlag.com/guides/gta-6-trophy-list/
- GTA Zone — https://gta-zone.com/news/gta-6-trophies-achievements/
- PlanetGTA6 — https://www.planetgta6.com/en/gta-6-trophies/

Where a detail is not yet confirmed in public guides (exact meditation-spot and card locations, and the exact triggers of the vaguest trophies), the guide says so plainly instead of inventing a location or a number.

## Originality

All guide text, app code, CSS and this README were written fresh for this entry. Only the starter plumbing (`main.ts`, `serve.ts`, `vendor/makefun-frontend.ts`, `LICENSE`) comes from the competition kit. No Rockstar logo, official artwork, box art or game screenshots are used. The look is original CSS only.

## License

MIT — see `LICENSE`.
