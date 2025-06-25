// ✅ src/components/profile/ToggleSwitch.jsx
export default function ToggleSwitch({ label, checked = false, onChange = () => {}, readOnly = true }) {
    return (
      <label className="flex items-center justify-between py-2">
        <span>{label}</span>
        <input
          type="checkbox"
          className="form-checkbox h-5 w-5 text-blue-600"
          checked={checked}
          onChange={onChange}
          readOnly={readOnly}
        />
      </label>
    );
  }