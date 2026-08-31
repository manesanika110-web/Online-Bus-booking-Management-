import React from "react";

const BusVistaLogo = ({ size = 48, width, height, className = "" }) => {
  const finalWidth = width || Math.round(size * 1.45);
  const finalHeight = height || size;

  return (
    <svg
      width={finalWidth}
      height={finalHeight}
      viewBox="0 0 1000 700"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", overflow: "visible" }}
    >
      {/* Ground Shadow */}
      <path
        d="M 50 540 L 400 750 L 950 560 L 600 370 Z"
        fill="rgba(0,0,0,0.12)"
      />

      {/* Main Bus Body - Left Front Face */}
      <path
        d="M 60 410 L 320 460 L 320 680 L 60 630 Z"
        fill="#c62828"
      />

      {/* Main Bus Body - Right Long Side Face */}
      <path
        d="M 320 460 L 940 250 L 940 500 L 320 680 Z"
        fill="#e53935"
      />

      {/* Bus Top Roof */}
      <path
        d="M 120 310 L 320 340 L 940 210 L 740 185 Z"
        fill="#ef5350"
      />
      <path
        d="M 60 410 L 120 310 L 740 185 L 940 210 L 940 250 L 320 460 Z"
        fill="#d32f2f"
      />

      {/* Front Windshield Window */}
      <path
        d="M 75 390 L 125 330 L 310 355 L 310 520 L 75 490 Z"
        fill="#90caf9"
        opacity="0.9"
      />
      {/* Center Pillar */}
      <path
        d="M 190 340 L 195 505 L 180 503 L 175 338 Z"
        fill="#b71c1c"
      />

      {/* Front Headlights & Bumper */}
      <rect x="75" y="560" width="22" height="14" rx="4" fill="#ffffff" />
      <rect x="105" y="565" width="22" height="14" rx="4" fill="#ffffff" />
      <path d="M 140 575 L 260 595 L 260 605 L 140 585 Z" fill="#263238" />
      <path d="M 60 595 L 320 645 L 320 680 L 60 630 Z" fill="#991b1b" />

      {/* Side Windows (Slanted Glass Panes) */}
      <path
        d="M 345 440 L 430 410 L 430 500 L 345 525 Z"
        fill="#e1f5fe"
      />
      <path
        d="M 445 405 L 530 375 L 530 470 L 445 495 Z"
        fill="#b3e5fc"
      />
      <path
        d="M 545 370 L 630 340 L 630 440 L 545 465 Z"
        fill="#81d4fa"
      />
      <path
        d="M 645 335 L 730 305 L 730 410 L 645 435 Z"
        fill="#b3e5fc"
      />
      <path
        d="M 745 300 L 830 270 L 830 380 L 745 405 Z"
        fill="#e1f5fe"
      />
      <path
        d="M 845 265 L 925 240 L 925 350 L 845 375 Z"
        fill="#b3e5fc"
      />

      {/* Lower Dark Contrast Stripe */}
      <path
        d="M 320 545 L 940 345 L 940 480 L 320 660 Z"
        fill="#7f1d1d"
      />

      {/* Front Left Wheel */}
      <ellipse cx="440" cy="620" rx="42" ry="70" fill="#1e293b" />
      <ellipse cx="440" cy="620" rx="24" ry="40" fill="#cbd5e1" />
      <circle cx="440" cy="620" r="10" fill="#1e293b" />

      {/* Rear Right Wheel */}
      <ellipse cx="780" cy="510" rx="42" ry="70" fill="#1e293b" />
      <ellipse cx="780" cy="510" rx="24" ry="40" fill="#cbd5e1" />
      <circle cx="780" cy="510" r="10" fill="#1e293b" />
    </svg>
  );
};

export default BusVistaLogo;
