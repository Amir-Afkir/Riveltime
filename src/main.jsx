// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/index.css';

import App from './App.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { UserProvider } from './context/UserContext.jsx';
import { Auth0Provider } from '@auth0/auth0-react';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Auth0Provider
      domain="dev-x240f0akkby8jtyr.us.auth0.com"
      clientId="LgbGjKYPe3klaxWN6NNkAeaAziOVW3tk"
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: "https://api.riveltime.app",
      }}
    >
      <UserProvider>
        <BrowserRouter>
          <CartProvider>
            <App />
          </CartProvider>
        </BrowserRouter>
      </UserProvider>
    </Auth0Provider>
  </React.StrictMode>
);