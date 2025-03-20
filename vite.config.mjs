import checker from 'vite-plugin-checker'
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), checker({ typescript: true })],
  base: "",
  server: {
    proxy: {
        "/api": "http://localhost:3000",
        "/auth": "http://localhost:3000",
        "/uploads": "http://localhost:3000"
    }
  }
})
