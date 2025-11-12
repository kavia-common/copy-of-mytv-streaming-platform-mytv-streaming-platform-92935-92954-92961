import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Splash from './pages/Splash';
import Home from './pages/Home';
import Login from './pages/Login';
import Settings from './pages/Settings';
import TitleDetail from './pages/TitleDetail';
import ForgotPin from './pages/ForgotPin';
import SignUp from './pages/SignUp';

// Remote focus/keys
import { FocusManagerProvider } from './remote/focus/FocusContext';
import RemoteKeyHandler from './remote/RemoteKeyHandler';

// App settings context
import { AppSettingsProvider } from './context/SettingsContext';

/**
 * PUBLIC_INTERFACE
 * App
 * Adds auth flows: /login, /forgot-pin, /signup and preserves existing routes.
 * RemoteKeyHandler enables Samsung TV remote keys globally.
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
            <Route path="/forgot-pin" element={<ForgotPin />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/title/:id" element={<TitleDetail />} />
            {/* Fallback to splash */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppSettingsProvider>
      </FocusManagerProvider>
    </BrowserRouter>
  );
}

export default App;
