import React from "react";

function LogoSymbol({ className }: { className?: string }) {
  return (
    <div className="logo-symbol-wrapper">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 120 120"
        className={className}
      >
        <g>
          <path d="m61.354 81.508 25.037-8.06V55.927L34.163 72.739v17.522L118 117.298V99.776L61.354 81.508zM2.553 1.852v17.522L59.2 37.642l-25.037 8.06v17.522l52.228-16.813V28.889L2.553 1.852z" />
        </g>
      </svg>
    </div>
  );
}

export default LogoSymbol;
