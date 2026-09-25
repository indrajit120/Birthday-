const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "fs.unlinkSync(path.join(UPLOADS_DIR, file));",
  "try { fs.unlinkSync(path.join(UPLOADS_DIR, file)); } catch (e) { console.error('Failed to delete upload file', e); }"
);

fs.writeFileSync('server.ts', code);
