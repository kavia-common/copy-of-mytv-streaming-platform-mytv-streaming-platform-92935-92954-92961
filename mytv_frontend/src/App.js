import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Splash from './pages/Splash';
import Home from './pages/Home';
import Login from './pages/Login';

// Remote focus/keys
import { FocusManagerProvider } from './remote/focus/FocusContext';
import RemoteKeyHandler from './remote/RemoteKeyHandler';

/**
 * PUBLIC_INTERFACE
 * App
 * The main Router entry configuring routes for Splash (/), Home (/home), and Login (/login).
 * Applies basic layout boundaries and provides a safe default redirect.
 * Wraps the app with FocusManagerProvider and attaches RemoteKeyHandler to support TV remote navigation.
 */
function App() {
  return (
    <BrowserRouter>
      <FocusManagerProvider>
        <RemoteKeyHandler />
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          {/* Fallback to splash */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </FocusManagerProvider>
    </BrowserRouter>
  );
}

export default App;
