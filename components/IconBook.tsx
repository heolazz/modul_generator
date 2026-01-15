import React from 'react';

export const IconBook = ({ className, color }: { className?: string; color?: string }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 40 C 20 20, 40 20, 40 20 L 160 20 C 180 20, 180 40, 180 40 L 180 180 L 20 180 L 20 40 Z"
        fill={color || "currentColor"}
        opacity="0.1"
      />
      <path
        d="M130 20 L 130 100 L 155 80 L 180 100 L 180 20 Z"
        fill={color || "currentColor"}
        opacity="0.2"
      />
       <rect
        x="35"
        y="40"
        width="130"
        height="120"
        rx="5"
        stroke={color || "currentColor"}
        strokeWidth="4"
        opacity="0.15"
       />
    </svg>
  );
};