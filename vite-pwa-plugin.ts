// vite-pwa-plugin.ts
import { Plugin } from 'vite';
import { writeFileSync, copyFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';

export default function pwaPlugin(): Plugin {
    return {
        name: 'vite-plugin-pwa',
        
        // Copy manifest and service worker files to the dist directory
        writeBundle(options) {
        const outDir = options.dir || 'dist';
        
        // Ensure the icons directory exists
        const iconsDir = resolve(outDir, 'icons');
        if (!existsSync(iconsDir)) {
            mkdirSync(iconsDir, { recursive: true });
        }
        
        // Copy the manifest
        const manifestPath = resolve(process.cwd(), 'manifest.json');
        const manifestDestPath = resolve(outDir, 'manifest.json');
        try {
            copyFileSync(manifestPath, manifestDestPath);
            console.log('✅ Copied manifest.json to dist');
        } catch (e) {
            console.error('❌ Failed to copy manifest.json:', e);
        }
        
        // Copy the service worker
        const swPath = resolve(process.cwd(), 'service-worker.js');
        const swDestPath = resolve(outDir, 'service-worker.js');
        try {
            copyFileSync(swPath, swDestPath);
            console.log('✅ Copied service-worker.js to dist');
        } catch (e) {
            console.error('❌ Failed to copy service-worker.js:', e);
        }
        
      // Create a robots.txt file
      const robotsContent = `User-agent: *
    Allow: /

    Sitemap: https://gamemuse.example.com/sitemap.xml`;
        
        try {
            writeFileSync(resolve(outDir, 'robots.txt'), robotsContent);
            console.log('✅ Created robots.txt in dist');
        } catch (e) {
            console.error('❌ Failed to create robots.txt:', e);
        }
            
        console.log('🚀 PWA files copied to dist directory');
        },
    };
}