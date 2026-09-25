const fs = require('fs');
let code = fs.readFileSync('src/admin/Dashboard.tsx', 'utf8');

code = code.replace(
  /if \(k && k !== 'admin_token' && \(k\.endsWith\(expId\) \|\| k\.includes\(expId\)\)\) \{/,
  "if (k && (k.startsWith('friendshipProgress_') || k.startsWith('puzzleProgress_')) && k.includes(expId)) {"
);

fs.writeFileSync('src/admin/Dashboard.tsx', code);
