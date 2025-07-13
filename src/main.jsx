// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/index.css'; 
import './pwa';

import App from './App.jsx';
import { Auth0Provider } from '@auth0/auth0-react';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("❌ Élément 'root' introuvable dans le DOM");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    {/* Auth0 configuration + session persistée en localStorage */}
    <Auth0Provider
      domain="dev-x240f0akkby8jtyr.us.auth0.com"
      clientId="LgbGjKYPe3klaxWN6NNkAeaAziOVW3tk"
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: "https://api.riveltime.app",
      }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Auth0Provider>
  </React.StrictMode>
);