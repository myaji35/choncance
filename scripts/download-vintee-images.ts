/**
 * VINTEE Image Download Script
 * Downloads curated images from Unsplash for VINTEE brand aesthetic
 */

import fs from 'fs';
import path from 'path';
import https from 'https';

interface UnsplashImage {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
  };
  user: {
    name: string;
  };
}

// Curated Unsplash image IDs for VINTEE aesthetic
const HERO_IMAGES = [
  // Korean traditional house at golden hour
  'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1920&q=85', // Korean hanok
  // Countryside sunset landscape
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=85', // Mountain sunset
  // Vintage rustic interior
  'https://images.unsplash.com/photo-1571055107559-3e67090bca84?w=1920&q=85', // Cozy interior
];

const PROPERTY_IMAGES = [
  // Traditional Korean house
  'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200&q=85',
  // Rustic cottage exterior
  'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200&q=85',
  // Vintage farmhouse
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=85',
  // Countryside villa
  'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&q=85',
  // Traditional interior
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=85',
];

async function downloadImage(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);

    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✓ Downloaded: ${path.basename(filepath)}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

async function main() {
  console.log('🎨 Downloading VINTEE curated images from Unsplash...\n');

  // Download hero images
  console.log('📸 Hero Section Images:');
  for (let i = 0; i < HERO_IMAGES.length; i++) {
    const url = HERO_IMAGES[i];
    const filepath = path.join(process.cwd(), 'public', 'images', 'hero', `hero-${i + 1}.jpg`);

    try {
      await downloadImage(url, filepath);
    } catch (error) {
      console.error(`✗ Failed to download hero-${i + 1}:`, error);
    }
  }

  console.log('\n🏡 Property Images:');
  for (let i = 0; i < PROPERTY_IMAGES.length; i++) {
    const url = PROPERTY_IMAGES[i];
    const filepath = path.join(process.cwd(), 'public', 'images', 'properties', `property-${i + 1}.jpg`);

    try {
      await downloadImage(url, filepath);
    } catch (error) {
      console.error(`✗ Failed to download property-${i + 1}:`, error);
    }
  }

  console.log('\n✨ Image download complete!');
  console.log('\nNext steps:');
  console.log('1. Update HeroCarousel to use /images/hero/hero-*.jpg');
  console.log('2. Update PropertyCard placeholders to use /images/properties/property-*.jpg');
  console.log('3. Apply VINTEE color grading if needed');
}

main().catch(console.error);
