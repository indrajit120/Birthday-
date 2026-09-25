const fs = require('fs');
let code = fs.readFileSync('src/components/Stage1Intro.tsx', 'utf8');

// The text block
const textBlock = `            <motion.div
                className="absolute bottom-[-70px] left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-[0.2em] uppercase text-pink-500 opacity-90 whitespace-nowrap"
               animate={{ opacity: isDraggingState ? 0 : 0.9, y: isDraggingState ? 10 : 0 }}
            >
               {interpolate(config?.instructionText || 'Pull to release love')}
            </motion.div>`;

code = code.replace(textBlock, '');

// Insert it right after the closing of the w-0 h-0 div
code = code.replace(
  `         </div>\n      </div>`,
  `         </div>\n${textBlock}\n      </div>`
);

fs.writeFileSync('src/components/Stage1Intro.tsx', code);
