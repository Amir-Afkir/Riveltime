import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { useEffect } from "react";
import Button from "../../components/ui/Button";

export default function Home() {
  const navigate = useNavigate();
  const { loginWithRedirect, isAuthenticated, user: auth0User } = useAuth0();
  const { logout } = useUser();
  const { userData, loadingUser } = useUser();

  useEffect(() => {
    if (!loadingUser && userData?.role) {
      const role = userData.role;
      if (role === "client") navigate("/client/accueil");
      else if (role === "vendeur") navigate("/vendeur/dashboard");
      else if (role === "livreur") navigate("/livreur/dashboard");
    }
  }, [userData, loadingUser, navigate]);

  const handleRoleClick = (role) => {
    if (isAuthenticated) {
      if (role === "client") navigate("/client/accueil");
      else if (role === "vendeur") navigate("/vendeur/dashboard");
      else if (role === "livreur") navigate("/livreur/dashboard");
    } else {
      localStorage.setItem("signup_role", role);
      loginWithRedirect({
        screen_hint: "signup",
        authorizationParams: {
          signup_role: role,
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          scope: "openid profile email",
        },
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4 text-center">
      <h1 className="text-2xl font-bold">Bienvenue sur Riveltime</h1>
      <p className="text-gray-600">Choisissez votre rôle pour commencer</p>

      {!isAuthenticated ? (
        <div className="flex flex-col gap-2 w-full max-w-xs">
          <Button className="w-full" role="client" onClick={() => handleRoleClick("client")}>
            👤 Je suis un Client
          </Button>
          <Button className="w-full" role="vendeur" onClick={() => handleRoleClick("vendeur")}>
            🏪 Je suis un Commerçant
          </Button>
          <Button className="w-full" role="livreur" onClick={() => handleRoleClick("livreur")}>
            🚴 Je suis un Livreur
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 w-full max-w-xs">
          <p>Bienvenue, {auth0User?.name} !</p>
          {userData?.role && (
            <p className="text-blue-600 font-semibold">
              Rôle : {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
            </p>
          )}
          <Button className="w-full" onClick={() => logout({ returnTo: import.meta.env.VITE_BASE_URL })}>
            Se déconnecter
          </Button>
        </div>
      )}
    </div>
  );
}