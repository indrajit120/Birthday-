const fs = require('fs');
let code = fs.readFileSync('src/admin/Dashboard.tsx', 'utf8');

code = code.replace(
  "const token = localStorage.getItem('admin_token');",
  ""
);

fs.writeFileSync('src/admin/Dashboard.tsx', code);
