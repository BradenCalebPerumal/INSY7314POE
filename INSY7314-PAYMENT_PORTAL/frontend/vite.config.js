// frontend/vite.config.js  (ESM because "type": "module")
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'ssl/privatekey.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'ssl/certificate.pem')),
    },
    host: 'localhost',
    port: 5173,
    strictPort: true,
    // If you proxy to a self-signed backend, uncomment:
    // proxy: {
    //   '/api': { target: 'https://localhost:4000', changeOrigin: true, secure: false }
    // }
  },
})
