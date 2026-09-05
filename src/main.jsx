import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { BIAuthProvider } from './auth/BIAuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <BIAuthProvider>
        <App />
      </BIAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
