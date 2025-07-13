import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import useUserStore from "./stores/userStore";
import AppRoutes from './routes/AppRoutes.jsx';

export default function App() {
  const { isAuthenticated, isLoading, getAccessTokenSilently, user } = useAuth0();

useEffect(() => {
  if (isAuthenticated && user) {
    useUserStore.getState().initAuth0Session({
      auth0User: user,
      getTokenSilently: getAccessTokenSilently,
    });
  }
}, [isAuthenticated, user]);


  return <AppRoutes />;
}