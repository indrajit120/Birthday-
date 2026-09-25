const fs = require('fs');
let code = fs.readFileSync('src/contexts/ConfigContext.tsx', 'utf8');

if (!code.includes('photoScene?: {')) {
  code = code.replace(
    '  shareSettings: {',
    `  photoScene?: {
    heading: string;
    subtitle: string;
  };
  shareSettings: {`
  );
}
fs.writeFileSync('src/contexts/ConfigContext.tsx', code);
