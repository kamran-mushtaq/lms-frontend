import React from "react";

function LogoText({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 116 34"
      className={className}
    >
      <path d="M10.5 26.4h17.8v6.7H1v-6.7L18.8 7.7H1V1h27.4v6.7L10.5 26.4z" />
      <path d="M60.1 17c0-8.8-7.2-16-16-16S28.2 8.2 28.2 17s7.2 16 16 16 16-7.2 16-16h-.1Zm-16 9.4c-5.2 0-9.4-4.2-9.4-9.4s4.2-9.4 9.4-9.4 9.4 4.2 9.4 9.4-4.2 9.4-9.4 9.4ZM99 1c-8.9 0-16 7.2-16 16s7.2 16 16 16 16-7.2 16-16-7.1-16-16-16Zm-.1 25.4c-5.2 0-9.4-4.2-9.4-9.4s4.2-9.4 9.4-9.4 9.4 4.2 9.4 9.4-4.2 9.4-9.4 9.4ZM78.6 1l-7 21.6-7-21.6h-6.7l10.3 32h6.7L85.3 1h-6.7z" />
    </svg>
  );
}

export default LogoText;
