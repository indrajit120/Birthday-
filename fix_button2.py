import re

with open('src/components/Stage5Final.tsx', 'r') as f:
    content = f.read()

pattern = re.compile(
    r'\{interpolate\(endScene\.helperText\)\}\s*</p>\s*</motion\.div>\s*</div>\s*\{onComplete && \(\s*<motion\.button.*?</motion\.button>\s*\)\}\s*</motion\.div>\s*\);\s*\}',
    re.DOTALL
)

replacement = """{interpolate(endScene.helperText)}
          </p>
        </motion.div>

        {onComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="mt-6 w-full flex justify-center"
          >
            <motion.button
              onClick={onComplete}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 shadow-[0_4px_15px_rgba(0,0,0,0.1)] text-white font-semibold tracking-wide text-sm sm:text-base z-20 cursor-pointer transition-colors"
            >
              Continue <span className="text-lg leading-none">→</span>
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}"""

match = pattern.search(content)
if match:
    new_content = content[:match.start()] + replacement + content[match.end():]
    with open('src/components/Stage5Final.tsx', 'w') as f:
        f.write(new_content)
    print("Replaced with regex.")
else:
    print("Still not found.")
