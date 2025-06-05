import { Auth0Provider } from "@auth0/auth0-react";
import AppRoutes from './routes/AppRoutes.jsx';

function App() {
  return <AppRoutes />;
}

export default function AppWrapper() {
  return (
    <Auth0Provider
      domain="dev-x240f0akkby8jtyr.us.auth0.com"
      clientId="LgbGjKYPe3klaxWN6NNkAeaAziOVW3tk"
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: "https://riveltime/api"
      }}
    >
      <App />
    </Auth0Provider>
  );
}