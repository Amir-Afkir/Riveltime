// src/components/ui/Title.jsx
export default function Title({ children, level = 1, className = "" }) {
  const Tag = `h${level}`;
  const baseStyles = "font-bold text-gray-800";
  const sizeMap = {
    1: "text-2xl",
    2: "text-xl",
    3: "text-lg",
    4: "text-md",
    5: "text-sm",
    6: "text-xs",
  };

  return (
    <Tag className={`${baseStyles} ${sizeMap[level] || sizeMap[1]} ${className}`}>
      {children}
    </Tag>
  );
}