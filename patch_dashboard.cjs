const fs = require('fs');
let code = fs.readFileSync('src/admin/Dashboard.tsx', 'utf8');

const injection = `
                    <div>
                      <label className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                        <span>Bow to Heart Distance</span>
                        <span className="text-pink-500 font-bold">{localConfig.slingshotSettings.bowDistance || 0}px</span>
                      </label>
                      <input type="range" min="-250" max="250" step="5" value={localConfig.slingshotSettings.bowDistance || 0} onChange={e => updateConfig('slingshotSettings.bowDistance', parseInt(e.target.value))} className="w-full accent-pink-500" />
                    </div>
`;

code = code.replace(
  `                      <input type="range" min="0.5" max="2.5" step="0.1" value={localConfig.slingshotSettings.bowScale || 1.0} onChange={e => updateConfig('slingshotSettings.bowScale', parseFloat(e.target.value))} className="w-full accent-pink-500" />\n                    </div>`,
  `                      <input type="range" min="0.5" max="2.5" step="0.1" value={localConfig.slingshotSettings.bowScale || 1.0} onChange={e => updateConfig('slingshotSettings.bowScale', parseFloat(e.target.value))} className="w-full accent-pink-500" />\n                    </div>${injection}`
);

fs.writeFileSync('src/admin/Dashboard.tsx', code);
