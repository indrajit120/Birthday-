#!/bin/bash
cat << 'INNER_EOF' > snippet.txt
                    <div className="grid grid-cols-1 gap-6">
                      <div className="flex gap-4">
                        <button
                          onClick={() => updateConfig('endScene.character.type', 'emoji')}
                          className={`px-4 py-2 rounded-xl border text-sm font-medium ${localConfig.endScene?.character?.type === 'emoji' ? 'bg-pink-50 border-pink-500 text-pink-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                          Emoji Mode
                        </button>
                        <button
                          onClick={() => updateConfig('endScene.character.type', 'photo')}
                          className={`px-4 py-2 rounded-xl border text-sm font-medium ${localConfig.endScene?.character?.type === 'photo' ? 'bg-pink-50 border-pink-500 text-pink-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                          Photo Mode
                        </button>
                      </div>

                      {localConfig.endScene?.character?.type === 'emoji' ? (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Character Emoji</label>
                            <input type="text" value={localConfig.endScene?.character?.image || '🐰'} onChange={e => updateConfig('endScene.character.image', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" placeholder="e.g. 🐰 ❤️ 🎂" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Character Size (px)</label>
                            <input type="number" value={localConfig.endScene?.character?.size || 120} onChange={e => updateConfig('endScene.character.size', parseInt(e.target.value))} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
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
                                  handleFileUpload(e.target.files[0], 'endScene.character.image');
                                }
                              }}
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                            />
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Size (px)</label>
                              <input type="number" value={localConfig.endScene?.character?.size || 120} onChange={e => updateConfig('endScene.character.size', parseInt(e.target.value))} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Image Fit</label>
                              <select value={localConfig.endScene?.character?.imageFit || 'contain'} onChange={e => updateConfig('endScene.character.imageFit', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none bg-white">
                                <option value="contain">Contain (Keep Ratio)</option>
                                <option value="cover">Cover (Fill Space)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Border Radius (px)</label>
                              <input type="number" value={localConfig.endScene?.character?.imageBorderRadius || 0} onChange={e => updateConfig('endScene.character.imageBorderRadius', parseInt(e.target.value))} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Glow Intensity</label>
                              <input type="number" value={localConfig.endScene?.character?.glowIntensity || 20} onChange={e => updateConfig('endScene.character.glowIntensity', parseInt(e.target.value))} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                            </div>
                          </div>
                          
                          <label className="flex items-center gap-2 cursor-pointer mt-2">
                            <input type="checkbox" checked={localConfig.endScene?.character?.glow ?? true} onChange={e => updateConfig('endScene.character.glow', e.target.checked)} className="rounded text-pink-500 focus:ring-pink-500" />
                            <span className="text-sm font-medium text-gray-700">Image Soft Glow</span>
                          </label>
                        </div>
                      )}
                    </div>
INNER_EOF
