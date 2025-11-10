import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Splash from './pages/Splash';
import Home from './pages/Home';
import Login from './pages/Login';
import Settings from './pages/Settings';

// Remote focus/keys
import { FocusManagerProvider } from './remote/focus/FocusContext';
import RemoteKeyHandler from './remote/RemoteKeyHandler';

// App settings context
import { AppSettingsProvider } from './context/SettingsContext';

/**
 * PUBLIC_INTERFACE
 * App
 * The main Router entry configuring routes for Splash (/), Home (/home), Login (/login), and Settings (/settings).
 * Applies basic layout boundaries and provides a safe default redirect.
 * Wraps the app with FocusManagerProvider, AppSettingsProvider, and attaches RemoteKeyHandler to support TV remote navigation and global settings.
 */
function App() {
  return (
    <BrowserRouter>
      <FocusManagerProvider>
        <AppSettingsProvider>
          <RemoteKeyHandler />
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/settings" element={<Settings />} />
            {/* Fallback to splash */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppSettingsProvider>
      </FocusManagerProvider>
    </BrowserRouter>
  );
}

export default App;
