import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8787',
      '/r2': 'http://localhost:8787',
      '/uploads': 'http://localhost:8787',
      '/brands': 'http://localhost:8787',
      '/backgrounds': 'http://localhost:8787',
    }
  }
})
