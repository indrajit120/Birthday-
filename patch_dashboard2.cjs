const fs = require('fs');
let code = fs.readFileSync('src/admin/Dashboard.tsx', 'utf8');

// 1. Add "danger" tab
code = code.replace(
  "{ id: 'share', label: 'Share Settings' },",
  "{ id: 'share', label: 'Share Settings' },\n    { id: 'danger', label: 'Danger Zone' },"
);

// 2. Add Factory Reset functionality and modal state
code = code.replace(
  "const [showResetModal, setShowResetModal] = useState(false);",
  "const [showResetModal, setShowResetModal] = useState(false);\n  const [showFactoryResetModal, setShowFactoryResetModal] = useState(false);"
);

const factoryResetCode = `
  const factoryResetWebsite = async () => {
    try {
      // 1. Call server API to reset config and uploads
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/factory-reset', {
        method: 'POST',
        headers: {
          'Authorization': \`Bearer \${token}\`
        }
      });
      if (!res.ok) throw new Error('Factory reset failed');
      
      // 2. Clear local storage except admin token
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k !== 'admin_token') {
          localStorage.removeItem(k);
        }
      }
      
      alert("Factory reset complete.");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to factory reset website.");
    }
  };
`;

code = code.replace(
  "const resetEntireWebsiteProgress = () => {",
  factoryResetCode + "\n  const resetEntireWebsiteProgress = () => {"
);

// 3. Add Factory Reset Modal UI
const factoryResetModalUI = `
      {/* Factory Reset Modal */}
      {showFactoryResetModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Factory Reset Website?</h2>
            <p className="text-gray-600 mb-6">
              This will permanently reset ALL website settings, configuration, uploaded content, and user progress to the original default state.<br/><br/>
              This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowFactoryResetModal(false)}
                className="flex-1 py-3 px-4 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={factoryResetWebsite}
                className="flex-1 py-3 px-4 rounded-xl font-medium text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
              >
                Factory Reset
              </button>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(
  "{/* Main Content */}",
  factoryResetModalUI + "\n      {/* Main Content */}"
);

// 4. Add Danger Zone Tab UI
const dangerZoneUI = `
          {activeTab === 'danger' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section className="bg-white p-6 rounded-3xl shadow-sm border border-red-200">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-red-600">Danger Zone</h2>
                </div>
                <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                  <h3 className="text-red-800 font-bold mb-2">Factory Reset Website</h3>
                  <p className="text-red-600 text-sm mb-6">
                    This will permanently reset ALL website settings, configuration, uploaded content, and user progress to the original default state. This action cannot be undone.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowFactoryResetModal(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium text-sm transition-colors shadow-sm"
                  >
                    Factory Reset Website
                  </button>
                </div>
              </section>
            </div>
          )}
`;

code = code.replace(
  "          {activeTab === 'share' && (",
  dangerZoneUI + "\n          {activeTab === 'share' && ("
);

// 5. Change "Reset Entire Website" button text in top bar to avoid confusion
// The user asks to:
// "Do NOT remove or break: ... normal Reset Progress button"
// Actually I don't see anything explicitly asking to change the name, but let's just make sure both exist.
// Wait, the prompt says "Do NOT trigger factory reset from: ... normal Reset Progress button".
// The existing button says "Reset Entire Website". Let's leave it as is or rename to "Reset User Progress".
code = code.replace(
  "              Reset Entire Website\n            </button>",
  "              Reset User Progress\n            </button>"
);

fs.writeFileSync('src/admin/Dashboard.tsx', code);
