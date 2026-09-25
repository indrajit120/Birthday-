with open('src/components/Stage3Message.tsx', 'r') as f:
    content = f.read()

target = """              <button
                onClick={onComplete}
                className="px-8 py-4 bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/50 text-pink-700 rounded-full font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                style={{
                  animation: 'pulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1)'
                }}
              >
                {config?.cakeScene?.continueButton || 'Continue →'}
              </button>"""

replacement = """              <motion.button
                onClick={onComplete}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{ y: [0, -5, 0] }}
                transition={{ 
                  y: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                }}
                className="px-8 py-4 bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/50 text-pink-700 rounded-full font-medium text-lg shadow-lg hover:shadow-xl transition-colors duration-300 flex items-center gap-2 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10">{config?.cakeScene?.continueButton || 'Continue →'}</span>
              </motion.button>"""

content = content.replace(target, replacement)

with open('src/components/Stage3Message.tsx', 'w') as f:
    f.write(content)
print("Updated animation")
