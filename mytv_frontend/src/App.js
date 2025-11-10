import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Splash from './pages/Splash';
import Home from './pages/Home';
import Login from './pages/Login';

/**
 * PUBLIC_INTERFACE
 * App
 * The main Router entry configuring routes for Splash (/), Home (/home), and Login (/login).
 * Applies basic layout boundaries and provides a safe default redirect.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        {/* Fallback to splash */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
