const fs = require('fs');
let code = fs.readFileSync('src/admin/Dashboard.tsx', 'utf8');

code = code.replace(
  "if (!res.ok) throw new Error('Factory reset failed');",
  "if (!res.ok) {\n        const errText = await res.text();\n        throw new Error('Factory reset failed: ' + res.status + ' ' + errText);\n      }"
);

fs.writeFileSync('src/admin/Dashboard.tsx', code);
