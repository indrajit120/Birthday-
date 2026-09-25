with open('src/components/Stage3Message.tsx', 'r') as f:
    content = f.read()

target = "const t4 = setTimeout(() => onComplete(), 8000);"
replacement = "const t4 = setTimeout(() => setStep(4), 6500);"

if target in content:
    content = content.replace(target, replacement)
    with open('src/components/Stage3Message.tsx', 'w') as f:
        f.write(content)
    print("Fixed t4 timeout")
else:
    print("Target not found")
