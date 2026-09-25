with open('src/admin/Dashboard.tsx', 'r') as f:
    content = f.read()

snippet = open('snippet.txt', 'r').read()

import re
pattern = re.compile(
    r'<div className="grid grid-cols-2 gap-4">\s*<div>\s*<label className="block text-sm font-medium text-gray-700 mb-2">Character Emoji/Image</label>.*?</div>\s*</div>',
    re.DOTALL
)

match = pattern.search(content)
if match:
    new_content = content[:match.start()] + snippet + content[match.end():]
    with open('src/admin/Dashboard.tsx', 'w') as f:
        f.write(new_content)
    print("Replaced successfully")
else:
    print("Pattern not found")

