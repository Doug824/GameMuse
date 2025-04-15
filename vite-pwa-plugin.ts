import { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory (equivalent to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function pwaPlugin(): Plugin {
    return {
        name: 'vite-plugin-pwa',
        
        // Copy manifest and service worker files to the dist directory
        writeBundle(options) {
        const outDir = options.dir || 'dist';
        
        // Ensure the icons directory exists
        const iconsDir = path.resolve(outDir, 'icons');
        if (!fs.existsSync(iconsDir)) {
            fs.mkdirSync(iconsDir, { recursive: true });
        }
        
        // Copy the manifest
        const manifestPath = path.resolve(__dirname, 'manifest.json');
        const manifestDestPath = path.resolve(outDir, 'manifest.json');
        try {
            fs.copyFileSync(manifestPath, manifestDestPath);
            console.log('✅ Copied manifest.json to dist');
        } catch (e) {
            console.error('❌ Failed to copy manifest.json:', e);
        }
        
        // Copy the service worker
        const swPath = path.resolve(__dirname, 'service-worker.js');
        const swDestPath = path.resolve(outDir, 'service-worker.js');
        try {
            fs.copyFileSync(swPath, swDestPath);
            console.log('✅ Copied service-worker.js to dist');
        } catch (e) {
            console.error('❌ Failed to copy service-worker.js:', e);
        }
        
        // Create a robots.txt file
        const robotsContent = `User-agent: *
    Allow: /

    Sitemap: https://gamemuse.example.com/sitemap.xml`;
        
        try {
            fs.writeFileSync(path.resolve(outDir, 'robots.txt'), robotsContent);
            console.log('✅ Created robots.txt in dist');
        } catch (e) {
            console.error('❌ Failed to create robots.txt:', e);
        }
        
        console.log('🚀 PWA files copied to dist directory');
        },
    };
}