/*// frontend/vite.config.js  (ESM because "type": "module")
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
})*/
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

function loadHttpsIfAvailable() {
  // Only try HTTPS if explicitly requested (e.g., local dev),
  // never in CI. Set VITE_USE_HTTPS=true locally if you want SSL.
  if (process.env.VITE_USE_HTTPS !== "true") return undefined;

  const keyPath = path.resolve(__dirname, "ssl/privatekey.pem");
  const certPath = path.resolve(__dirname, "ssl/certificate.pem");
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    return {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };
  }
  // If files are missing, fall back to HTTP rather than crashing.
  return undefined;
}

export default defineConfig({
  plugins: [react()],
  server: {
    https: loadHttpsIfAvailable(),
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 5173,
  },
});
