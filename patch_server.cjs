const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const endpointCode = `
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
        fs.unlinkSync(path.join(UPLOADS_DIR, file));
      }
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('Factory reset failed:', err);
    res.status(500).json({ error: 'Factory reset failed' });
  }
});
`;

code = code.replace(
  "// --- API ROUTES ---",
  "// --- API ROUTES ---\n" + endpointCode
);

fs.writeFileSync('server.ts', code);
