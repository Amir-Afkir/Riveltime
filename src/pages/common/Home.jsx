import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import Button from "../../components/ui/Button";
import { User, Store, Bike } from "lucide-react";

const roles = [
  { role: "client", icon: <User size={18} />, label: "Je suis Client" },
  { role: "vendeur", icon: <Store size={18} />, label: "Je suis Commerçant" },
  { role: "livreur", icon: <Bike size={18} />, label: "Je suis Livreur" },
];

export default function Home() {
  const navigate = useNavigate();
  const { loginWithRedirect, isAuthenticated, logout, userData, loadingUser } = useUser();

  useEffect(() => {
    if (!loadingUser && isAuthenticated && userData?.role) {
      const role = userData.role;
      if (role === "client") navigate("/client/accueil");
      else if (role === "vendeur") navigate("/vendeur/dashboard");
      else if (role === "livreur") navigate("/livreur/dashboard");
    }
  }, [isAuthenticated, userData, loadingUser, navigate]);


  const handleRoleClick = (role) => {
    if (isAuthenticated) return;
    localStorage.setItem("signup_role", role);
    loginWithRedirect({
      screen_hint: "signup",
      authorizationParams: {
        signup_role: role,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: "openid profile email",
      },
    });
  };

  const handleManualRedirect = () => {
    const destination = {
      client: "/client/accueil",
      vendeur: "/vendeur/dashboard",
      livreur: "/livreur/dashboard",
    }[userData?.role];
    if (destination) navigate(destination);
  };

  return (
    <>
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
      <div
        className="absolute top-[0vh] left-1/2 -translate-x-1/2 z-0 flex flex-col items-center"
      >
        <img
          src="/icon-txt.svg"
          alt="Logo Riveltime"
          className="h-[200px] w-auto mb-6 sm:mb-8 md:mb-10"
        />
      </div>
        <div className="bg-white/80 backdrop-blur-sm shadow-xl border border-gray-100 rounded-3xl p-6 w-full text-center flex flex-col items-center gap-6 animate-[riseFade_600ms_ease-out_forwards] z-10">
          {!isAuthenticated ? (
            <>
              <h1 className="text-2xl font-semibold leading-tight">Bienvenue sur Riveltime</h1>
              <p className="text-gray-600 text-sm mb-4 tracking-wide">Choisissez votre rôle pour commencer</p>
              <div className="flex flex-col gap-3 w-full max-w-xs">
                {roles.map(({ role, icon, label }) => (
                  <Button
                    key={role}
                    className="w-full bg-neutral-50 !text-black border border-gray-300 hover:bg-neutral-100 active:scale-[0.98] active:shadow-inner focus-visible:ring-2 focus-visible:ring-red-300 rounded-full flex items-center justify-center gap-2 py-2.5 text-[15px] transition-all"
                    onClick={() => handleRoleClick(role)}
                  >
                    {icon} {label}
                  </Button>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 w-full max-w-xs">
              <h2 className="text-xl font-semibold text-gray-900">
                Bonjour {userData?.fullname || userData?.name || userData?.email} !
              </h2>
              {userData?.role && (
                <p className="text-gray-600 italic">
                  Votre rôle : <span className="font-medium capitalize">{userData.role}</span>
                </p>
              )}
              <p className="text-gray-500 text-sm mb-4">
                Préparation de votre espace... Vous serez redirigé sous peu.
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-[#f58ba0]/50 border-t-[#ed354f] mx-auto mb-4" />
              <Button
                className="w-full bg-neutral-50 !text-black border border-gray-300 hover:bg-neutral-100 active:scale-[0.98] active:shadow-inner focus-visible:ring-2 focus-visible:ring-red-300 rounded-full flex items-center justify-center gap-2 py-2.5 text-[15px] transition-all"
                onClick={handleManualRedirect}
              >
                Aller à mon espace
              </Button>
              <button
                type="button"
                className="w-full bg-[#ed354f] text-white rounded-full hover:bg-[#d12e47] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#f58ba0] py-2.5 text-[15px] transition-all"
                onClick={() => logout({ returnTo: import.meta.env.VITE_BASE_URL })}
              >
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}