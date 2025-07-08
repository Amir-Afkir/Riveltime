import React from "react";

const fileInputClass =
  "block w-full text-sm text-gray-800 file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border file:border-gray-300 file:font-semibold file:bg-neutral-50 file:text-black hover:file:bg-neutral-100 file:cursor-pointer file:leading-tight file:focus-visible:outline-none file:focus-visible:ring-2 file:focus-visible:ring-primary transition";

export default function FileInput({
  id,
  name,
  accept = "image/*",
  onChange,
  ariaLabel,
}) {
  return (
    <input
      id={id}
      name={name}
      type="file"
      accept={accept}
      aria-label={ariaLabel || name}
      onChange={onChange}
      className={fileInputClass}
    />
  );
}