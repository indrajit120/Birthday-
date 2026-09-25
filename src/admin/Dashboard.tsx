import React, { useState, useEffect } from 'react';
import { useConfig, BirthdayConfig } from '../contexts/ConfigContext';
import { DEFAULT_CONFIG } from '../contexts/defaultConfig';
import { LogOut, Save, Eye, Upload, Plus, Trash2, GripVertical, CheckCircle2, Film, Video } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { CakeScene3D } from '../components/StageCake';
import * as THREE from 'three';

const CAKE_PRESETS: Record<string, Partial<BirthdayConfig['cakeScene']>> = {
  'romantic-pink': {
    flavour: 'romantic-pink',
    spongeColor: '#f9dce2',
    frostingColor: '#ffe4ea',
    dripColor: '#ff85a1',
    creamColor: '#ffffff',
    flowerColor: '#ff6b8b',
    heartColor: '#ff477e',
    pearlColor: '#ffd1dc',
    platformColor: '#fff0f3',
    backgroundColor: '#fff0f3'
  },
  'elegant-white': {
    flavour: 'elegant-white',
    spongeColor: '#f8f9fa',
    frostingColor: '#ffffff',
    dripColor: '#e9ecef',
    creamColor: '#ffffff',
    flowerColor: '#ffffff',
    heartColor: '#dee2e6',
    pearlColor: '#adb5bd',
    platformColor: '#f8f9fa',
    backgroundColor: '#f8f9fa'
  },
  'chocolate-luxury': {
    flavour: 'chocolate-luxury',
    spongeColor: '#3a2012',
    frostingColor: '#2b1408',
    dripColor: '#1a0b04',
    creamColor: '#4a2c1a',
    flowerColor: '#8b5a2b',
    heartColor: '#4a2c1a',
    pearlColor: '#ffd700',
    platformColor: '#f5deb3',
    backgroundColor: '#fdf5e6'
  },
  'strawberry-love': {
    flavour: 'strawberry-love',
    spongeColor: '#ffc2d1',
    frostingColor: '#ffb3c6',
    dripColor: '#ff5c8a',
    creamColor: '#ffe5ec',
    flowerColor: '#ff7eb3',
    heartColor: '#ff0a54',
    pearlColor: '#ffc84d',
    platformColor: '#ffe6ea',
    backgroundColor: '#fff0f3'
  },
  'vanilla-classic': {
    flavour: 'vanilla-classic',
    spongeColor: '#ffecb3',
    frostingColor: '#fffde7',
    dripColor: '#fff9c4',
    creamColor: '#ffffff',
    flowerColor: '#ffffff',
    heartColor: '#ffd54f',
    pearlColor: '#ffd700',
    platformColor: '#fff8e1',
    backgroundColor: '#fffde7'
  }
};

