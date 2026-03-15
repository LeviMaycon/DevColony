# DevColony

An ant colony simulation that hunts GitHub repositories as food. Insects explore a canvas, discover repos, and carry them back to the colony using pheromone trails and the ACO (Ant Colony Optimization) algorithm.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![Pixi.js](https://img.shields.io/badge/Pixi.js-v8-e72264?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)
![Zustand](https://img.shields.io/badge/Zustand-5-orange?style=flat-square)

<img src="https://raw.githubusercontent.com/LeviMaycon/DevColony/main/public/demo.png" width="800"/>

---

## How it works

1. Type a topic (e.g. `fire simulation python`)
2. The simulation fetches the 100 most popular GitHub repositories for that topic
3. Each repo appears as a food source scattered across the canvas
4. Insects explore, find repos, and carry them back to the colony
5. The sidebar shows which insects are carrying what, and which repos have already been collected

Food size is proportional to the repo's star count. Pheromone trails form along frequently used paths and evaporate over time.

---

## Features

- Ant colony simulation using a simplified ACO algorithm
- GitHub repository search with real-time results
- Pheromone trail system with evaporation
- Sprite-based insects with walking animation
- Zoom and pan canvas navigation
- Language filter with color-coded connections between repos
- Repo hover card with owner profile, stats, last commit date, and README preview
- Click on a repo to open it on GitHub
- Search history saved to localStorage
- Trending repositories (last 7 days)
- Year filter for repository creation date
- Share search via URL
- Resizable sidebar panels

---

## Tech stack

- **Next.js 15** — React framework with App Router
- **Pixi.js v8** — WebGL 2D renderer
- **Zustand** — simulation state management
- **TypeScript** — static typing
- **Tailwind CSS** — UI styling
- **GitHub Search API** — repository data source
- **re-resizable** — resizable sidebar panels

---

## Installation

```bash
git clone https://github.com/LeviMaycon/DevColony.git
cd DevColony
npm install
cp .env.example .env.local
```

Edit `.env.local` with your GitHub token:

```env
GITHUB_TOKEN=ghp_your_token_here
```

Generate a token at [github.com/settings/tokens](https://github.com/settings/tokens) — `public_repo` scope is sufficient.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project structure

```
src/
  core/
    simulation/
      Ant.ts              insect logic, sprite animation, and graphics
      World.ts            global simulation state (Zustand)
      Pheromone.ts        pheromone grid with evaporation
      Camera.ts           zoom and pan controls
      placement.ts        grid-based position generation
      types.ts            TypeScript interfaces
    components/
      canvas/
        SimulationCanvas.tsx        main Pixi.js canvas
        SimulationCanvasWrapper.tsx client-side wrapper
      ui/
        SimulationSidebar.tsx       insects panel and colony panel
        SearchBar.tsx               topic search with history and trending
        LanguageFilterPanel.tsx     language filter with connection lines
        RepoHoverCard.tsx           hover card with repo and owner details
    hooks/
      useGitHubSearch.ts    GitHub API integration
      useSearchHistory.ts   localStorage search history
      useShareSearch.ts     URL-based search sharing
app/
  api/
    github/
      search/route.ts     GitHub Search API proxy with enriched data
      trending/route.ts   trending repositories (last 7 days)
      avatar/route.ts     avatar image proxy
  page.tsx
  layout.tsx
public/
  beetle-blue.png   blue insect sprite sheet
  beetle-gold.png   gold insect sprite sheet
```

---

## Algorithm

Insects implement a simplified version of the **ACO (Ant Colony Optimization)** algorithm:

- **Exploration** — each insect moves with slight randomness (`WANDER_STRENGTH`)
- **Detection** — when close to an undiscovered repo, the insect switches to `returning` state
- **Return** — the insect navigates directly back to the colony, depositing pheromone along the way
- **Evaporation** — pheromone evaporates gradually, reinforcing frequently used paths
- **Bouncing** — insects bounce off canvas edges

---

## Configuration

In `src/core/simulation/World.ts`:

```ts
const ANT_COUNT        = 20     // number of insects
const EVAPORATION_RATE = 0.008  // pheromone evaporation speed per tick
const DEPOSIT_AMOUNT   = 0.15   // pheromone deposited per tick
```

In `src/core/simulation/Ant.ts`:

```ts
const SPEED           = 2    // base movement speed
const WANDER_STRENGTH = 0.4  // exploration randomness
```

---

## Planned features

- [ ] Camera mode — follow a selected insect across the canvas
- [ ] Export collected repos as `.json` or `.csv`
- [ ] Real-time statistics — repos collected per minute chart
- [ ] Presentation mode — fullscreen canvas without UI
- [ ] Speed slider — adjust simulation speed
- [ ] Web Worker — move tick loop off the main thread
- [ ] Related repo connections — link repos that reference each other
- [ ] Multiplayer — shared canvas via WebSocket

---

## License

MIT