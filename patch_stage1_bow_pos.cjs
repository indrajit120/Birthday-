const fs = require('fs');
let code = fs.readFileSync('src/components/Stage1Intro.tsx', 'utf8');

code = code.replace(
  '{/* Interactive Cupid Bow Area */}\n      <div className="relative z-10 mt-auto mb-20 w-full h-64 flex justify-center items-end pointer-events-none">',
  '{/* Interactive Cupid Bow Area */}\n      <div className="relative z-10 mt-auto mb-20 w-full h-64 flex justify-center items-end pointer-events-none" style={{ transform: \`translateY(\${config?.slingshotSettings?.bowDistance || 0}px)\` }}>'
);

fs.writeFileSync('src/components/Stage1Intro.tsx', code);
