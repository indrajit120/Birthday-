import re

with open('src/admin/Dashboard.tsx', 'r') as f:
    content = f.read()

target = """                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Character Photo</label>
                            {localConfig.endScene?.character?.image && !localConfig.endScene?.character?.image.match(/^[^\x00-\x7F]+$/) && localConfig.endScene.character.image.length > 2 && (
                              <div className="mb-3 relative w-32 h-32 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                                <img src={localConfig.endScene.character.image} className="w-full h-full object-cover" />
                                <button
                                  onClick={() => updateConfig('endScene.character.image', '')}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                >
                                  ×
                                </button>
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/png, image/jpeg, image/webp"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleFileUpload(e, 'endScene.character.image');
                                }
                              }}
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                            />
                          </div>"""

replacement = """                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Character Photo</label>
                            {(characterPhotoPreview || (localConfig.endScene?.character?.image && !localConfig.endScene?.character?.image.match(/^[^\x00-\x7F]+$/) && localConfig.endScene.character.image.length > 2)) && (
                              <div className="mb-3 relative w-32 h-32 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                                <img src={characterPhotoPreview || localConfig.endScene.character.image} className="w-full h-full object-cover" />
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
                            )}
                            <input
                              type="file"
                              accept="image/png, image/jpeg, image/webp"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  const file = e.target.files[0];
                                  setPendingCharacterPhoto(file);
                                  setCharacterPhotoPreview(URL.createObjectURL(file));
                                  // Set a temporary value so the UI knows an image is present
                                  // but don't overwrite if not needed, or just let preview handle it.
                                }
                              }}
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                            />
                          </div>"""

if target in content:
    content = content.replace(target, replacement)
    with open('src/admin/Dashboard.tsx', 'w') as f:
        f.write(content)
    print("Replaced character photo UI")
else:
    print("Target not found")
