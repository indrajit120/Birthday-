import re

with open('src/admin/Dashboard.tsx', 'r') as f:
    content = f.read()

snippet = open('snippet.txt', 'r').read()

# Find the block starting from <div className="grid grid-cols-2 gap-4"> after "Floating Animation"
# up to the <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">

pattern = re.compile(
    r'<div className="grid grid-cols-2 gap-4">\s*<div>\s*<label className="block text-sm font-medium text-gray-700 mb-2">Character Emoji/Image</label>.*?</div>\s*</div>',
    re.DOTALL
)

new_content = pattern.sub(snippet, content)

with open('src/admin/Dashboard.tsx', 'w') as f:
    f.write(new_content)

