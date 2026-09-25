import re

with open('src/components/Stage5Final.tsx', 'r') as f:
    content = f.read()

snippet = """
      {onComplete && (
        <motion.button
          onClick={onComplete}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: [0, -5, 0] }}
          transition={{ 
            opacity: { delay: 1.5, duration: 0.8 },
            y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 px-6 py-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 shadow-[0_4px_15px_rgba(0,0,0,0.1)] text-white font-semibold tracking-wide text-sm sm:text-base z-20 cursor-pointer transition-colors"
        >
          Continue <span className="text-lg leading-none">→</span>
        </motion.button>
      )}
    </motion.div>
  );
}
"""

content = content.replace("    </motion.div>\n  );\n}", snippet)

with open('src/components/Stage5Final.tsx', 'w') as f:
    f.write(content)

