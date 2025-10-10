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
// vite.config.js
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

function readHttpsPair(rootDir) {
  const keyPath = path.resolve(rootDir, "ssl/privatekey.pem");
  const certPath = path.resolve(rootDir, "ssl/certificate.pem");
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    return {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };
  }
  return undefined;
}

export default defineConfig(({ mode }) => {
  // Load .env / .env.local into process for this config run
  const env = loadEnv(mode, process.cwd(), "");

  const useHttps = env.VITE_USE_HTTPS === "true";
  const https = useHttps ? readHttpsPair(process.cwd()) : undefined;

  return {
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
      https, // will be undefined (HTTP) unless VITE_USE_HTTPS=true AND certs exist
      strictPort: true,
    },
    preview: {
      host: true,
      port: 5173,
      https,
    },
  };
});
