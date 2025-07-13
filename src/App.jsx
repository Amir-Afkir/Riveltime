import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import useUserStore from "./stores/userStore";
import AppRoutes from './routes/AppRoutes.jsx';

export default function App() {
  const { isAuthenticated, isLoading, getAccessTokenSilently, user } = useAuth0();

useEffect(() => {
  const token = localStorage.getItem("accessToken");
  const rawUser = localStorage.getItem("userData");
  const parsedUser = rawUser ? JSON.parse(rawUser) : null;

  if (!isAuthenticated && token && parsedUser) {
    useUserStore.setState({
      token,
      userData: parsedUser,
      loadingUser: false,
    });
  }
}, [isAuthenticated]);


  return <AppRoutes />;
}