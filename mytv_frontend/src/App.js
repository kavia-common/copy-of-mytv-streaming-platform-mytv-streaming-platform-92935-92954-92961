import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';

// Pages
import Splash from './pages/Splash';
import Home from './pages/Home';
import Login from './pages/Login';
import Settings from './pages/Settings';
import TitleDetail from './pages/TitleDetail';
import ForgotPin from './pages/ForgotPin';
import SignUp from './pages/SignUp';
import VideoPlayer from './pages/VideoPlayer';

// Remote focus/keys
import { FocusManagerProvider } from './remote/focus/FocusContext';
import { RemoteControlProvider } from './remote/RemoteControl';

// App settings context
import { AppSettingsProvider } from './context/SettingsContext';

/**
 * PUBLIC_INTERFACE
 * App
 * Adds auth flows: /login, /forgot-pin, /signup and preserves existing routes.
 * RemoteControlProvider enables Samsung TV remote keys globally with normalized mapping.
 *
 * Remote Keys integration notes:
 * - RemoteControlProvider is added once at App level to ensure a single keydown listener.
 * - Pages use useRemoteControl((action, e) => { ...; return true if handled; }).
 * - The provider will preventDefault/stopPropagation for handled keys and for arrow keys.
 * - Back behavior is centralized; pages can intercept "__internal_back_intercept" to close overlays.
 * - Debug overlay toggled by Info key or enabling REMOTE_KEYS_DEBUG in REACT_APP_FEATURE_FLAGS.
 */
function App() {
  return (
    <BrowserRouter>
      <FocusManagerProvider>
        <AppSettingsProvider>
          <RemoteControlProvider>
            <div className="absolute top-2 left-2 z-50">
              <Link
                to="/video"
                className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
              >
                Open Video with Captions
              </Link>
            </div>
            <Routes>
              <Route path="/" element={<Splash />} />
              <Route path="/home" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-pin" element={<ForgotPin />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/title/:id" element={<TitleDetail />} />
              <Route path="/video" element={<VideoPlayer />} />
              {/* Fallback to splash */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </RemoteControlProvider>
        </AppSettingsProvider>
      </FocusManagerProvider>
    </BrowserRouter>
  );
}

export default App;
