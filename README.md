# Smart Bodim

A responsive React + Vite + Tailwind CSS demo that helps NSBM Green University students find nearby boarding places in Pitipana, Homagama.

## Run locally

```bash
npm install
npm run dev
```

Open the local address Vite prints (usually `http://localhost:5173`).

## Commands

```bash
npm run build  # production build
npm test       # run recommendation unit tests
```

## GitHub Pages

This repository is configured for GitHub Pages at `https://<username>.github.io/boarding_recommend_system/`.

1. Run `npm run build`.
2. Publish the generated `dist` folder (or configure a GitHub Actions workflow to build and publish it).
3. In the repository's **Settings → Pages**, choose the branch/folder that contains the generated site.

The app uses hash URLs such as `/#/find` so refreshing a page works on GitHub Pages.

## Data and recommendation rules

Listings load in the browser from `public/listings.csv` via PapaParse. The landlord form is a UI-only demo: it adds a listing to React state for the current browser session.

Recommendation logic is isolated in `src/utils/recommend.js`. It applies availability, gender, budget, distance, and room-type filters, then ranks the remaining listings by weighted price, distance, facility, and safety scores. The score weights are automatically kept at 100% in the UI.
