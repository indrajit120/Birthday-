import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import AdminApp from './admin/AdminApp';
import { ConfigProvider } from './contexts/ConfigContext';
import './index.css';

// Suppress THREE.Clock deprecation warning caused by @react-three/fiber
const origWarn = console.warn;
console.warn = function(...args) {
  if (typeof args[0] === 'string' && args[0].includes('Clock: This module has been deprecated')) return;
  origWarn.apply(console, args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/*" element={<App />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  </StrictMode>,
);
