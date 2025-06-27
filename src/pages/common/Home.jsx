// Centraliser l'URL de base de l'API si besoin dans un fichier config.js ou ici :
// const API_BASE_URL = "https://api.riveltime.app/api";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import Button from "../../components/ui/Button";

export default function Home() {
  const navigate = useNavigate();
  const { loginWithRedirect, isAuthenticated, user, logout, getAccessTokenSilently } = useAuth0();
  const [userRole, setUserRole] = useState("");

// Audience déclarée dans Auth0 → Applications > API
const AUTH0_AUDIENCE = import.meta.env.VITE_AUTH0_AUDIENCE;

  useEffect(() => {
    const fetchRole = async () => {
      if (!isAuthenticated) return;

      try {
        const accessToken = await getAccessTokenSilently({
          audience: AUTH0_AUDIENCE,
          scope: "openid profile email",
        });
        const decoded = jwtDecode(accessToken);
        console.log("✅ AccessToken decoded:", decoded);

        const role = decoded["https://api.riveltime.app/role"];
        if (role) {
          setUserRole(role);
          if (role === "client") navigate("/client/accueil");
          else if (role === "vendeur") navigate("/vendeur/dashboard");
          else if (role === "livreur") navigate("/livreur/dashboard");
        } else {
          console.warn("⚠️ Aucun rôle trouvé dans le token.");
        }
      } catch (e) {
        console.error("❌ Erreur lors de la récupération du rôle :", e);

        if (e.error === "login_required" || e.error === "consent_required") {
          console.warn("🔁 Redirection vers Auth0...");
          loginWithRedirect();
        }

        setUserRole("");
      }
    };

    fetchRole();
  }, [isAuthenticated, getAccessTokenSilently, navigate, loginWithRedirect]);

  const handleRoleClick = (role) => {
    if (isAuthenticated) {
      if (role === "client") navigate("/client/accueil");
      else if (role === "vendeur") navigate("/vendeur/dashboard");
      else if (role === "livreur") navigate("/livreur/dashboard");
    } else {
      localStorage.setItem('signup_role', role);
      loginWithRedirect({
        screen_hint: "signup",
        authorizationParams: {
          signup_role: role,
          audience: AUTH0_AUDIENCE,
          scope: "openid profile email",
        }
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4 text-center">
      <h1 className="text-2xl font-bold">Bienvenue sur Riveltime</h1>
      <p className="text-gray-600">Choisissez votre rôle pour commencer</p>

      {!isAuthenticated ? (
        <div className="flex flex-col gap-2 w-full max-w-xs">
          <Button className="w-full" role="client" onClick={() => handleRoleClick('client')}>
            👤 Je suis un Client
          </Button>
          <Button className="w-full" role="vendeur" onClick={() => handleRoleClick('vendeur')}>
            🏪 Je suis un Commerçant
          </Button>
          <Button className="w-full" role="livreur" onClick={() => handleRoleClick('livreur')}>
            🚴 Je suis un Livreur
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 w-full max-w-xs">
          <p>Bienvenue, {user?.name} !</p>
          {userRole && (
            <p className="text-blue-600 font-semibold">
              Rôle : {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </p>
          )}
          <Button className="w-full" onClick={() => logout({ returnTo: window.location.origin })}>
            Se déconnecter
          </Button>
        </div>
      )}
    </div>
  );
}