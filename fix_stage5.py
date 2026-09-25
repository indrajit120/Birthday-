import re

with open('src/components/Stage5Final.tsx', 'r') as f:
    content = f.read()

snippet = open('snippet_stage5.txt', 'r').read()

pattern = re.compile(
    r'\{endScene\.character\?\.enabled && \(\s*<motion\.div.*?</motion\.div>\s*\)\}',
    re.DOTALL
)

match = pattern.search(content)
if match:
    new_content = content[:match.start()] + snippet.strip() + content[match.end():]
    with open('src/components/Stage5Final.tsx', 'w') as f:
        f.write(new_content)
    print("Replaced successfully")
else:
    print("Pattern not found")

