import React from 'react';

function GradientHeart({ filled = false, size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ display: "block" }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient 
          id="heart-gradient" 
          x1="0" 
          y1="0" 
          x2="24" 
          y2="24" 
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#cf0d5bff"/>
          <stop offset="1" stopColor="#f7c1dcff"/>
        </linearGradient>
      </defs>
      <path
        d="M12.1 18.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"
        fill={filled ? "url(#heart-gradient)" : "none"}
        stroke="url(#heart-gradient)"
        strokeWidth="2"
      />
    </svg>
  );
}

export default GradientHeart;