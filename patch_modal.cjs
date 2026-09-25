const fs = require('fs');
let code = fs.readFileSync('src/admin/Dashboard.tsx', 'utf8');

// 1. Add state
code = code.replace(
  /const \[characterPhotoPreview, setCharacterPhotoPreview\] = useState<string \| null>\(null\);/,
  "const [characterPhotoPreview, setCharacterPhotoPreview] = useState<string | null>(null);\n  const [showResetModal, setShowResetModal] = useState(false);"
);

// 2. Change resetEntireWebsiteProgress and add confirmReset
const oldReset = `  const resetEntireWebsiteProgress = () => {
    if (window.confirm('Reset the entire website?\\n\\nAll user progress will be erased and the experience will start from the beginning.\\n\\nAdmin settings, photos, music and uploaded content will remain unchanged.\\n\\nContinue?')) {
      const expId = getExpId();
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('friendshipProgress_') || k.startsWith('puzzleProgress_')) && k.includes(expId)) {
          localStorage.removeItem(k);
        }
      }
      window.dispatchEvent(
        new CustomEvent("entire-website-progress-reset", {
          detail: { experienceId: expId }
        })
      );
      window.location.reload();
    }
  };`;

const newReset = `  const resetEntireWebsiteProgress = () => {
    setShowResetModal(true);
  };

  const confirmReset = () => {
    const expId = getExpId();
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('friendshipProgress_') || k.startsWith('puzzleProgress_')) && k.includes(expId)) {
        localStorage.removeItem(k);
      }
    }
    window.dispatchEvent(
      new CustomEvent("entire-website-progress-reset", {
        detail: { experienceId: expId }
      })
    );
    setShowResetModal(false);
    window.location.reload();
  };`;

code = code.replace(oldReset, newReset);

// 3. Add Modal JSX at the end of the return statement
const oldReturnEnd = `    </div>
  );
}`;

const newReturnEnd = `      {showResetModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reset the entire website?</h3>
            <p className="text-gray-600 mb-4 whitespace-pre-line">
              All user progress will be erased and the experience will start from the beginning.
              
              Admin settings, photos, music and uploaded content will remain unchanged.
              
              Continue?
            </p>
            <div className="flex gap-3 justify-end mt-8">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-5 py-2.5 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmReset}
                className="px-5 py-2.5 rounded-xl font-medium text-white bg-red-500 hover:bg-red-600 shadow-sm transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;

code = code.replace(oldReturnEnd, newReturnEnd);

fs.writeFileSync('src/admin/Dashboard.tsx', code);
