const fs = require('fs');

let code = fs.readFileSync('src/admin/Dashboard.tsx', 'utf8');

// The friendship rules reset button block
const btn1 = `                   <div className="flex justify-between items-center mb-6">
                     <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                       <span>🤝</span> Friendship Rules Config
                     </h2>
                     <button
                       type="button"
                       onClick={resetFriendshipRulesProgress}
                       className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-bold shadow hover:bg-red-600 transition-colors"
                     >
                       Reset Friendship Rules Progress
                     </button>
                   </div>`;

const rep1 = `                   <div className="flex justify-between items-center mb-6">
                     <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                       <span>🤝</span> Friendship Rules Config
                     </h2>
                   </div>`;

// The photo puzzle reset button block
const btn2 = `                   <div className="flex justify-between items-center mb-6">
                     <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                       <span>🧩</span> Photo Puzzle Config
                     </h2>
                     <button
                       type="button"
                       onClick={resetPhotoPuzzleProgress}
                       className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-bold shadow hover:bg-red-600 transition-colors"
                     >
                       Reset Photo Puzzle Progress
                     </button>
                   </div>`;

const rep2 = `                   <div className="flex justify-between items-center mb-6">
                     <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                       <span>🧩</span> Photo Puzzle Config
                     </h2>
                   </div>`;

code = code.split(btn1).join(rep1);
code = code.split(btn2).join(rep2);

fs.writeFileSync('src/admin/Dashboard.tsx', code);
