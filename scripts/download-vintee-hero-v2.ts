/**
 * VINTEE Hero Images v2 - Curated for small-scale rural stays
 * Focus: Cozy, host-driven, intimate countryside accommodations
 */

import fs from 'fs';
import path from 'path';
import https from 'https';

// Carefully selected images for VINTEE's "vintage rural retreat" concept
const VINTEE_HERO_IMAGES = [
  // 1. Korean traditional hanok interior view with warm lighting
  // Cozy room with traditional elements, warm afternoon light
  {
    url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=85',
    name: 'hero-1.jpg',
    description: 'Warm interior of traditional Korean room'
  },

  // 2. Small countryside house with garden view
  // Intimate scale, homely feel, vintage aesthetic
  {
    url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&q=85',
    name: 'hero-2.jpg',
    description: 'Cozy countryside house exterior at golden hour'
  },

  // 3. Wooden deck/terrace view overlooking rural landscape
  // First-person perspective from the accommodation
  {
    url: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=1920&q=85',
    name: 'hero-3.jpg',
    description: 'Wooden terrace with countryside sunset view'
  },
];

async function downloadImage(url: string, filepath: string, description: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`  📥 ${description}...`);

    const file = fs.createWriteStream(filepath);

    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirect
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          https.get(redirectUrl, (redirectResponse) => {
            redirectResponse.pipe(file);
            file.on('finish', () => {
              file.close();
              console.log(`  ✓ ${path.basename(filepath)} downloaded`);
              resolve();
            });
          }).on('error', reject);
        } else {
          reject(new Error('Redirect without location'));
        }
      } else {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`  ✓ ${path.basename(filepath)} downloaded`);
          resolve();
        });
      }
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

async function main() {
  console.log('🏡 VINTEE Hero Images v2 - Curated Selection\n');
  console.log('Concept: Small-scale, cozy, host-driven rural stays');
  console.log('─'.repeat(60));
  console.log('');

  const heroDir = path.join(process.cwd(), 'public', 'images', 'hero');

  for (const image of VINTEE_HERO_IMAGES) {
    const filepath = path.join(heroDir, image.name);

    try {
      await downloadImage(image.url, filepath, image.description);
    } catch (error) {
      console.error(`  ✗ Failed: ${image.name}`, error);
    }
  }

  console.log('');
  console.log('✨ Download complete!');
  console.log('');
  console.log('Images reflect VINTEE values:');
  console.log('  • Small-scale accommodations');
  console.log('  • Warm, intimate atmosphere');
  console.log('  • Host-driven hospitality');
  console.log('  • Authentic rural experience');
}

main().catch(console.error);
