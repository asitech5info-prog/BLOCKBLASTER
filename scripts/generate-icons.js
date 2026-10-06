import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const sizes = [
  { dir: 'public', name: 'icon.png', size: 512, src: 'icon.svg' },
  { dir: 'public', name: 'favicon.png', size: 64, src: 'favicon.svg' },
  { dir: 'public', name: 'favicon-32x32.png', size: 32, src: 'favicon.svg' },
  { dir: 'public', name: 'favicon-16x16.png', size: 16, src: 'favicon.svg' },
  { dir: 'public', name: 'apple-touch-icon.png', size: 180, src: 'favicon.svg' },
  { dir: 'android/app/src/main/res/mipmap-mdpi', name: 'ic_launcher.png', size: 48, src: 'icon.svg' },
  { dir: 'android/app/src/main/res/mipmap-mdpi', name: 'ic_launcher_round.png', size: 48, src: 'icon.svg' },
  { dir: 'android/app/src/main/res/mipmap-mdpi', name: 'ic_launcher_foreground.png', size: 48, src: 'icon.svg' },
  { dir: 'android/app/src/main/res/mipmap-hdpi', name: 'ic_launcher.png', size: 72, src: 'icon.svg' },
  { dir: 'android/app/src/main/res/mipmap-hdpi', name: 'ic_launcher_round.png', size: 72, src: 'icon.svg' },
  { dir: 'android/app/src/main/res/mipmap-hdpi', name: 'ic_launcher_foreground.png', size: 72, src: 'icon.svg' },
  { dir: 'android/app/src/main/res/mipmap-xhdpi', name: 'ic_launcher.png', size: 96, src: 'icon.svg' },
  { dir: 'android/app/src/main/res/mipmap-xhdpi', name: 'ic_launcher_round.png', size: 96, src: 'icon.svg' },
  { dir: 'android/app/src/main/res/mipmap-xhdpi', name: 'ic_launcher_foreground.png', size: 96, src: 'icon.svg' },
  { dir: 'android/app/src/main/res/mipmap-xxhdpi', name: 'ic_launcher.png', size: 144, src: 'icon.svg' },
  { dir: 'android/app/src/main/res/mipmap-xxhdpi', name: 'ic_launcher_round.png', size: 144, src: 'icon.svg' },
  { dir: 'android/app/src/main/res/mipmap-xxhdpi', name: 'ic_launcher_foreground.png', size: 144, src: 'icon.svg' },
  { dir: 'android/app/src/main/res/mipmap-xxxhdpi', name: 'ic_launcher.png', size: 192, src: 'icon.svg' },
  { dir: 'android/app/src/main/res/mipmap-xxxhdpi', name: 'ic_launcher_round.png', size: 192, src: 'icon.svg' },
  { dir: 'android/app/src/main/res/mipmap-xxxhdpi', name: 'ic_launcher_foreground.png', size: 192, src: 'icon.svg' },
];

async function generate() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const iconSvgContent = fs.readFileSync(path.join(rootDir, 'public', 'icon.svg'), 'utf-8');
  const faviconSvgContent = fs.readFileSync(path.join(rootDir, 'public', 'favicon.svg'), 'utf-8');

  for (const item of sizes) {
    const targetDir = path.join(rootDir, item.dir);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    const targetPath = path.join(targetDir, item.name);
    const content = item.src === 'favicon.svg' ? faviconSvgContent : iconSvgContent;

    await page.setViewportSize({ width: item.size, height: item.size });
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; background: transparent; overflow: hidden; }
            svg { width: 100%; height: 100%; display: block; }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);

    await page.screenshot({
      path: targetPath,
      omitBackground: true,
      clip: { x: 0, y: 0, width: item.size, height: item.size }
    });
    console.log(`Generated: ${item.dir}/${item.name} (${item.size}x${item.size})`);
  }

  await browser.close();
  console.log('All icons generated successfully!');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
