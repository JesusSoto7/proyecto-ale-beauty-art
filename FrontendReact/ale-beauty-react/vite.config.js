import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,      // para que sea accesible desde Docker
    port: 3000,
    watch: {
      usePolling: true,  // para que detecte cambios en Windows / Docker
    }
  }
})
