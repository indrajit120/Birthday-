const fs = require('fs');

let code = fs.readFileSync('src/components/Stage4Photos.tsx', 'utf8');

code = code.replace(
  'const dt = now - lastTime.current;',
  'let dt = now - lastTime.current;\n      if (dt > 64) dt = 16.6; // Clamp dt to avoid huge jumps on tab switch'
);

fs.writeFileSync('src/components/Stage4Photos.tsx', code);
