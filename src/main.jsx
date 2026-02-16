import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

window.storage = {
  async get(key, shared) {
    try {
      const prefix = shared ? 'shared_' : 'local_';
      const value = localStorage.getItem(prefix + key);
      return value;
    } catch (e) {
      console.log('Storage get error:', e);
      return null;
    }
  },
  async set(key, value, shared) {
    try {
      const prefix = shared ? 'shared_' : 'local_';
      localStorage.setItem(prefix + key, value);
    } catch (e) {
      console.log('Storage set error:', e);
    }
  },
  async delete(key, shared) {
    try {
      const prefix = shared ? 'shared_' : 'local_';
      localStorage.removeItem(prefix + key);
    } catch (e) {
      console.log('Storage delete error:', e);
    }
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
