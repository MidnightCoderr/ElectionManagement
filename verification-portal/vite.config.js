import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3002,
        proxy: {
            '/api/blockchain': {
                target: 'http://localhost:3000',  // Changed from 4000 to match backend
                changeOrigin: true
            }
        }
    }
})
