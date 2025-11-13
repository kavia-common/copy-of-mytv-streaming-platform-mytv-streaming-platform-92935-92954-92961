import React from 'react';
import ReactDOM from 'react-dom/client';
import 'shaka-player/dist/controls.css';
import './index.css'; // Tailwind directives included here
import App from './App';

// Load Shaka Player UI globally
import 'shaka-player/dist/shaka-player.ui';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
