import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const SOURCE_ICON = path.join('src', 'assets', 'app-icon.png');
const OUTPUT_DIR = path.join('public', 'icons');

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created output directory: ${OUTPUT_DIR}`);
}

// Icon sizes to generate
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Check if source icon exists
if (!fs.existsSync(SOURCE_ICON)) {
    console.error(`Source icon not found: ${SOURCE_ICON}`);
    console.log('Please create an app icon at this location or modify this script.');
    console.log('Creating a placeholder icon for now...');

  // Create a simple placeholder icon - purple square with "GM" text
    const SIZE = 512;

    sharp({
    create: {
        width: SIZE,
        height: SIZE,
        channels: 4,
      background: { r: 153, g: 50, b: 204, alpha: 1 } // #9932cc (fae color)
    }
    })
    .png()
    .toFile(path.join(OUTPUT_DIR, 'icon-512x512.png'))
    .then(() => {
    console.log('Created placeholder icon');
    generateIcons(path.join(OUTPUT_DIR, 'icon-512x512.png'));
    })
    .catch(err => {
    console.error('Error creating placeholder icon:', err);
    });
} else {
    generateIcons(SOURCE_ICON);
}

function generateIcons(sourcePath) {
    console.log(`Generating icons from: ${sourcePath}`);
    
    // Process each icon size
    iconSizes.forEach(size => {
        const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
        
        sharp(sourcePath)
        .resize(size, size)
        .png()
        .toFile(outputPath)
        .then(() => {
            console.log(`Generated ${size}x${size} icon`);
        })
        .catch(err => {
            console.error(`Error generating ${size}x${size} icon:`, err);
        });
    });
    
    // Create a special maskable icon (with padding)
    sharp(sourcePath)
        .resize(512, 512, {
        fit: 'contain',
        background: { r: 153, g: 50, b: 204, alpha: 1 } // #9932cc
        })
        .png()
        .toFile(path.join(OUTPUT_DIR, 'maskable-icon-512x512.png'))
        .then(() => {
        console.log('Generated maskable icon');
        })
        .catch(err => {
        console.error('Error generating maskable icon:', err);
        });
    
    // Also create Apple touch icons
    const appleSizes = [76, 120, 152, 180];
    appleSizes.forEach(size => {
        const outputPath = path.join(OUTPUT_DIR, `apple-icon-${size}.png`);
        
        sharp(sourcePath)
        .resize(size, size)
        .png()
        .toFile(outputPath)
        .then(() => {
            console.log(`Generated Apple icon ${size}x${size}`);
        })
        .catch(err => {
            console.error(`Error generating Apple icon ${size}x${size}:`, err);
        });
    });
}