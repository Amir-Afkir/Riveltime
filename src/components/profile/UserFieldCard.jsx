// ✅ UserFieldCard.jsx
export default function UserFieldCard({ icon, value }) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
        {icon && <div className="text-gray-500 w-5 h-5">{icon}</div>}
        <span className="text-sm text-gray-800 break-words leading-snug">
          {value || <em className="text-gray-400">Non renseigné</em>}
        </span>
      </div>
    );
  }