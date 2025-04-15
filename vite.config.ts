import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import pwaPlugin from './vite-pwa-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    pwaPlugin()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
  },
  server: {
    port: 3000,
    open: true,
    headers: {
      'Content-Type': 'application/javascript',
      'Service-Worker-Allowed': '/'
    }
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
  },
  // Ensure we define a base path for correct asset loading
  base: '/'
})