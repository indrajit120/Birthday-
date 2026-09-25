const fs = require('fs');
const path = require('path');

const ROOT_DIR = process.cwd();
const DATA_DIR = path.join(ROOT_DIR, '.data');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const PUBLIC_API_DIR = path.join(PUBLIC_DIR, 'api');
const PUBLIC_UPLOADS_DIR = path.join(PUBLIC_DIR, 'uploads');
const PUBLIC_CONFIG = path.join(PUBLIC_DIR, 'config.json');
const PUBLIC_API_CONFIG = path.join(PUBLIC_API_DIR, 'config.json');
const PUBLIC_REDIRECTS = path.join(PUBLIC_DIR, '_redirects');

// 1. Ensure directories exist
[PUBLIC_DIR, PUBLIC_API_DIR, PUBLIC_UPLOADS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// 2. Sync config to public/
let configData = null;
if (fs.existsSync(CONFIG_FILE)) {
  try {
    const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.videoStage) {
      parsed.videoStage = {
        enabled: false,
        videoUrl: "",
        fileName: "",
        resolution: "Auto",
        aspectRatio: "Auto",
        resolutions: {}
      };
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    }
    configData = JSON.stringify(parsed, null, 2);
  } catch (e) {
    console.warn('Failed to read config file from .data', e);
  }
}

if (!configData) {
  configData = JSON.stringify({
    name: "You",
    senderName: "Me",
    age: 16,
    videoStage: {
      enabled: false,
      videoUrl: "",
      fileName: "",
      resolution: "Auto",
      aspectRatio: "Auto",
      resolutions: {}
    }
  }, null, 2);
}

fs.writeFileSync(PUBLIC_CONFIG, configData, 'utf-8');
fs.writeFileSync(PUBLIC_API_CONFIG, configData, 'utf-8');

// 3. Ensure _redirects file for Netlify
const redirectsContent = `/api/config /config.json 200\n/* /index.html 200\n`;
fs.writeFileSync(PUBLIC_REDIRECTS, redirectsContent, 'utf-8');

// 4. Copy uploaded files if any exist
if (fs.existsSync(UPLOADS_DIR)) {
  const files = fs.readdirSync(UPLOADS_DIR);
  for (const file of files) {
    const src = path.join(UPLOADS_DIR, file);
    const dest = path.join(PUBLIC_UPLOADS_DIR, file);
    try {
      if (fs.statSync(src).isFile()) {
        fs.copyFileSync(src, dest);
      }
    } catch (e) {
      console.warn(`Failed to copy uploaded asset ${file}`, e);
    }
  }
}

// Keep uploads folder in git
const gitkeep = path.join(PUBLIC_UPLOADS_DIR, '.gitkeep');
if (!fs.existsSync(gitkeep)) fs.writeFileSync(gitkeep, '');

console.log('Successfully synced static assets for Netlify build.');
