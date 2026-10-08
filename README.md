# Humour Diary

Rate your humour 1–5 per day, tag emotions, write a note and doodle. PWA, data stays in your browser.

## Run
    npm install
    npm run dev

## Deploy (GitHub Pages)
1. Push to a GitHub repo's `main` branch.
2. Repo → Settings → Pages → Source: **GitHub Actions**.
3. The included workflow builds with the correct base path and deploys.

## Adding another storage backend
Implement `StorageAdapter` (src/types.ts), then change the one line in `src/storage/index.ts`.
