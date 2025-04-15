import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pwaPlugin from './vite-pwa-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    pwaPlugin()
  ],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Add hash to file names for cache busting
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  }
})