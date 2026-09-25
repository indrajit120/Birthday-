const fs = require('fs');
let code = fs.readFileSync('src/admin/Dashboard.tsx', 'utf8');

const targetStr = `<section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-gray-800">Photo Slideshow</h2>`;

const replacement = `<section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
                 <h2 className="text-lg font-bold mb-6 text-gray-800">Gallery Text</h2>
                 <div className="space-y-4">
                    <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-2">Heading</label>
                       <input 
                         type="text" 
                         value={localConfig.photoScene?.heading || 'A walk down memory lane'} 
                         onChange={e => updateConfig('photoScene.heading', e.target.value)} 
                         className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-shadow"
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-2">Subtitle</label>
                       <textarea 
                         value={localConfig.photoScene?.subtitle || 'Every moment with you is my favorite memory. ❤️'} 
                         onChange={e => updateConfig('photoScene.subtitle', e.target.value)} 
                         className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-shadow min-h-[80px]"
                       />
                    </div>
                 </div>
               </section>

               <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-gray-800">Photo Slideshow</h2>`;

code = code.replace(targetStr, replacement);
fs.writeFileSync('src/admin/Dashboard.tsx', code);
