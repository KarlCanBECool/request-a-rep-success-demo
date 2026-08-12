import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so dist/ works on Vercel, GitHub Pages, or any static host
export default defineConfig({
  plugins: [react()],
  base: './',
})
