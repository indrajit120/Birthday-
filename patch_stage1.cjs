const fs = require('fs');
let code = fs.readFileSync('src/components/Stage1Intro.tsx', 'utf8');

const bowScale = "const bowScale = config?.slingshotSettings?.bowScale || 1.0;";

code = code.replace(
  "const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {\n     if (!isDragging.current) return;\n     \n     const dx = e.clientX - startPos.current.x;\n     const dy = e.clientY - startPos.current.y;",
  "const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {\n     if (!isDragging.current) return;\n     \n     const bowScale = config?.slingshotSettings?.bowScale || 1.0;\n     const dx = (e.clientX - startPos.current.x) / bowScale;\n     const dy = (e.clientY - startPos.current.y) / bowScale;"
);

code = code.replace(
  /<div className="relative w-0 h-0">/,
  `<div className="relative w-0 h-0" style={{ transform: \`scale(\${config?.slingshotSettings?.bowScale || 1.0})\` }}>`
);

// We need to also adjust checkCollision distance since the projectile's bounding rect will be scaled, 
// and its internal px/py calculations use getBoundingClientRect which is correct in screen space.
// Wait, getBoundingClientRect returns the actual screen space coordinates! So collision logic will still work exactly the same!

fs.writeFileSync('src/components/Stage1Intro.tsx', code);
