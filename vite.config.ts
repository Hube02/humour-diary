import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// On GitHub Pages the app lives at /<repo-name>/ — the workflow sets BASE_PATH.
const base = process.env.BASE_PATH ?? '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Humour Diary',
        short_name: 'Humour',
        description: 'Rate your humour every day, with emotions and doodles.',
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: '#fff4e6',
        theme_color: '#ff4f9a',
        icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
      },
    }),
  ],
})
