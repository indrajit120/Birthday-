with open('src/components/Stage3Message.tsx', 'r') as f:
    content = f.read()

target = """    <motion.div 
      className="absolute inset-0 z-30 overflow-y-auto flex flex-col p-6 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1 } }}
    >
      <div className="fixed inset-0 bg-white/20 backdrop-blur-sm pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center gap-6 m-auto w-full max-w-2xl py-12">"""

replacement = """    <motion.div 
      className="absolute inset-0 z-30 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1 } }}
    >
      <div className="fixed inset-0 bg-white/20 backdrop-blur-sm pointer-events-none" />
      
      <div className="relative z-10 min-h-full grid place-items-center p-6 text-center">
        <div className="flex flex-col items-center gap-6 w-full max-w-2xl py-12">"""

content = content.replace(target, replacement)

# Need to close the extra div
target2 = """      </div>
    </motion.div>"""
replacement2 = """        </div>
      </div>
    </motion.div>"""

content = content.replace(target2, replacement2)

with open('src/components/Stage3Message.tsx', 'w') as f:
    f.write(content)
print("Updated Stage3Message layout")