const uploadFileSafely = async (file: File, authToken: string): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` },
      body: formData
    });
    const ct = res.headers.get('content-type');
    if (res.ok && ct?.includes('application/json')) {
      const data = await res.json();
      if (data.url) return data.url;
    }
  } catch (e) {
    console.warn('Server upload failed, converting to local data URL', e);
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function Dashboard({ setToken, token }: { setToken: (t: string | null) => void, token: string }) {
  const { config: globalConfig, refreshConfig, updateConfigLocally } = useConfig();
  const [localConfig, setLocalConfig] = useState<BirthdayConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [photoToDelete, setPhotoToDelete] = useState<number | null>(null);
  const [pendingCharacterPhoto, setPendingCharacterPhoto] = useState<File | null>(null);
  const [characterPhotoPreview, setCharacterPhotoPreview] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showFactoryResetModal, setShowFactoryResetModal] = useState(false);
  const [videoUpdatedMessage, setVideoUpdatedMessage] = useState(false);

  useEffect(() => {
    if (globalConfig) {
      const cloned = JSON.parse(JSON.stringify(globalConfig));
      if (!cloned.puzzleScene) {
        cloned.puzzleScene = {
          enabled: true,
          roomLabel: "ROOM 4 · THE RESTORATION DESK",
          title: "This photo fell apart.",
          instructions: "Put the pieces back in order. Tap two pieces to swap them, or drag one where you want it.",
          image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=800",
          gridSize: 3,
          completionTitle: "SOLVED!",
          completionMessage: "You put us back together.",
          completionButtonText: "Continue",
          enablePeek: true,
          enableTimer: true,
          enableMoveCounter: true,
          backgroundColor: "#fff0f3",
          textColor: "#333333"
        };
      }
      if (!cloned.videoStage) {
        cloned.videoStage = {
          enabled: false,
          videoUrl: "",
          fileName: "",
          resolution: 'Auto',
          aspectRatio: 'Auto',
          resolutions: {}
        };
      } else if (!cloned.videoStage.aspectRatio) {
        cloned.videoStage.aspectRatio = 'Auto';
      }
      setLocalConfig(cloned);
    }
  }, [globalConfig]);

  const handleSave = async (andPreview = false) => {
    if (!localConfig) return;

    if (!localConfig.name || localConfig.name.trim() === '') {
      alert("Recipient Name cannot be empty.");
      return;
    }

    let payload = JSON.parse(JSON.stringify(localConfig));
    if (!payload.experienceId) {
      payload.experienceId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    setSaving(true);
    try {
      if (pendingCharacterPhoto) {
        const uploadUrl = await uploadFileSafely(pendingCharacterPhoto, token);
        payload.endScene.character.image = uploadUrl;
        setPendingCharacterPhoto(null);
        setCharacterPhotoPreview(null);
      }

      try {
        await fetch('/api/config', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } catch (e) {
        console.warn('Backend save unavailable, persisting to client storage', e);
      }

      updateConfigLocally(payload);
      await refreshConfig();
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      if (andPreview) {
        window.open('/', '_blank');
      }
    } catch (err) {
      alert('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string, index?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileUrl = await uploadFileSafely(file, token);
      if (field === 'song') {
        updateConfig('song', fileUrl);
      } else if (field === 'photos' && index !== undefined) {
        const newPhotos = [...localConfig!.photos];
        newPhotos[index] = fileUrl;
        updateConfig('photos', newPhotos);
      } else if (field === 'photos_new') {
        updateConfig('photos', [...localConfig!.photos, fileUrl]);
      } else if (field === 'endScene.character.image') {
        updateConfig('endScene.character.image', fileUrl);
      }
    } catch (err) {
      alert('Upload failed');
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|m4v)$/i.test(file.name);
    if (!isVideo) {
      alert("Unsupported video format. Please upload an MP4, WebM, or MOV video.");
      return;
    }

    try {
      const fileUrl = await uploadFileSafely(file, token);
      if (fileUrl) {
        updateConfig('videoStage.videoUrl', fileUrl);
        updateConfig('videoStage.fileName', file.name);
        setVideoUpdatedMessage(true);
        setTimeout(() => setVideoUpdatedMessage(false), 5000);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to upload video');
    }
  };

  const getExpId = () => {
    return globalConfig?.experienceId || localConfig?.experienceId || (globalConfig ? btoa(encodeURIComponent(`${globalConfig.name}-${globalConfig.senderName}`)) : 'default');
  };

  
  const factoryResetWebsite = async () => {
    try {
      // 1. Call server API to reset config and uploads
      
      const res = await fetch('/api/factory-reset', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error('Factory reset failed: ' + res.status + ' ' + errText);
      }
      
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

  const resetEntireWebsiteProgress = () => {
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
  };

    const updateConfig = (key: string, value: any) => {
    setLocalConfig(prev => {
      if (!prev) return prev;
      const keys = key.split('.');
      if (keys.length === 1) return { ...prev, [key]: value };
      
      const newConfig = JSON.parse(JSON.stringify(prev));
      let current: any = newConfig;
      for (let i = 0; i < keys.length - 1; i++) {
        if (current[keys[i]] === undefined || current[keys[i]] === null) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  };

  if (!localConfig) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  const tabs = [
    { id: 'general', label: 'General & Details' },
    { id: 'intro', label: 'Hero / Intro' },
    { id: 'video', label: 'Video Stage' },
    { id: 'slingshot', label: 'Slingshot & Hearts' },
    { id: 'message', label: 'Messages' },
    { id: 'balloons', label: 'Balloon Messages' },
    { id: 'cake', label: 'Cake & Sequence' },
    { id: 'cake-design', label: 'Cake Customization' },
    { id: 'media', label: 'Photos & Music' },
    { id: 'puzzle', label: 'Photo Puzzle' },
    { id: 'rules', label: 'Friendship Rules' },
    { id: 'end', label: 'End Screen' },
    { id: 'share', label: 'Share Settings' },
    { id: 'danger', label: 'Danger Zone' },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white border-r border-gray-200 shrink-0">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <p className="text-xs text-pink-500 uppercase tracking-widest mt-1">Management</p>
        </div>
        <nav className="p-4 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab.id ? 'bg-pink-50 text-pink-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        {/* Topbar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm disabled:opacity-70"
            >
              <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm disabled:opacity-70"
            >
              <Eye size={18} /> Save & Preview
            </button>
            <button
              type="button"
              onClick={resetEntireWebsiteProgress}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm"
            >
              Reset User Progress
            </button>
          </div>
          
          <button
            onClick={() => setToken(null)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 md:p-10 max-w-4xl">
          {activeTab === 'general' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-gray-800">General Settings</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Name</label>
                    <input type="text" value={localConfig.name} onChange={e => updateConfig('name', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sender Name</label>
                    <input type="text" value={localConfig.senderName} onChange={e => updateConfig('senderName', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age Turning</label>
                    <input type="number" value={localConfig.age} onChange={e => updateConfig('age', parseInt(e.target.value))} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Background Start Color</label>
                    <div className="flex gap-2">
                       <input type="color" value={localConfig.colors.bgStart} onChange={e => updateConfig('colors.bgStart', e.target.value)} className="h-10 w-12 rounded cursor-pointer" />
                       <input type="text" value={localConfig.colors.bgStart} onChange={e => updateConfig('colors.bgStart', e.target.value)} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Background End Color</label>
                    <div className="flex gap-2">
                       <input type="color" value={localConfig.colors.bgEnd} onChange={e => updateConfig('colors.bgEnd', e.target.value)} className="h-10 w-12 rounded cursor-pointer" />
                       <input type="text" value={localConfig.colors.bgEnd} onChange={e => updateConfig('colors.bgEnd', e.target.value)} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Heart Primary Color</label>
                    <div className="flex gap-2">
                       <input type="color" value={localConfig.colors.heartPink} onChange={e => updateConfig('colors.heartPink', e.target.value)} className="h-10 w-12 rounded cursor-pointer" />
                       <input type="text" value={localConfig.colors.heartPink} onChange={e => updateConfig('colors.heartPink', e.target.value)} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold mb-6 text-gray-800">Final Letter Animation Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-gray-800">Cute Animals</h4>
                      <p className="text-xs text-gray-500">Butterflies, bunnies, birds</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={localConfig.letterScene?.enableAnimals ?? true} onChange={e => updateConfig('letterScene.enableAnimals', e.target.checked)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-gray-800">Floating Hearts</h4>
                      <p className="text-xs text-gray-500">Subtle floating heart particles</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={localConfig.letterScene?.enableHearts ?? true} onChange={e => updateConfig('letterScene.enableHearts', e.target.checked)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-gray-800">Sparkles</h4>
                      <p className="text-xs text-gray-500">Glowing sparkles effect</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={localConfig.letterScene?.enableSparkles ?? true} onChange={e => updateConfig('letterScene.enableSparkles', e.target.checked)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-gray-800">Flower Petals</h4>
                      <p className="text-xs text-gray-500">Falling cherry blossom petals</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={localConfig.letterScene?.enablePetals ?? true} onChange={e => updateConfig('letterScene.enablePetals', e.target.checked)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Animation Intensity</label>
                    <select value={localConfig.letterScene?.animationIntensity || 'Medium'} onChange={e => updateConfig('letterScene.animationIntensity', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none">
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'intro' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                 <h2 className="text-lg font-bold mb-6 text-gray-800">Intro Screen</h2>
                 <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Top Text (Small, Italic)</label>
                      <input type="text" value={localConfig.introText} onChange={e => updateConfig('introText', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Instruction Text (Bottom)</label>
                      <input type="text" value={localConfig.instructionText} onChange={e => updateConfig('instructionText', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                    </div>
                 </div>
               </section>
             </div>
          )}

          {activeTab === 'video' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                 <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                   <div>
                     <h2 className="text-lg font-bold text-gray-800">Video Stage</h2>
                     <p className="text-sm text-gray-500 mt-0.5">
                       Plays a romantic cinematic video immediately after the Gift Unwrap animation.
                     </p>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                     <input
                       type="checkbox"
                       checked={localConfig.videoStage?.enabled ?? false}
                       onChange={e => updateConfig('videoStage.enabled', e.target.checked)}
                       className="sr-only peer"
                     />
                     <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                   </label>
                 </div>

                 <div className="space-y-6">
                   {/* Video Section */}
                   <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider text-xs">
                       Video
                     </label>
                     
                     {localConfig.videoStage?.videoUrl ? (
                       <div className="space-y-3">
                         <div className="rounded-2xl overflow-hidden border border-gray-200 bg-black aspect-video max-h-60 flex items-center justify-center relative shadow-inner">
                           <video
                             src={localConfig.videoStage.videoUrl}
                             controls
                             className="max-h-60 w-full object-contain"
                           />
                         </div>
                         
                         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-pink-50/70 rounded-2xl border border-pink-100 gap-3">
                           <div className="flex items-center gap-2.5 truncate max-w-full">
                             <Film size={20} className="text-pink-500 shrink-0" />
                             <div className="truncate">
                               <span className="text-xs text-pink-600 font-semibold block uppercase">Current Video</span>
                               <span className="text-sm font-medium text-gray-800 truncate block">
                                 {localConfig.videoStage.fileName || 'filename.mp4'}
                               </span>
                             </div>
                           </div>
                           
                           <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                             <label className="flex-1 sm:flex-none text-center px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl text-xs font-bold shadow cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]">
                               CHANGE VIDEO
                               <input
                                 type="file"
                                 accept="video/*"
                                 className="hidden"
                                 onChange={handleVideoUpload}
                               />
                             </label>
                             
                             <button
                               type="button"
                               onClick={() => {
                                 updateConfig('videoStage.videoUrl', '');
                                 updateConfig('videoStage.fileName', '');
                                 setVideoUpdatedMessage(false);
                               }}
                               className="px-3.5 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-100 transition-all"
                             >
                               Delete
                             </button>
                           </div>
                         </div>

                         {videoUpdatedMessage && (
                           <div className="flex items-center gap-2 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3.5 py-2 rounded-xl animate-in fade-in duration-300">
                             <CheckCircle2 size={15} className="text-green-600 shrink-0" />
                             <span>✓ Video updated</span>
                           </div>
                         )}
                       </div>
                     ) : (
                       <div className="border-2 border-dashed border-gray-300 hover:border-pink-400 transition-colors rounded-2xl p-6 text-center bg-gray-50/50">
                         <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                         <p className="text-sm font-medium text-gray-700 mb-1">Choose a video file from your device</p>
                         <p className="text-xs text-gray-500 mb-4">Supports MP4, WebM, MOV</p>
                         <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl text-sm font-bold shadow cursor-pointer transition-all hover:scale-105">
                           <span>CHANGE VIDEO</span>
                           <input
                             type="file"
                             accept="video/*"
                             className="hidden"
                             onChange={handleVideoUpload}
                           />
                         </label>
                       </div>
                     )}
                   </div>

                   {/* Video Aspect Ratio Setting */}
                   <div className="pt-4 border-t border-gray-100">
                     <label className="block text-sm font-semibold text-gray-700 mb-2">
                       VIDEO ASPECT RATIO
                     </label>
                     <select
                       value={localConfig.videoStage?.aspectRatio || 'Auto'}
                       onChange={e => updateConfig('videoStage.aspectRatio', e.target.value)}
                       className="w-full sm:w-64 px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none text-sm bg-white font-medium"
                     >
                       <option value="Auto">Auto (Natural Video Ratio)</option>
                       <option value="16:9">16:9 (Landscape)</option>
                       <option value="9:16">9:16 (Portrait / Reels)</option>
                       <option value="4:3">4:3 (Classic)</option>
                       <option value="1:1">1:1 (Square)</option>
                     </select>
                     <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                       When <strong>Auto</strong> is selected, the video automatically plays in its natural aspect ratio without stretching, cropping, or distortion.
                     </p>
                   </div>

                   {/* Video Resolution Setting */}
                   <div className="pt-4 border-t border-gray-100">
                     <label className="block text-sm font-semibold text-gray-700 mb-2">
                       VIDEO RESOLUTION
                     </label>
                     <select
                       value={localConfig.videoStage?.resolution || 'Auto'}
                       onChange={e => updateConfig('videoStage.resolution', e.target.value)}
                       className="w-full sm:w-64 px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none text-sm bg-white font-medium"
                     >
                       <option value="Auto">Auto (Original Uploaded)</option>
                       <option value="360p">360p</option>
                       <option value="480p">480p</option>
                       <option value="720p">720p</option>
                       <option value="1080p">1080p</option>
                     </select>
                     <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                       Auto selects the original uploaded resolution. If a specific resolution is not separately provided, the best available compatible source will be used.
                     </p>
                   </div>
                 </div>
               </section>
             </div>
           )}

          {activeTab === 'slingshot' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                 <h2 className="text-lg font-bold mb-6 text-gray-800">Slingshot Physics</h2>
                 <div className="space-y-6">
                    <div>
                      <label className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                        <span>Max Pull Distance</span>
                        <span className="text-pink-500 font-bold">{localConfig.slingshotSettings.maxPull}px</span>
                      </label>
                      <input type="range" min="80" max="200" value={localConfig.slingshotSettings.maxPull} onChange={e => updateConfig('slingshotSettings.maxPull', parseInt(e.target.value))} className="w-full accent-pink-500" />
                    </div>
                    <div>
                      <label className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                        <span>Gravity Impact</span>
                        <span className="text-pink-500 font-bold">{localConfig.slingshotSettings.gravity}</span>
                      </label>
                      <input type="range" min="0.1" max="2.0" step="0.1" value={localConfig.slingshotSettings.gravity} onChange={e => updateConfig('slingshotSettings.gravity', parseFloat(e.target.value))} className="w-full accent-pink-500" />
                    </div>
                    <div>
                      <label className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                        <span>Bow Size</span>
                        <span className="text-pink-500 font-bold">{(localConfig.slingshotSettings.bowScale || 1.0).toFixed(1)}x</span>
                      </label>
                      <input type="range" min="0.5" max="2.5" step="0.1" value={localConfig.slingshotSettings.bowScale || 1.0} onChange={e => updateConfig('slingshotSettings.bowScale', parseFloat(e.target.value))} className="w-full accent-pink-500" />
                    </div>
                    <div>
                      <label className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                        <span>Bow to Heart Distance</span>
                        <span className="text-pink-500 font-bold">{localConfig.slingshotSettings.bowDistance || 0}px</span>
                      </label>
                      <input type="range" min="-250" max="250" step="5" value={localConfig.slingshotSettings.bowDistance || 0} onChange={e => updateConfig('slingshotSettings.bowDistance', parseInt(e.target.value))} className="w-full accent-pink-500" />
                    </div>


                 </div>
              </section>

              <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                 <h2 className="text-lg font-bold mb-6 text-gray-800">Heart Particles</h2>
                 <div className="space-y-6">
                    <div>
                      <label className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                        <span>Particle Count</span>
                        <span className="text-pink-500 font-bold">{localConfig.heartAnimation.particleCount}</span>
                      </label>
                      <input type="range" min="50" max="600" value={localConfig.heartAnimation.particleCount} onChange={e => updateConfig('heartAnimation.particleCount', parseInt(e.target.value))} className="w-full accent-pink-500" />
                    </div>
                 </div>
              </section>
            </div>
          )}

          {activeTab === 'message' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                 <h2 className="text-lg font-bold mb-6 text-gray-800">Main Messages</h2>
                 <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
                      <input type="text" value={localConfig.mainMessage} onChange={e => updateConfig('mainMessage', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                      <input type="text" value={localConfig.subtitle} onChange={e => updateConfig('subtitle', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Final Farewell Message</label>
                      <textarea rows={6} value={localConfig.finalMessage} onChange={e => updateConfig('finalMessage', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none font-serif leading-relaxed" />
                    </div>
                 </div>
               </section>
             </div>
          )}

          {activeTab === 'balloons' && localConfig.balloonScene && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                 <div className="flex items-center justify-between mb-6">
                   <h2 className="text-lg font-bold text-gray-800">Balloon Messages</h2>
                   <label className="flex items-center cursor-pointer">
                     <div className="relative">
                       <input type="checkbox" checked={localConfig.balloonScene.enabled} onChange={e => updateConfig('balloonScene.enabled', e.target.checked)} className="sr-only" />
                       <div className={`block w-14 h-8 rounded-full transition-colors ${localConfig.balloonScene.enabled ? 'bg-pink-500' : 'bg-gray-200'}`}></div>
                       <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${localConfig.balloonScene.enabled ? 'translate-x-6' : ''}`}></div>
                     </div>
                   </label>
                 </div>
                 
                 <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Heading</label>
                      <input type="text" value={localConfig.balloonScene.heading} onChange={e => updateConfig('balloonScene.heading', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                      <input type="text" value={localConfig.balloonScene.subtitle} onChange={e => updateConfig('balloonScene.subtitle', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Completion Text (After all balloons popped)</label>
                      <input type="text" value={localConfig.balloonScene.completionText} onChange={e => updateConfig('balloonScene.completionText', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                    </div>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={localConfig.balloonScene.popSoundEnabled} onChange={e => updateConfig('balloonScene.popSoundEnabled', e.target.checked)} className="w-5 h-5 accent-pink-500" />
                        <span className="text-sm text-gray-700 font-medium">Pop Sound</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={localConfig.balloonScene.confettiEnabled} onChange={e => updateConfig('balloonScene.confettiEnabled', e.target.checked)} className="w-5 h-5 accent-pink-500" />
                        <span className="text-sm text-gray-700 font-medium">Confetti</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={localConfig.balloonScene.sparkleEnabled} onChange={e => updateConfig('balloonScene.sparkleEnabled', e.target.checked)} className="w-5 h-5 accent-pink-500" />
                        <span className="text-sm text-gray-700 font-medium">Sparkles</span>
                      </label>
                    </div>
                 </div>
               </section>

               <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                 <div className="flex items-center justify-between mb-6">
                   <h2 className="text-lg font-bold text-gray-800">Messages ({localConfig.balloonScene.balloons.length})</h2>
                   <button
                     onClick={() => {
                       const newBalloons = [...localConfig.balloonScene!.balloons];
                       newBalloons.push({
                         id: Date.now(),
                         title: `REASON NO.${newBalloons.length + 1} ��`,
                         message: "A new reason...",
                         balloonColor: "#FF8FB3",
                         accentColor: "#FF6B8A"
                       });
                       updateConfig('balloonScene.balloons', newBalloons);
                     }}
                     className="px-4 py-2 bg-pink-50 text-pink-600 rounded-xl font-medium text-sm hover:bg-pink-100 transition-colors flex items-center gap-2"
                   >
                     <Plus size={16} /> Add Message
                   </button>
                 </div>

                 <div className="space-y-4">
                   {localConfig.balloonScene.balloons.map((b: any, index: number) => (
                     <div key={b.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex gap-4">
                       <div className="flex-1 space-y-4">
                         <div className="flex gap-4">
                           <div className="flex-1">
                             <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                             <input
                               type="text"
                               value={b.title}
                               onChange={(e) => {
                                 const arr = [...localConfig.balloonScene!.balloons];
                                 arr[index].title = e.target.value;
                                 updateConfig('balloonScene.balloons', arr);
                               }}
                               className="w-full px-3 py-1.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none text-sm"
                             />
                           </div>
                           <div>
                             <label className="block text-xs font-medium text-gray-500 mb-1">Colors (Balloon / Card)</label>
                             <div className="flex gap-2">
                               <input
                                 type="color"
                                 value={b.balloonColor}
                                 onChange={(e) => {
                                   const arr = [...localConfig.balloonScene!.balloons];
                                   arr[index].balloonColor = e.target.value;
                                   updateConfig('balloonScene.balloons', arr);
                                 }}
                                 className="h-8 w-12 rounded cursor-pointer p-0 border-0"
                               />
                               <input
                                 type="color"
                                 value={b.accentColor}
                                 onChange={(e) => {
                                   const arr = [...localConfig.balloonScene!.balloons];
                                   arr[index].accentColor = e.target.value;
                                   updateConfig('balloonScene.balloons', arr);
                                 }}
                                 className="h-8 w-12 rounded cursor-pointer p-0 border-0"
                               />
                             </div>
                           </div>
                         </div>
                         <div>
                           <label className="block text-xs font-medium text-gray-500 mb-1">Message</label>
                           <textarea
                             value={b.message}
                             onChange={(e) => {
                               const arr = [...localConfig.balloonScene!.balloons];
                               arr[index].message = e.target.value;
                               updateConfig('balloonScene.balloons', arr);
                             }}
                             className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none text-sm"
                             rows={2}
                           />
                         </div>
                       </div>
                       <div className="flex items-start">
                         <button
                           onClick={() => {
                             const arr = localConfig.balloonScene!.balloons.filter((_, i) => i !== index);
                             updateConfig('balloonScene.balloons', arr);
                           }}
                           className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                           title="Remove Balloon"
                         >
                           <Trash2 size={16} />
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
               </section>
             </div>
          )}
          {activeTab === 'cake' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                 <div className="flex items-center justify-between mb-6">
                   <h2 className="text-lg font-bold text-gray-800">Cake Cutting Scene</h2>
                   <label className="flex items-center gap-2 cursor-pointer">
                     <span className="text-sm font-medium text-gray-700">Enable Scene</span>
                     <input type="checkbox" checked={localConfig.cakeScene?.enabled || false} onChange={e => updateConfig('cakeScene.enabled', e.target.checked)} className="w-5 h-5 accent-pink-500 rounded" />
                   </label>
                 </div>
                 
                 <div className="space-y-6 opacity-100 transition-opacity" style={{ opacity: localConfig.cakeScene?.enabled ? 1 : 0.5, pointerEvents: localConfig.cakeScene?.enabled ? 'auto' : 'none' }}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Scene Title</label>
                      <input type="text" value={localConfig.cakeScene?.title || ''} onChange={e => updateConfig('cakeScene.title', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cut Button Text</label>
                      <input type="text" value={localConfig.cakeScene?.buttonText || ''} onChange={e => updateConfig('cakeScene.buttonText', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hidden Message 1 (Small Italic)</label>
                        <input type="text" value={localConfig.cakeScene?.surpriseMessage1 || ''} onChange={e => updateConfig('cakeScene.surpriseMessage1', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hidden Message 2 (Large Bold)</label>
                        <input type="text" value={localConfig.cakeScene?.surpriseMessage2 || ''} onChange={e => updateConfig('cakeScene.surpriseMessage2', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Continue Button Text</label>
                      <input type="text" value={localConfig.cakeScene?.continueButton || ''} onChange={e => updateConfig('cakeScene.continueButton', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                    </div>
                 </div>
               </section>
               <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                 <h2 className="text-lg font-bold mb-6 text-gray-800">3D Cake Design</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ opacity: localConfig.cakeScene?.enabled ? 1 : 0.5, pointerEvents: localConfig.cakeScene?.enabled ? 'auto' : 'none' }}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cake Sponge Color</label>
                      <div className="flex gap-2">
                         <input type="color" value={localConfig.cakeScene?.cakeBaseColor || '#FFC0CB'} onChange={e => updateConfig('cakeScene.cakeBaseColor', e.target.value)} className="h-10 w-12 rounded cursor-pointer" />
                         <input type="text" value={localConfig.cakeScene?.cakeBaseColor || '#FFC0CB'} onChange={e => updateConfig('cakeScene.cakeBaseColor', e.target.value)} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Frosting Color</label>
                      <div className="flex gap-2">
                         <input type="color" value={localConfig.cakeScene?.frostingColor || '#FFF0F5'} onChange={e => updateConfig('cakeScene.frostingColor', e.target.value)} className="h-10 w-12 rounded cursor-pointer" />
                         <input type="text" value={localConfig.cakeScene?.frostingColor || '#FFF0F5'} onChange={e => updateConfig('cakeScene.frostingColor', e.target.value)} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Inner Cream Color</label>
                      <div className="flex gap-2">
                         <input type="color" value={localConfig.cakeScene?.creamColor || '#FFFFFF'} onChange={e => updateConfig('cakeScene.creamColor', e.target.value)} className="h-10 w-12 rounded cursor-pointer" />
                         <input type="text" value={localConfig.cakeScene?.creamColor || '#FFFFFF'} onChange={e => updateConfig('cakeScene.creamColor', e.target.value)} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Decoration (Gold) Color</label>
                      <div className="flex gap-2">
                         <input type="color" value={localConfig.cakeScene?.decorationColor || '#FFD700'} onChange={e => updateConfig('cakeScene.decorationColor', e.target.value)} className="h-10 w-12 rounded cursor-pointer" />
                         <input type="text" value={localConfig.cakeScene?.decorationColor || '#FFD700'} onChange={e => updateConfig('cakeScene.decorationColor', e.target.value)} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Candle Color</label>
                      <div className="flex gap-2">
                         <input type="color" value={localConfig.cakeScene?.candleColor || '#FFFFFF'} onChange={e => updateConfig('cakeScene.candleColor', e.target.value)} className="h-10 w-12 rounded cursor-pointer" />
                         <input type="text" value={localConfig.cakeScene?.candleColor || '#FFFFFF'} onChange={e => updateConfig('cakeScene.candleColor', e.target.value)} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                        <span>Candle Count</span>
                        <span className="text-pink-500 font-bold">{localConfig.cakeScene?.candleCount || 5}</span>
                      </label>
                      <input type="range" min="1" max="25" value={localConfig.cakeScene?.candleCount || 5} onChange={e => updateConfig('cakeScene.candleCount', parseInt(e.target.value))} className="w-full accent-pink-500" />
                    </div>
                 </div>
               </section>
             </div>
          )}

          {activeTab === 'cake-design' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                 <h2 className="text-lg font-bold mb-6 text-gray-800">Cake Customization</h2>
                 
                 <div className="mb-8">
                   <label className="block text-sm font-medium text-gray-700 mb-2">Cake Flavour Presets</label>
                   <select 
                     value={localConfig.cakeScene.flavour || 'strawberry-love'}
                     onChange={(e) => {
                       const preset = CAKE_PRESETS[e.target.value];
                       if (preset) {
                         setLocalConfig(prev => {
                           if (!prev) return prev;
                           return { ...prev, cakeScene: { ...prev.cakeScene, ...preset } };
                         });
                       }
                     }}
                     className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none bg-white"
                   >
                     <option value="custom" disabled>�� Select a Cake Style</option>
                     <option value="romantic-pink">�� Romantic Pink</option>
                     <option value="elegant-white">✨ Elegant White</option>
                     <option value="chocolate-luxury">�� Chocolate Luxury</option>
                     <option value="strawberry-love">�� Strawberry Love</option>
                     <option value="vanilla-classic">�� Vanilla Classic</option>
                   </select>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {/* Left Side: Color Controls */}
                   <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                     <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wider mb-2 sticky top-0 bg-white py-2 z-10 border-b border-gray-100">Colors</h3>
                     
                     {[
                       { key: 'spongeColor', label: 'Cake Sponge' },
                       { key: 'frostingColor', label: 'Main Frosting' },
                       { key: 'dripColor', label: 'Drip Icing' },
                       { key: 'creamColor', label: 'Cream Decorations' },
                       { key: 'flowerColor', label: 'Flower/Rose Color' },
                       { key: 'heartColor', label: 'Heart Decoration' },
                       { key: 'candleColor', label: 'Candle Color' },
                       { key: 'pearlColor', label: 'Edible Pearls' },
                       { key: 'platformColor', label: 'Cake Platform' },
                       { key: 'backgroundColor', label: 'Background Color' },
                     ].map(({ key, label }) => (
                       <div key={key} className="flex items-center justify-between gap-4 p-2 hover:bg-gray-50 rounded-lg">
                         <label className="text-sm font-medium text-gray-700">{label}</label>
                         <div className="flex gap-2 items-center">
                           <input 
                             type="color" 
                             value={(localConfig.cakeScene as any)[key] || '#ffffff'} 
                             onChange={e => updateConfig(`cakeScene.${key}`, e.target.value)} 
                             className="h-8 w-10 border-0 rounded cursor-pointer p-0" 
                           />
                           <input 
                             type="text" 
                             value={(localConfig.cakeScene as any)[key] || '#ffffff'} 
                             onChange={e => updateConfig(`cakeScene.${key}`, e.target.value)} 
                             className="w-24 px-2 py-1 text-sm rounded-lg border border-gray-200 focus:ring-1 focus:ring-pink-300 outline-none uppercase font-mono" 
                           />
                         </div>
                       </div>
                     ))}
                   </div>

                   {/* Right Side: Live 3D Preview */}
                   <div className="flex flex-col gap-4">
                     <div className="relative h-[60vh] rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center shadow-inner group">
                       <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm text-gray-600 flex items-center gap-2">
                         <Eye size={14} /> Live 3D Preview
                       </div>
                       <div className="absolute top-4 right-4 z-10 text-xs text-gray-500 bg-white/70 px-2 py-1 rounded-md">
                         Drag to rotate
                       </div>
                       <div className="w-full h-full relative" style={{ backgroundColor: localConfig.cakeScene.backgroundColor || '#f8dfe4' }}>
                          <Canvas shadows={{ type: THREE.PCFShadowMap }} dpr={[1, 2]}>
                             <PerspectiveCamera makeDefault position={[0, 4, 11]} fov={38} />
                             <OrbitControls 
                               enablePan={false} 
                               enableZoom={true} 
                               minPolarAngle={Math.PI / 4} 
                               maxPolarAngle={Math.PI / 2.1} 
                               autoRotate={false} 
                             />
                             
                             <hemisphereLight args={[0xfff5f7, 0xd49aa6, 2.5]} />
                             <directionalLight position={[4, 9, 7]} intensity={4.0} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0005} />
                             <pointLight position={[-4, 4, 4]} intensity={2.2} color="#ff8fb0" distance={12} />

                             <Environment preset="apartment" />
                             <CakeScene3D config={localConfig.cakeScene} step={0} onSliceComplete={() => {}} />
                          </Canvas>
                       </div>
                     </div>
                     <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                       <button
                         onClick={() => handleSave(false)}
                         disabled={saving}
                         className="flex-1 bg-pink-500 hover:bg-pink-600 text-white px-5 py-3 rounded-xl font-bold transition-colors shadow-sm disabled:opacity-70"
                       >
                         {saving ? 'Saving...' : 'Apply Changes / Save Cake Design'}
                       </button>
                       <button
                         onClick={() => { if (globalConfig) setLocalConfig(JSON.parse(JSON.stringify(globalConfig))) }}
                         disabled={saving}
                         className="px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-colors shadow-sm disabled:opacity-70"
                       >
                         Reset Colours
                       </button>
                     </div>
                   </div>
                 </div>
               </section>
             </div>
          )}
          {activeTab === 'media' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               
               <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                 <h2 className="text-lg font-bold mb-6 text-gray-800">Background Music</h2>
                 <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-between border border-gray-100">
                    <div className="flex flex-col max-w-[70%]">
                       <span className="text-sm font-medium text-gray-800 truncate">{localConfig.song.split('/').pop() || 'Current Audio'}</span>
                       <span className="text-xs text-gray-500 mt-1 truncate">{localConfig.song}</span>
                    </div>
                    <div className="flex gap-2">
                       <label className="cursor-pointer bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors">
                          Replace
                          <input type="file" accept="audio/*" className="hidden" onChange={e => handleFileUpload(e, 'song')} />
                       </label>
                    </div>
                 </div>
                 {localConfig.song && (
                    <div className="mt-4">
                       <audio src={localConfig.song} controls className="w-full h-10" />
                    </div>
                 )}
               </section>

               <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
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
                    <h2 className="text-lg font-bold text-gray-800">Photo Slideshow</h2>
                    <label className="cursor-pointer flex items-center gap-2 bg-pink-50 text-pink-600 hover:bg-pink-100 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                       <Plus size={16} /> Add Photo
                       <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, 'photos_new')} />
                    </label>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {localConfig.photos.length === 0 ? (
                        <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center justify-center">
                           <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                              <Upload className="text-gray-400" size={24} />
                           </div>
                           <p className="text-gray-500 font-medium">No photos added yet.</p>
                           <p className="text-gray-400 text-sm mt-1">Click "Add Photo" above to start your slideshow.</p>
                        </div>
                    ) : (
                        localConfig.photos.map((photo, i) => (
                           <div key={i} className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden flex flex-col transition-shadow hover:shadow-md">
                              <img src={photo} alt="" className="w-full h-48 object-cover" />
                              <div className="p-3 bg-white border-t border-gray-100 flex items-center justify-between">
                                 <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">#{i + 1}</span>
                                 <div className="flex gap-2">
                                    <label className="cursor-pointer px-3 py-1.5 bg-gray-50 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors border border-gray-200 flex items-center gap-1.5 text-sm font-medium" title="Replace">
                                       <Upload size={14} />
                                       <span className="hidden xs:inline">Replace</span>
                                       <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, 'photos', i)} />
                                    </label>
                                    <button 
                                       onClick={() => setPhotoToDelete(i)}
                                       className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-100 flex items-center gap-1.5 text-sm font-medium shadow-sm"
                                       title="Remove"
                                    >
                                       <Trash2 size={14} /> 
                                       <span>Remove</span>
                                    </button>
                                 </div>
                              </div>
                           </div>
                        ))
                    )}
                 </div>
               </section>
             </div>
          )}

          
          {activeTab === 'puzzle' && localConfig.puzzleScene && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
               <div className="p-6 md:p-8">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b pb-4">
                   <h2 className="text-xl font-bold text-gray-800">Photo Puzzle Scene</h2>
                   <div className="flex flex-wrap gap-4 items-center">
                     
                   </div>
                   <div className="flex flex-wrap gap-4 items-center">
                     <label className="flex items-center gap-2 cursor-pointer bg-gray-100 px-3 py-2 rounded-lg">
                       <input type="checkbox" checked={localConfig.puzzleScene.enabled} onChange={e => updateConfig('puzzleScene.enabled', e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-pink-500 focus:ring-pink-400" />
                       <span className="text-sm font-bold text-gray-700">Enable Scene</span>
                     </label>
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">Section Label</label>
                     <input type="text" value={localConfig.puzzleScene.roomLabel} onChange={e => updateConfig('puzzleScene.roomLabel', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                     <input type="text" value={localConfig.puzzleScene.title} onChange={e => updateConfig('puzzleScene.title', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                   </div>
                   <div className="md:col-span-2">
                     <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
                     <textarea value={localConfig.puzzleScene.instructions} onChange={e => updateConfig('puzzleScene.instructions', e.target.value)} rows={2} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none resize-none" />
                   </div>
                 </div>

                 <div className="border-t border-gray-100 pt-8 mb-8">
                   <h3 className="font-bold text-gray-800 mb-4">Puzzle Settings</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">Grid Size</label>
                       <select value={localConfig.puzzleScene.gridSize} onChange={e => updateConfig('puzzleScene.gridSize', parseInt(e.target.value))} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none">
                         <option value={2}>2 × 2</option>
                         <option value={3}>3 × 3</option>
                         <option value={4}>4 × 4</option>
                       </select>
                     </div>
                     <div className="flex flex-col justify-center space-y-3">
                       <label className="flex items-center gap-2 cursor-pointer">
                         <input type="checkbox" checked={localConfig.puzzleScene.enablePeek} onChange={e => updateConfig('puzzleScene.enablePeek', e.target.checked)} className="rounded border-gray-300 text-pink-500 focus:ring-pink-400" />
                         <span className="text-sm text-gray-700">Enable "Hold to peek"</span>
                       </label>
                       <label className="flex items-center gap-2 cursor-pointer">
                         <input type="checkbox" checked={localConfig.puzzleScene.enableTimer} onChange={e => updateConfig('puzzleScene.enableTimer', e.target.checked)} className="rounded border-gray-300 text-pink-500 focus:ring-pink-400" />
                         <span className="text-sm text-gray-700">Show Timer</span>
                       </label>
                       <label className="flex items-center gap-2 cursor-pointer">
                         <input type="checkbox" checked={localConfig.puzzleScene.enableMoveCounter} onChange={e => updateConfig('puzzleScene.enableMoveCounter', e.target.checked)} className="rounded border-gray-300 text-pink-500 focus:ring-pink-400" />
                         <span className="text-sm text-gray-700">Show Move Counter</span>
                       </label>
                     </div>
                   </div>
                   
                   <div className="mt-6">
                     <label className="block text-sm font-medium text-gray-700 mb-2">Puzzle Image</label>
                     <div className="flex items-center gap-4">
                       {localConfig.puzzleScene.image && (
                         <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 border border-gray-200 bg-gray-50 flex items-center justify-center">
                           <img src={localConfig.puzzleScene.image} alt="Puzzle" className="w-full h-full object-cover" />
                         </div>
                       )}
                       <div className="flex-1">
                         <label className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-pink-400 transition-colors">
                           <Upload size={18} className="text-gray-400" />
                           <span className="text-sm font-medium text-gray-600">Upload new image</span>
                           <input 
                             type="file" 
                             accept="image/*" 
                             className="hidden" 
                             onChange={async (e) => {
                               const file = e.target.files?.[0];
                               if (file) {
                                 const formData = new FormData();
                                 formData.append('file', file);
                                 try {
                                   const res = await fetch('/api/upload', {
                                     method: 'POST',
                                     headers: { 'Authorization': `Bearer ${token}` },
                                     body: formData
                                   });
                                   const data = await res.json();
                                   if (data.url) {
                                     updateConfig('puzzleScene.image', data.url);
                                   }
                                 } catch (err) {
                                   console.error(err);
                                   alert('Failed to upload image');
                                 }
                               }
                             }}
                           />
                         </label>
                       </div>
                     </div>
                   </div>
                 </div>

                 <div className="border-t border-gray-100 pt-8 mb-8">
                   <h3 className="font-bold text-gray-800 mb-4">Completion Details</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">Completion Title</label>
                       <input type="text" value={localConfig.puzzleScene.completionTitle} onChange={e => updateConfig('puzzleScene.completionTitle', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
                       <input type="text" value={localConfig.puzzleScene.completionButtonText} onChange={e => updateConfig('puzzleScene.completionButtonText', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                     </div>
                     <div className="md:col-span-2">
                       <label className="block text-sm font-medium text-gray-700 mb-2">Completion Message</label>
                       <textarea value={localConfig.puzzleScene.completionMessage} onChange={e => updateConfig('puzzleScene.completionMessage', e.target.value)} rows={2} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none resize-none" />
                     </div>
                   </div>
                 </div>
                 
                 <div className="border-t border-gray-100 pt-8">
                   <h3 className="font-bold text-gray-800 mb-4">Colors</h3>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     <div>
                       <label className="block text-xs font-medium text-gray-700 mb-1">Background</label>
                       <div className="flex gap-2">
                         <input type="color" value={localConfig.puzzleScene.backgroundColor} onChange={e => updateConfig('puzzleScene.backgroundColor', e.target.value)} className="h-8 w-10 rounded cursor-pointer" />
                         <input type="text" value={localConfig.puzzleScene.backgroundColor} onChange={e => updateConfig('puzzleScene.backgroundColor', e.target.value)} className="flex-1 px-2 py-1 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                       </div>
                     </div>
                     <div>
                       <label className="block text-xs font-medium text-gray-700 mb-1">Text Color</label>
                       <div className="flex gap-2">
                         <input type="color" value={localConfig.puzzleScene.textColor} onChange={e => updateConfig('puzzleScene.textColor', e.target.value)} className="h-8 w-10 rounded cursor-pointer" />
                         <input type="text" value={localConfig.puzzleScene.textColor} onChange={e => updateConfig('puzzleScene.textColor', e.target.value)} className="flex-1 px-2 py-1 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                       </div>
                     </div>
                   </div>
                 </div>

               </div>
             </div>
            </div>
          )}

          {activeTab === 'rules' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
               <div className="p-6 md:p-8">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b pb-4">
                   <h2 className="text-xl font-bold text-gray-800">Friendship Rules Scene</h2>
                   <div className="flex flex-wrap gap-4 items-center">
                     
                   </div>
                   <div className="flex flex-wrap gap-4 items-center">
                     <label className="flex items-center gap-2 cursor-pointer bg-gray-100 px-3 py-2 rounded-lg">
                       <input
                         type="checkbox"
                         className="w-5 h-5 text-pink-500 rounded border-gray-300 focus:ring-pink-500"
                         checked={localConfig.friendshipRules?.enabled ?? true}
                         onChange={(e) => setLocalConfig(prev => {
                           if (!prev) return prev;
                           return {
                             ...prev,
                             friendshipRules: {
                               ...(prev.friendshipRules || {
                                 roomLabel: "ROOM 7 · THE PROMISES",
                                 title: "Tick each promise, then sign.",
                                 cardTitle: "Our Friendship Rules",
                                 subtitle: "BETWEEN {senderName} AND {recipientName}",
                                 signatureLabel: "SIGN HERE WITH YOUR FINGER",
                                 buttonText: "Renew our friendship ✍️",
                                 completedButtonText: "Renewed ��",
                                 stampTitle: "RENEWED",
                                 stampSubtitle: "FOR LIFE",
                                 rules: []
                               }),
                               enabled: e.target.checked
                             }
                           };
                         })}
                       />
                       <span className="text-sm font-bold text-gray-700">Enable Scene</span>
                     </label>
                   </div>
                 </div>

                 {localConfig.friendshipRules?.enabled !== false && (
                   <div className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-2">Room Label</label>
                         <input
                           type="text"
                           value={localConfig.friendshipRules?.roomLabel || ''}
                           onChange={(e) => setLocalConfig(prev => prev ? {...prev, friendshipRules: {...prev.friendshipRules!, roomLabel: e.target.value}} : prev)}
                           className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none"
                         />
                       </div>
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
                         <input
                           type="text"
                           value={localConfig.friendshipRules?.title || ''}
                           onChange={(e) => setLocalConfig(prev => prev ? {...prev, friendshipRules: {...prev.friendshipRules!, title: e.target.value}} : prev)}
                           className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none"
                         />
                       </div>
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-2">Card Title</label>
                         <input
                           type="text"
                           value={localConfig.friendshipRules?.cardTitle || ''}
                           onChange={(e) => setLocalConfig(prev => prev ? {...prev, friendshipRules: {...prev.friendshipRules!, cardTitle: e.target.value}} : prev)}
                           className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none"
                         />
                       </div>
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-2">Card Subtitle</label>
                         <input
                           type="text"
                           value={localConfig.friendshipRules?.subtitle || ''}
                           onChange={(e) => setLocalConfig(prev => prev ? {...prev, friendshipRules: {...prev.friendshipRules!, subtitle: e.target.value}} : prev)}
                           className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none"
                         />
                       </div>
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-2">Signature Label</label>
                         <input
                           type="text"
                           value={localConfig.friendshipRules?.signatureLabel || ''}
                           onChange={(e) => setLocalConfig(prev => prev ? {...prev, friendshipRules: {...prev.friendshipRules!, signatureLabel: e.target.value}} : prev)}
                           className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none"
                         />
                       </div>
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-2">Stamp Title</label>
                         <input
                           type="text"
                           value={localConfig.friendshipRules?.stampTitle || ''}
                           onChange={(e) => setLocalConfig(prev => prev ? {...prev, friendshipRules: {...prev.friendshipRules!, stampTitle: e.target.value}} : prev)}
                           className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none"
                         />
                       </div>
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-2">Stamp Subtitle</label>
                         <input
                           type="text"
                           value={localConfig.friendshipRules?.stampSubtitle || ''}
                           onChange={(e) => setLocalConfig(prev => prev ? {...prev, friendshipRules: {...prev.friendshipRules!, stampSubtitle: e.target.value}} : prev)}
                           className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none"
                         />
                       </div>
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
                         <input
                           type="text"
                           value={localConfig.friendshipRules?.buttonText || ''}
                           onChange={(e) => setLocalConfig(prev => prev ? {...prev, friendshipRules: {...prev.friendshipRules!, buttonText: e.target.value}} : prev)}
                           className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none"
                         />
                       </div>
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-2">Completed Button Text</label>
                         <input
                           type="text"
                           value={localConfig.friendshipRules?.completedButtonText || ''}
                           onChange={(e) => setLocalConfig(prev => prev ? {...prev, friendshipRules: {...prev.friendshipRules!, completedButtonText: e.target.value}} : prev)}
                           className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none"
                         />
                       </div>
                     </div>

                     <div className="pt-6 border-t border-gray-100">
                       <div className="flex items-center justify-between mb-4">
                         <h3 className="text-md font-bold text-gray-800">Rules ({localConfig.friendshipRules?.rules?.length || 0})</h3>
                         <button
                           onClick={() => setLocalConfig(prev => {
                             if (!prev) return prev;
                             const newRule = {
                               id: Date.now().toString(),
                               text: "New rule",
                               enabled: true,
                               required: true,
                               order: (prev.friendshipRules?.rules?.length || 0) + 1,
                               icon: "��"
                             };
                             return {
                               ...prev,
                               friendshipRules: {
                                 ...prev.friendshipRules!,
                                 rules: [...(prev.friendshipRules?.rules || []), newRule]
                               }
                             };
                           })}
                           className="px-4 py-2 bg-pink-50 text-pink-600 rounded-xl hover:bg-pink-100 transition-colors flex items-center gap-2 text-sm font-medium"
                         >
                           <Plus size={16} /> Add Rule
                         </button>
                       </div>

                       <div className="space-y-4">
                         {localConfig.friendshipRules?.rules?.map((rule, index) => (
                           <div key={rule.id} className="bg-gray-50 rounded-2xl p-4 md:p-5 border border-gray-200 flex gap-4 flex-col md:flex-row">
                             <div className="pt-2 text-gray-400 hidden md:block">
                               <GripVertical size={20} />
                             </div>
                             <div className="flex-1 space-y-4">
                               <div className="flex flex-col md:flex-row gap-4">
                                 <div className="flex-1">
                                   <label className="block text-xs font-medium text-gray-700 mb-1">Rule Text</label>
                                   <input
                                     type="text"
                                     value={rule.text}
                                     onChange={(e) => {
                                       setLocalConfig(prev => {
                                         if (!prev) return prev;
                                         const newRules = [...(prev.friendshipRules?.rules || [])];
                                         newRules[index] = { ...rule, text: e.target.value };
                                         return { ...prev, friendshipRules: { ...prev.friendshipRules!, rules: newRules } };
                                       });
                                     }}
                                     className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-1 focus:ring-pink-300 outline-none text-sm"
                                   />
                                 </div>
                                 <div className="w-full md:w-24">
                                   <label className="block text-xs font-medium text-gray-700 mb-1">Icon (Emoji)</label>
                                   <input
                                     type="text"
                                     value={rule.icon || ''}
                                     onChange={(e) => {
                                       setLocalConfig(prev => {
                                         if (!prev) return prev;
                                         const newRules = [...(prev.friendshipRules?.rules || [])];
                                         newRules[index] = { ...rule, icon: e.target.value };
                                         return { ...prev, friendshipRules: { ...prev.friendshipRules!, rules: newRules } };
                                       });
                                     }}
                                     className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-1 focus:ring-pink-300 outline-none text-center"
                                   />
                                 </div>
                               </div>
                               <div className="flex items-center gap-6">
                                 <label className="flex items-center gap-2 cursor-pointer">
                                   <input
                                     type="checkbox"
                                     checked={rule.enabled}
                                     onChange={(e) => {
                                       setLocalConfig(prev => {
                                         if (!prev) return prev;
                                         const newRules = [...(prev.friendshipRules?.rules || [])];
                                         newRules[index] = { ...rule, enabled: e.target.checked };
                                         return { ...prev, friendshipRules: { ...prev.friendshipRules!, rules: newRules } };
                                       });
                                     }}
                                     className="w-4 h-4 text-pink-500 rounded border-gray-300 focus:ring-pink-500"
                                   />
                                   <span className="text-xs font-medium text-gray-700">Enabled</span>
                                 </label>
                                 <label className="flex items-center gap-2 cursor-pointer">
                                   <input
                                     type="checkbox"
                                     checked={rule.required}
                                     onChange={(e) => {
                                       setLocalConfig(prev => {
                                         if (!prev) return prev;
                                         const newRules = [...(prev.friendshipRules?.rules || [])];
                                         newRules[index] = { ...rule, required: e.target.checked };
                                         return { ...prev, friendshipRules: { ...prev.friendshipRules!, rules: newRules } };
                                       });
                                     }}
                                     className="w-4 h-4 text-pink-500 rounded border-gray-300 focus:ring-pink-500"
                                   />
                                   <span className="text-xs font-medium text-gray-700">Required</span>
                                 </label>
                                 <button
                                   onClick={() => {
                                     setLocalConfig(prev => {
                                       if (!prev) return prev;
                                       const newRules = prev.friendshipRules?.rules?.filter((_, i) => i !== index) || [];
                                       return { ...prev, friendshipRules: { ...prev.friendshipRules!, rules: newRules } };
                                     });
                                   }}
                                   className="ml-auto text-red-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                 >
                                   <Trash2 size={16} />
                                 </button>
                               </div>
                             </div>
                           </div>
                         ))}
                         {!localConfig.friendshipRules?.rules?.length && (
                           <div className="text-center py-8 bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
                             <p className="text-gray-500 text-sm">No rules added yet. Click 'Add Rule' to create one.</p>
                           </div>
                         )}
                       </div>
                     </div>
                   </div>
                 )}
               </div>
             </div>
             </div>
          )}

          {activeTab === 'end' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                 <h2 className="text-lg font-bold mb-6 text-gray-800">End Screen Text</h2>
                 <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Heading</label>
                      <input type="text" value={localConfig.endScene?.heading || 'HAPPY BIRTHDAY'} onChange={e => updateConfig('endScene.heading', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sender Message</label>
                      <input type="text" value={localConfig.endScene?.senderMessage || 'Made with love, just for you — {senderName} ❤️'} onChange={e => updateConfig('endScene.senderMessage', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                      <p className="text-xs text-gray-500 mt-1">Use {'{senderName}'} to display the sender name from General settings.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
                      <input type="text" value={localConfig.endScene?.buttonText || 'Share on WhatsApp Status ��'} onChange={e => updateConfig('endScene.buttonText', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Button Helper Text</label>
                      <input type="text" value={localConfig.endScene?.helperText || 'Share this surprise with them ❤️'} onChange={e => updateConfig('endScene.helperText', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                    </div>
                 </div>
               </section>

               <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                 <h2 className="text-lg font-bold mb-6 text-gray-800">Colors</h2>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { label: 'Background Start', key: 'bgStart' },
                      { label: 'Background End', key: 'bgEnd' },
                      { label: 'Heading Color', key: 'heading' },
                      { label: 'Recipient Name', key: 'recipientName' },
                      { label: 'Sender Message', key: 'senderMessage' },
                      { label: 'Button Start', key: 'buttonStart' },
                      { label: 'Button End', key: 'buttonEnd' },
                      { label: 'Button Text', key: 'buttonText' },
                      { label: 'Helper Text', key: 'helperText' }
                    ].map(c => (
                      <div key={c.key}>
                        <label className="block text-xs font-medium text-gray-700 mb-1">{c.label}</label>
                        <div className="flex gap-2">
                           <input type="color" value={(localConfig.endScene?.colors as any)?.[c.key] || '#ffffff'} onChange={e => updateConfig(`endScene.colors.${c.key}`, e.target.value)} className="h-8 w-10 rounded cursor-pointer" />
                           <input type="text" value={(localConfig.endScene?.colors as any)?.[c.key] || '#ffffff'} onChange={e => updateConfig(`endScene.colors.${c.key}`, e.target.value)} className="flex-1 px-2 py-1 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                        </div>
                      </div>
                    ))}
                 </div>
               </section>

               <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                 <h2 className="text-lg font-bold mb-6 text-gray-800">Character & Button Settings</h2>
                 <div className="space-y-6">
                    <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={localConfig.endScene?.character?.enabled ?? true} onChange={e => updateConfig('endScene.character.enabled', e.target.checked)} className="rounded text-pink-500 focus:ring-pink-500" />
                        <span className="text-sm font-medium text-gray-700">Show Character</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={localConfig.endScene?.character?.floating ?? true} onChange={e => updateConfig('endScene.character.floating', e.target.checked)} className="rounded text-pink-500 focus:ring-pink-500" />
                        <span className="text-sm font-medium text-gray-700">Floating Animation</span>
                      </label>
                    </div>
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
                            <input type="text" value={localConfig.endScene?.character?.image || '��'} onChange={e => updateConfig('endScene.character.image', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" placeholder="e.g. �� ❤️ ��" />
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
                            {(characterPhotoPreview || (localConfig.endScene?.character?.image && !localConfig.endScene?.character?.image.match(/^[^\x00-\x7F]+$/) && localConfig.endScene.character.image.length > 2)) ? (
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

                    <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Button Icon</label>
                        <input type="text" value={localConfig.endScene?.button?.icon || '��'} onChange={e => updateConfig('endScene.button.icon', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Corner Radius</label>
                        <input type="number" value={localConfig.endScene?.button?.cornerRadius || 9999} onChange={e => updateConfig('endScene.button.cornerRadius', parseInt(e.target.value))} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                      </div>
                    </div>
                 </div>
               </section>

               <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                 <h2 className="text-lg font-bold mb-6 text-gray-800">Animation Effects</h2>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {[
                      { label: 'Confetti', key: 'confetti' },
                      { label: 'Sparkles', key: 'sparkles' },
                      { label: 'Hearts', key: 'hearts' },
                      { label: 'Floating Particles', key: 'floatingParticles' },
                      { label: 'Character Animation', key: 'characterAnimation' },
                      { label: 'Glow Effects', key: 'glowEffects' },
                    ].map(a => (
                      <label key={a.key} className="flex items-center gap-2 cursor-pointer p-3 bg-gray-50 rounded-xl">
                        <input type="checkbox" checked={(localConfig.endScene?.animations as any)?.[a.key] ?? true} onChange={e => updateConfig(`endScene.animations.${a.key}`, e.target.checked)} className="rounded text-pink-500 focus:ring-pink-500" />
                        <span className="text-sm font-medium text-gray-700">{a.label}</span>
                      </label>
                    ))}
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Intensity</label>
                      <select value={localConfig.endScene?.animations?.intensity || 'Medium'} onChange={e => updateConfig('endScene.animations.intensity', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none">
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confetti Amount</label>
                      <input type="number" value={localConfig.endScene?.animations?.confettiAmount || 150} onChange={e => updateConfig('endScene.animations.confettiAmount', parseInt(e.target.value))} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                    </div>
                 </div>
               </section>
            </div>
          )}

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

          {activeTab === 'share' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                 <h2 className="text-lg font-bold mb-6 text-gray-800">Share Meta Data</h2>
                 <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Share Title</label>
                      <input type="text" value={localConfig.shareSettings.title} onChange={e => updateConfig('shareSettings.title', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Share Description</label>
                      <input type="text" value={localConfig.shareSettings.description} onChange={e => updateConfig('shareSettings.description', e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none" />
                    </div>
                 </div>
               </section>
             </div>
          )}
        </div>
      </div>

      {/* Photo Delete Confirmation Modal */}
      {photoToDelete !== null && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
               <h3 className="text-lg font-bold text-gray-900 mb-2">Remove this photo?</h3>
               <p className="text-gray-600 mb-6 text-sm">This photo will be permanently removed from the slideshow.</p>
               <div className="flex justify-end gap-3">
                  <button 
                     onClick={() => setPhotoToDelete(null)}
                     className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                  >
                     Cancel
                  </button>
                  <button 
                     onClick={() => {
                        setLocalConfig(prev => {
                           if (!prev) return prev;
                           const updatedConfig = { ...prev, photos: prev.photos.filter((_, idx) => idx !== photoToDelete) };
                           fetch('/api/config', {
                               method: 'PUT',
                               headers: {
                                 'Content-Type': 'application/json',
                                 'Authorization': `Bearer ${token}`
                               },
                               body: JSON.stringify(updatedConfig)
                           }).then(res => {
                               if (res.ok) {
                                   refreshConfig();
                                   setShowToast(true);
                                   setTimeout(() => setShowToast(false), 3000);
                               }
                           });
                           return updatedConfig;
                        });
                        setPhotoToDelete(null);
                     }}
                     className="px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-xl font-medium transition-colors shadow-sm shadow-red-500/20"
                  >
                     Remove
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* Toast Notification */}
      <div className={`fixed bottom-6 right-6 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 transition-all duration-300 ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'}`}>
        <CheckCircle2 size={20} className="text-green-400" />
        <span className="font-medium text-sm">Changes saved successfully ❤️</span>
      </div>
      {showResetModal && (
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
}
