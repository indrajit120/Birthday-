with open('src/components/Stage3Message.tsx', 'r') as f:
    content = f.read()

target = """    const t1 = setTimeout(() => setStep(1), 800);
    const t2 = setTimeout(() => setStep(2), 2500);
    const t3 = setTimeout(() => setStep(3), 4500);
    const t4 = setTimeout(() => onComplete(), 8000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };"""

replacement = """    const t1 = setTimeout(() => setStep(1), 800);
    const t2 = setTimeout(() => setStep(2), 2500);
    const t3 = setTimeout(() => setStep(3), 4500);
    const t4 = setTimeout(() => setStep(4), 6500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };"""

content = content.replace(target, replacement)

target2 = """    <motion.div 
      className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1 } }}
    >
      <div className="absolute inset-0 bg-white/20 backdrop-blur-sm pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center gap-6">"""

replacement2 = """    <motion.div 
      className="absolute inset-0 z-30 overflow-y-auto flex flex-col p-6 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1 } }}
    >
      <div className="fixed inset-0 bg-white/20 backdrop-blur-sm pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center gap-6 m-auto w-full max-w-2xl py-12">"""

content = content.replace(target2, replacement2)

target3 = """              {interpolate(config?.subtitle)}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>"""

replacement3 = """              {interpolate(config?.subtitle)}
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {step >= 4 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 pt-4 w-full flex justify-center"
            >
              <button
                onClick={onComplete}
                className="px-8 py-4 bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/50 text-pink-700 rounded-full font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                style={{
                  animation: 'pulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1)'
                }}
              >
                {config?.cakeScene?.continueButton || 'Continue →'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>"""

content = content.replace(target3, replacement3)

with open('src/components/Stage3Message.tsx', 'w') as f:
    f.write(content)
print("Updated Stage3Message")
