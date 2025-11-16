import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true,
      interval: 200,
    },
    hmr: {
      host: process.env.VITE_HMR_HOST || 'localhost',
      port: parseInt(process.env.VITE_HMR_PORT || '5173', 10),
      protocol: 'ws',
    },
  },
})