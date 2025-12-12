const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const paths = require('../scripts/paths');

const publicDir = paths.public;
const assetsDir = paths.assets;
const faviconIco = path.join(publicDir, 'favicon.png');

if (!fs.existsSync(faviconIco)) {
  console.error('favicon.ico not found in public/ folder.');
  process.exit(1);
}

const sizes = [120, 152, 180];

sizes.forEach((size) => {
  const outputFile = path.join(assetsDir, `apple-touch-icon-${size}.png`);

  sharp(faviconIco)
    .resize(size, size)
    .toFile(outputFile)
    .then(() =>
      console.log(`apple-touch-icon-${size}.png generated successfully!`)
    )
    .catch((error) =>
      console.error(`Error generating apple-touch-icon-${size}.png:`, error)
    );
});
