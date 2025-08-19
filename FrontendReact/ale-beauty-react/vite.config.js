import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from "fs"
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,      // para que sea accesible desde Docker
    port: 3000,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "ssl/key.pem")),
      cert: fs.readFileSync(path.resolve(__dirname, "ssl/cert.pem")),
    },
    watch: {
      usePolling: true,  // para que detecte cambios en Windows / Docker
    }
  }
})
