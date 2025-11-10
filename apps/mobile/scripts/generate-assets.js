const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '../assets');

// Create assets directory if it doesn't exist
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Helper function to create a colored square with text
async function createPlaceholderImage(width, height, filename, color, label) {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
      <text 
        x="50%" 
        y="50%" 
        font-family="Arial, sans-serif" 
        font-size="${Math.min(width, height) / 10}" 
        font-weight="bold"
        fill="white" 
        text-anchor="middle" 
        dominant-baseline="middle"
      >${label}</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(assetsDir, filename));
  
  console.log(`✅ Created ${filename} (${width}x${height}px)`);
}

async function generateAssets() {
  console.log('🎨 Generating placeholder assets...\n');

  try {
    // App icon (1024x1024px)
    await createPlaceholderImage(1024, 1024, 'icon.png', '#4F46E5', 'ICON');

    // Splash screen (1242x2436px)
    await createPlaceholderImage(1242, 2436, 'splash.png', '#4F46E5', 'SPLASH');

    // Android adaptive icon (1024x1024px)
    await createPlaceholderImage(1024, 1024, 'adaptive-icon.png', '#4F46E5', 'ADAPTIVE');

    // Web favicon (48x48px)
    await createPlaceholderImage(48, 48, 'favicon.png', '#4F46E5', 'F');

    console.log('\n✨ All assets generated successfully!');
    console.log('\n💡 Note: These are placeholder images. Replace them with your actual app assets.');
  } catch (error) {
    console.error('❌ Error generating assets:', error.message);
    process.exit(1);
  }
}

generateAssets();

