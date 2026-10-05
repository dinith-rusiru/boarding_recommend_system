import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves this repository from /boarding_recommend_system/, not /.
export default defineConfig({
  base: '/boarding_recommend_system/',
  plugins: [react()],
})
