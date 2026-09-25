import http from 'http';
import express from 'express';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), '.data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

// Ensure data directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Default config if none exists
const defaultConfig = {
  name: "You",
  senderName: "Me",
  age: 16,
  birthdayDate: "",
  introText: "a little something, for you",
  instructionText: "PULL & RELEASE",
  mainMessage: "Happy Birthday, {name}",
  subtitle: "and just like that, you're turning {age} ✨",
  finalMessage: "Happy {age}th Birthday, {name} ❤️\n\nMay this year bring you beautiful memories,\nendless smiles, and everything you've been wishing for.\n\nKeep smiling.\nKeep shining.\nAnd always stay the amazing person you are. ✨",
  song: "https://actions.google.com/sounds/v1/water/rain_on_roof.ogg",
  photos: [
    "https://images.unsplash.com/photo-1530103862676-de8892bc952f?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=800",
  ],
  colors: {
    bgStart: "#FFF9F5",
    bgEnd: "#FFE4E1",
    heartPink: "#FF69B4",
  },
  slingshotSettings: {
    maxPull: 130,
    gravity: 0.8,
    bowScale: 1.0,
    bowDistance: 0,
  },
  heartAnimation: {
    particleCount: 350,
    speed: 1.0,
    glow: 0.8,
  },
  photoScene: {
    heading: "A walk down memory lane",
    subtitle: "Every moment with you is my favorite memory. ❤️"
  },
  shareSettings: {
    title: "🎂 A Birthday Surprise for {name}",
    description: "Someone made a little birthday surprise for you ❤️",
  },
  letterScene: {
    enableAnimals: true,
    enableHearts: true,
    enableSparkles: true,
    enablePetals: true,
    animationIntensity: 'Medium'
  },
  cakeScene: {
    enabled: true,
    title: "Make a wish, {name} ✨",
    buttonText: "🎂 Cut the Cake",
    surpriseMessage1: "A little more happiness for you ❤️",
    surpriseMessage2: "Happy Birthday, {name}! 🎂✨",
    continueButton: "💖 Continue",
    cakeBaseColor: "#FFC0CB",
    frostingColor: "#FFF0F5",
    creamColor: "#FFFFFF",
    decorationColor: "#FFD700",
    candleCount: 5,
    candleColor: "#FFFFFF",
    soundEffect: "https://actions.google.com/sounds/v1/cartoon/magic_chime_sweep.ogg",
    sparkleIntensity: 100,
    flavour: "strawberry",
    spongeColor: "#eab995",
    dripColor: "#ff91b1",
    flowerColor: "#ff91b1",
    heartColor: "#ff7198",
    pearlColor: "#ffc84d",
    platformColor: "#ffe6ea",
    backgroundColor: "#f8dfe4"
  },
  balloonScene: {
    enabled: true,
    heading: "Pop the balloons 🎈",
    subtitle: "5 balloons. Each one holds a reason you're loved. Pop them all",
    popSoundEnabled: true,
    confettiEnabled: true,
    sparkleEnabled: true,
    completionText: "All the reasons are out… but there are still a million more. 💖",
    balloons: [
      {
        id: 1,
        title: "REASON NO.1 💖",
        message: "You remember the little things I forget",
        balloonColor: "#FF8FB3",
        accentColor: "#FF6B8A"
      },
      {
        id: 2,
        title: "REASON NO.2 💖",
        message: "The world is kinder with you in it",
        balloonColor: "#7EE7E1",
        accentColor: "#39D5D0"
      },
      {
        id: 3,
        title: "REASON NO.3 💖",
        message: "My worst days get shorter when you call",
        balloonColor: "#FFD166",
        accentColor: "#F4A261"
      },
      {
        id: 4,
        title: "REASON NO.4 💖",
        message: "You believed in me when I didn't",
        balloonColor: "#B5838D",
        accentColor: "#E5989B"
      },
      {
        id: 5,
        title: "REASON NO.5 💖",
        message: "You make ordinary moments feel special",
        balloonColor: "#9BF6FF",
        accentColor: "#00F5D4"
      }
    ]
  },
  friendshipRules: {
    enabled: true,
    roomLabel: "ROOM 7 · THE PROMISES",
    title: "Tick each promise, then sign.",
    cardTitle: "Our Friendship Rules",
    subtitle: "BETWEEN {senderName} AND {recipientName}",
    signatureLabel: "SIGN HERE WITH YOUR FINGER",
    buttonText: "Renew our friendship ✍️",
    completedButtonText: "Renewed 🎉",
    stampTitle: "RENEWED",
    stampSubtitle: "FOR LIFE",
    rules: [
      { id: "1", text: "Reply to my texts within one business week", enabled: true, required: true, order: 1, icon: "📱" },
      { id: "2", text: "Send me memes that remind you of me", enabled: true, required: true, order: 2, icon: "😂" },
      { id: "3", text: "Never let me do anything stupid... alone", enabled: true, required: true, order: 3, icon: "👯" }
    ]
  },
  puzzleScene: {
    enabled: true,
    roomLabel: "ROOM 4 · THE RESTORATION DESK",
    title: "This photo fell apart.",
    instructions: "Put the pieces back in order. Tap two pieces to swap them, or drag one where you want it.",
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=800",
    gridSize: 3,
    completionTitle: "SOLVED!",
    completionMessage: "You put us back together.",
    completionButtonText: "Continue",
    enablePeek: true,
    enableTimer: true,
    enableMoveCounter: true,
    backgroundColor: "#fff0f3",
    textColor: "#333333"
  },
  endScene: {
    enabled: true,
    heading: "HAPPY BIRTHDAY",
    senderMessage: "Made with love, just for you — {senderName} ❤️",
    buttonText: "Share on WhatsApp Status 📱",
    helperText: "Share this surprise with them ❤️",
    colors: {
      bgStart: "#4f46e5", // indigo-600
      bgEnd: "#db2777", // pink-600
      heading: "#ffffff",
      recipientName: "#fdf2f8", // pink-50
      senderMessage: "#ffffff",
      buttonStart: "#ffffff",
      buttonEnd: "#ffffff",
      buttonText: "#db2777",
      helperText: "#fbcfe8" // pink-200
    },
    animations: {
      confetti: true,
      sparkles: true,
      hearts: true,
      floatingParticles: true,
      characterAnimation: true,
      intensity: 'Medium',
      speed: 1,
      confettiAmount: 150,
      glowEffects: true
    },
    character: {
      enabled: true,
      type: 'emoji',
      image: "🐰", // Can be emoji or URL
      size: 120,
      position: 'center',
      floating: true,
      imageFit: 'contain',
      imageBorderRadius: 0,
      glow: true,
      glowIntensity: 20
    },
    button: {
      icon: "📱",
      size: 'large',
      cornerRadius: 9999,
      glow: true,
      pulse: true,
      hoverAnimation: true
    }
  },
  videoStage: {
    enabled: false,
    videoUrl: "",
    fileName: "",
    resolution: "Auto",
    aspectRatio: "Auto",
    resolutions: {}
  },
  sceneOrder: ["intro", "message", "balloons", "cake", "photos", "puzzle", "letter", "rules", "final"]
};

