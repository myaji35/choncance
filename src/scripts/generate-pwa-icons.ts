import sharp from 'sharp'
import { promises as fs } from 'fs'
import path from 'path'

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]

async function generateIcons() {
  const inputPath = path.join(process.cwd(), 'public', 'vintee-logo.png')
  const outputDir = path.join(process.cwd(), 'public', 'icons')

  // Create output directory if it doesn't exist
  try {
    await fs.mkdir(outputDir, { recursive: true })
  } catch (error) {
    console.error('Error creating directory:', error)
  }

  // Check if input image exists
  try {
    await fs.access(inputPath)
  } catch (error) {
    console.error('Input image not found. Please add vintee-logo.png to public folder')
    // Create a placeholder icon
    const svg = `
      <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <rect width="512" height="512" fill="#0EA5E9"/>
        <text x="256" y="256" font-family="Arial" font-size="200" fill="white" text-anchor="middle" dominant-baseline="middle">V</text>
      </svg>
    `

    for (const size of sizes) {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`)

      await sharp(Buffer.from(svg))
        .resize(size, size)
        .png()
        .toFile(outputPath)

      console.log(`Created placeholder icon: ${outputPath}`)
    }
    return
  }

  // Generate icons of different sizes
  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`)

    try {
      await sharp(inputPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath)

      console.log(`Generated icon: ${outputPath}`)
    } catch (error) {
      console.error(`Error generating ${size}x${size} icon:`, error)
    }
  }

  // Generate maskable icons with padding
  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-maskable-${size}x${size}.png`)
    const paddedSize = Math.floor(size * 0.8)

    try {
      await sharp(inputPath)
        .resize(paddedSize, paddedSize, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .extend({
          top: Math.floor((size - paddedSize) / 2),
          bottom: Math.ceil((size - paddedSize) / 2),
          left: Math.floor((size - paddedSize) / 2),
          right: Math.ceil((size - paddedSize) / 2),
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png()
        .toFile(outputPath)

      console.log(`Generated maskable icon: ${outputPath}`)
    } catch (error) {
      console.error(`Error generating maskable ${size}x${size} icon:`, error)
    }
  }

  console.log('Icon generation complete!')
}

generateIcons().catch(console.error)