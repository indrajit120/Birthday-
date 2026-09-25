with open('src/components/Stage5Final.tsx', 'r') as f:
    content = f.read()

# Replace the existing absolute button block and the closing tags of max-w-sm
target = """
          <p 
            className="text-sm font-medium mt-3"
            style={{ color: endScene.colors?.helperText }}
          >
            {interpolate(endScene.helperText)}
          </p>
        </motion.div>
      </div>

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

replacement = """
          <p 
            className="text-sm font-medium mt-3"
            style={{ color: endScene.colors?.helperText }}
          >
            {interpolate(endScene.helperText)}
          </p>
        </motion.div>

        {onComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="mt-4 w-full flex justify-center"
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
}
"""

if target in content:
    content = content.replace(target, replacement)
    with open('src/components/Stage5Final.tsx', 'w') as f:
        f.write(content)
    print("Fixed.")
else:
    print("Target not found. Let's try replacing with regex.")
    