if (!fs.existsSync(CONFIG_FILE)) {
  const initialConfig = {
    ...defaultConfig,
    experienceId: Date.now().toString(36) + Math.random().toString(36).substring(2)
  };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(initialConfig, null, 2));
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files
app.use('/uploads', express.static(UPLOADS_DIR));

// Authentication Middleware
const authenticateAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// --- API ROUTES ---

app.post('/api/factory-reset', authenticateAdmin, (req, res) => {
  try {
    // Generate new experience ID to invalidate all client-side progress tied to the old ID
    const initialConfig = {
      ...defaultConfig,
      experienceId: Date.now().toString(36) + Math.random().toString(36).substring(2)
    };
    
    // Save default config
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(initialConfig, null, 2));
    
    // Clear uploads directory
    if (fs.existsSync(UPLOADS_DIR)) {
      const files = fs.readdirSync(UPLOADS_DIR);
      for (const file of files) {
        try { fs.unlinkSync(path.join(UPLOADS_DIR, file)); } catch (e) { console.error('Failed to delete upload file', e); }
      }
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('Factory reset failed:', err);
    res.status(500).json({ error: 'Factory reset failed' });
  }
});


app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const validUsername = process.env.ADMIN_USERNAME || 'indrajit';
  const validPassword = process.env.ADMIN_PASSWORD || 'indrajit123??';

  if (username === validUsername && password === validPassword) {
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.get('/api/config', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    // Ensure new scenes exist in existing config
    if (!config.puzzleScene) config.puzzleScene = defaultConfig.puzzleScene;
    if (!config.endScene) config.endScene = defaultConfig.endScene;
    if (!config.photoScene) config.photoScene = defaultConfig.photoScene;
    if (!config.friendshipRules) config.friendshipRules = defaultConfig.friendshipRules;
    if (!config.videoStage) config.videoStage = defaultConfig.videoStage;
    if (!config.experienceId) {
      config.experienceId = Date.now().toString(36) + Math.random().toString(36).substring(2);
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    }
    if (config.sceneOrder && !config.sceneOrder.includes('puzzle')) {
      const photosIndex = config.sceneOrder.indexOf('photos');
      if (photosIndex !== -1) {
        config.sceneOrder.splice(photosIndex + 1, 0, 'puzzle');
      } else {
        config.sceneOrder.push('puzzle');
      }
    }
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read config' });
  }
});

app.put('/api/config', authenticateAdmin, (req, res) => {
  try {
    const configStr = JSON.stringify(req.body, null, 2);
    fs.writeFileSync(CONFIG_FILE, configStr);

    // Sync to public directory for static Netlify exports
    try {
      const publicConfig = path.join(process.cwd(), 'public', 'config.json');
      const publicApiConfig = path.join(process.cwd(), 'public', 'api', 'config.json');
      if (fs.existsSync(path.dirname(publicConfig))) fs.writeFileSync(publicConfig, configStr);
      if (fs.existsSync(path.dirname(publicApiConfig))) fs.writeFileSync(publicApiConfig, configStr);
    } catch (e) {
      console.warn('Failed to mirror config to public directory', e);
    }

    res.json({ success: true, message: 'Configuration saved' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save config' });
  }
});

// Setup Multer for file uploads (supports images, audio, video up to 100MB)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }
});

app.post('/api/upload', authenticateAdmin, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  try {
    const publicUploadPath = path.join(process.cwd(), 'public', 'uploads', req.file.filename);
    fs.copyFileSync(req.file.path, publicUploadPath);
  } catch (e) {
    console.warn('Failed to mirror uploaded asset to public', e);
  }
  res.json({ url: fileUrl });
});


// --- VITE MIDDLEWARE & STATIC SERVING ---
async function startServer() {
  const server = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: { server }
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
