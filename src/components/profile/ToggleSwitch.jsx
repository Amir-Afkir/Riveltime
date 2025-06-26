// ✅ src/components/profile/ToggleSwitch.jsx
export default function ToggleSwitch({
    label = "",
    checked = false,
    onChange = () => {},
    readOnly = true,
    role = "client" // nouveau
  }) {
    const roleColor = {
      client: "bg-blue-500",
      vendeur: "bg-green-500",
      livreur: "bg-orange-500",
    };
  
    const activeColor = roleColor[role] || "bg-gray-500";
  
    return (
      <label className="flex items-center justify-between gap-3 py-2">
        {label && <span className="text-sm text-gray-700 font-medium">{label}</span>}
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => !readOnly && onChange(!checked)}
          disabled={readOnly}
          className={`relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out 
            ${checked ? activeColor : "bg-gray-300"}`}
        >
          <span className="sr-only">{label || "Toggle"}</span>
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow transition duration-300 ease-in-out
              ${checked ? "translate-x-5" : "translate-x-0"}`}
          />
        </button>
      </label>
    );
  }