import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  server: {
    port: 3002,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/ws': {
        target: 'ws://localhost:3100',
        ws: true
      }
    }
  },
  build: {
    outDir: 'dist'
  }
})
