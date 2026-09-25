with open('src/components/Stage5Final.tsx', 'r') as f:
    content = f.read()

target = """    character: {
      enabled: true,
      image: "🐰",
      size: 120,
      position: 'center',
      floating: true
    },"""

replacement = """    character: {
      enabled: true,
      type: 'emoji' as const,
      image: "🐰",
      size: 120,
      position: 'center' as const,
      floating: true,
      imageFit: 'contain' as const,
      imageBorderRadius: 0,
      glow: true,
      glowIntensity: 20
    },"""

if target in content:
    content = content.replace(target, replacement)
    with open('src/components/Stage5Final.tsx', 'w') as f:
        f.write(content)
    print("Fixed Stage5Final default values.")
else:
    print("Target not found.")
