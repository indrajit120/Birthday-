with open('src/components/Stage5Final.tsx', 'r') as f:
    content = f.read()

target = """  const sparkles = useMemo(() => Array.from({ length: Math.floor(25 * mult) }).map((_, i) => ({
    id: `s-${i}`, x: Math.random() * 100, y: Math.random() * 100, size: Math.random() * 4 + 2, duration: Math.random() * 4 + 2, delay: Math.random() * 5
  })), [mult]);"""

replacement = """  const sparkles = useMemo(() => Array.from({ length: Math.floor(25 * mult) }).map((_, i) => ({
    id: `s-${i}`, x: Math.random() * 100, y: Math.random() * 100, size: Math.random() * 4 + 2, duration: Math.random() * 4 + 2, delay: Math.random() * 5
  })), [mult]);

  const petals = useMemo(() => Array.from({ length: Math.floor(10 * mult) }).map((_, i) => ({
    id: `petal-${i}`, x: Math.random() * 100, y: Math.random() * 100, size: Math.random() * 6 + 4, duration: Math.random() * 15 + 10, delay: Math.random() * 10
  })), [mult]);"""

if target in content:
    content = content.replace(target, replacement)
else:
    print("Target 1 not found")

target2 = """      {animations.sparkles && sparkles.map(p => (
        <motion.div key={p.id} className="absolute text-yellow-100/60" style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5], rotate: [0, 90] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          {parseInt(p.id.split('-')[1]) % 2 === 0 ? <Sparkles /> : <Star fill="currentColor" stroke="none" />}
        </motion.div>
      ))}"""

replacement2 = """      {animations.sparkles && sparkles.map(p => (
        <motion.div key={p.id} className="absolute text-yellow-100/60" style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5], rotate: [0, 90] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          {parseInt(p.id.split('-')[1]) % 2 === 0 ? <Sparkles /> : <Star fill="currentColor" stroke="none" />}
        </motion.div>
      ))}

      {animations.floatingParticles && petals.map(p => (
        <motion.div key={p.id} className="absolute text-pink-200/50" style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, 100], x: [0, Math.random() * 40 - 20, 0], opacity: [0, 0.8, 0], rotate: [0, 360] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className="w-full h-full">
            <path d="M12 2C8 2 4 6 4 12C4 18 8 22 12 22C16 22 20 18 20 12C20 6 16 2 12 2Z" style={{transform: "scale(1, 0.5) rotate(45deg)", transformOrigin: "center"}} />
          </svg>
        </motion.div>
      ))}"""

if target2 in content:
    content = content.replace(target2, replacement2)
else:
    print("Target 2 not found")

with open('src/components/Stage5Final.tsx', 'w') as f:
    f.write(content)
print("Updated Stage5Final with flower petals!")
