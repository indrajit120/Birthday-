const fs = require('fs');
let code = fs.readFileSync('src/admin/Dashboard.tsx', 'utf8');

code = code.replace(/<button[^>]*onClick=\{resetFriendshipRulesProgress\}[^>]*>[\s\S]*?<\/button>/g, '');
code = code.replace(/<button[^>]*onClick=\{resetPhotoPuzzleProgress\}[^>]*>[\s\S]*?<\/button>/g, '');

fs.writeFileSync('src/admin/Dashboard.tsx', code);
