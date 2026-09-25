import re

with open('src/admin/Dashboard.tsx', 'r') as f:
    content = f.read()

pattern = re.compile(
    r'<div>\s*<label className="block text-sm font-medium text-gray-700 mb-2">Character Photo</label>.*?<div className="grid grid-cols-2 md:grid-cols-4 gap-4">',
    re.DOTALL
)

replacement = """<div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Character Photo</label>
                            {(characterPhotoPreview || (localConfig.endScene?.character?.image && !localConfig.endScene?.character?.image.match(/^[^\\x00-\\x7F]+$/) && localConfig.endScene.character.image.length > 2)) ? (
                              <div className="mb-3 relative w-32 h-32 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                                <img src={characterPhotoPreview || localConfig.endScene!.character!.image} className="w-full h-full object-cover" />
                                <button
                                  onClick={() => {
                                    setPendingCharacterPhoto(null);
                                    setCharacterPhotoPreview(null);
                                    updateConfig('endScene.character.image', '');
                                  }}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                >
                                  ×
                                </button>
                              </div>
                            ) : null}
                            <input
                              type="file"
                              accept="image/png, image/jpeg, image/webp"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  const file = e.target.files[0];
                                  setPendingCharacterPhoto(file);
                                  setCharacterPhotoPreview(URL.createObjectURL(file));
                                }
                              }}
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                            />
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">"""

match = pattern.search(content)
if match:
    new_content = content[:match.start()] + replacement + content[match.end():]
    with open('src/admin/Dashboard.tsx', 'w') as f:
        f.write(new_content)
    print("Fixed mess")
else:
    print("Not found")
