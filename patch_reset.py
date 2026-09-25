with open('src/admin/Dashboard.tsx', 'r') as f:
    content = f.read()

target = """            <button
              onClick={() => {
                if (globalConfig) setLocalConfig(JSON.parse(JSON.stringify(globalConfig)));
              }}
              disabled={saving}
              className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm disabled:opacity-70"
            >
              <RefreshCw size={18} /> Reset
            </button>"""

replacement = """            <button
              onClick={() => {
                if (globalConfig) {
                  setLocalConfig(JSON.parse(JSON.stringify(globalConfig)));
                  setPendingCharacterPhoto(null);
                  setCharacterPhotoPreview(null);
                }
              }}
              disabled={saving}
              className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm disabled:opacity-70"
            >
              <RefreshCw size={18} /> Reset
            </button>"""

if target in content:
    content = content.replace(target, replacement)
    with open('src/admin/Dashboard.tsx', 'w') as f:
        f.write(content)
    print("Replaced reset")
else:
    print("Target not found")
