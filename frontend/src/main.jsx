import React from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { I18nProvider } from './i18n/I18nContext.jsx';

async function initializeApp() {
  if (import.meta.env.DEV) {
    const { default: axe } = await import('@axe-core/react');
    axe(React, ReactDOM, 1000);
  }

  createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <I18nProvider>
        <App />
      </I18nProvider>
    </React.StrictMode>
  );
}

initializeApp();