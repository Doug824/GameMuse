import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

// Get current directory (equivalent to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Source icon file - should be at least 512x512 png
const sourceIcon = path.join(__dirname, 'src', 'assets', 'app-icon.png');

// Define the sizes for PWA icons
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Generate standard icons of various sizes
async function generateIcons() {
  try {
    // Create icons of each size
    for (const size of sizes) {
      const fileName = `icon-${size}x${size}.png`;
      await sharp(sourceIcon)
        .resize({
          width: size,
          height: size,
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
        })
        .toFile(path.join(iconsDir, fileName));
        
      console.log(`✅ Generated ${fileName}`);
    }
    
    // Generate iOS specific icons
    const iosSizes = [76, 120, 152, 180];
    for (const size of iosSizes) {
      const fileName = `apple-icon-${size}.png`;
      await sharp(sourceIcon)
        .resize({
          width: size,
          height: size,
          fit: 'contain',
          background: { r: 92, g: 158, b: 117, alpha: 1 } // Purple background
        })
        .toFile(path.join(iconsDir, fileName));
        
      console.log(`✅ Generated ${fileName}`);
    }
    
    // Generate iOS splash screens
    const splashScreens = [
      { width: 1125, height: 2436, name: 'apple-splash-1125-2436.png' }, // iPhone X
      { width: 750, height: 1334, name: 'apple-splash-750-1334.png' },   // iPhone 8, 7, 6s, 6
      { width: 1242, height: 2208, name: 'apple-splash-1242-2208.png' }  // iPhone 8+, 7+, 6s+, 6+
    ];
    
    for (const screen of splashScreens) {
      // Use a fixed size for the icon (256px) to avoid calculation errors
      const iconSize = 256;
      
      await sharp(sourceIcon)
        .resize({
          width: iconSize,
          height: iconSize,
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent
        })
        .extend({
          width: screen.width,
          height: screen.height,
          background: { r: 22, g: 44, b: 34, alpha: 1 } // Dark background
        })
        .composite([
          {
            input: await sharp(sourceIcon)
              .resize({
                width: iconSize,
                height: iconSize,
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
              })
              .toBuffer(),
            gravity: 'center'
          }
        ])
        .toFile(path.join(iconsDir, screen.name));
        
      console.log(`✅ Generated ${screen.name}`);
    }
    
    // Generate OG social sharing image
    await sharp(sourceIcon)
      .resize({
        width: 1200,
        height: 630,
        fit: 'contain',
        background: { r: 22, g: 44, b: 34, alpha: 1 } // Dark background
      })
      .toFile(path.join(iconsDir, 'og-image.png'));
      
    console.log('✅ Generated OG image');
    
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

// Generate maskable icon (with padding)
async function generateMaskableIcon() {
  try {
    const imageInfo = await sharp(sourceIcon).metadata();
    const { width, height } = imageInfo;
    const minDimension = Math.min(width, height);
    
    // Create a maskable icon with 10% safe zone padding
    const padding = Math.floor(minDimension * 0.1);
    
    await sharp(sourceIcon)
      .resize({
        width: minDimension - (padding * 2),
        height: minDimension - (padding * 2),
        fit: 'contain',
        background: { r: 92, g: 158, b: 117, alpha: 1 }
      })
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 92, g: 158, b: 117, alpha: 1 }
      })
      .toFile(path.join(iconsDir, 'maskable-icon.png'));
    
    console.log('✅ Generated maskable icon');
  } catch (error) {
    console.error('Error generating maskable icon:', error);
  }
}

// Main execution
async function main() {
  console.log('🎨 Generating PWA icons...');
  
  // Check if source icon exists
  if (!fs.existsSync(sourceIcon)) {
    console.error(`⚠️ Source icon not found at ${sourceIcon}`);
    console.log('Please create an app-icon.png file in the src/assets directory');
    process.exit(1);
  }
  
  try {
    // Generate all icons in parallel
    await Promise.all([
      generateIcons(),
      generateMaskableIcon()
    ]);
    
    console.log('✨ All icons generated successfully!');
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

main();