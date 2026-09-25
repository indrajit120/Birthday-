const fs = require('fs');
let code = fs.readFileSync('src/components/Stage1Intro.tsx', 'utf8');

// Fix MAX_PULL
code = code.replace(
  "const MAX_PULL = config?.slingshotSettings?.maxPull || 140;",
  "const MAX_PULL = (config?.slingshotSettings?.maxPull || 140) / bowScale;"
);

// Fix Gravity in launch
code = code.replace(
  "vel.current.vy += config?.slingshotSettings?.gravity || 0.8; // gravity",
  "const bowScale = config?.slingshotSettings?.bowScale || 1.0;\n        vel.current.vy += (config?.slingshotSettings?.gravity || 0.8) / bowScale; // gravity"
);

fs.writeFileSync('src/components/Stage1Intro.tsx', code);
