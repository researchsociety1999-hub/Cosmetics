"use client";

import { useId } from "react";

type RitualCompanionAvatarProps = {
  className?: string;
  isWaving?: boolean;
  variant?: "launcher" | "header";
};

export function RitualCompanionAvatar({
  className = "",
  isWaving = false,
  variant = "launcher",
}: RitualCompanionAvatarProps) {
  const uid = useId().replace(/:/g, "");
  const g = (name: string) => `${uid}-${name}`;

  const sizeClass =
    variant === "header"
      ? "h-7 w-[1.85rem]"
      : "h-[3.15rem] w-[2.45rem] md:h-[3.4rem] md:w-[2.65rem]";

  return (
    <svg
      viewBox="0 0 100 128"
      className={`mystique-avatar block overflow-visible ${sizeClass} ${isWaving ? "mystique-avatar--waving" : ""} ${className}`.trim()}
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <filter id={g("fabric")} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" result="n" />
          <feColorMatrix type="saturate" values="0" in="n" result="gn" />
          <feBlend in="SourceGraphic" in2="gn" mode="multiply" />
        </filter>

        <radialGradient id={g("obs")} cx="32%" cy="22%" r="75%">
          <stop offset="0%" stopColor="#64646e" />
          <stop offset="28%" stopColor="#282830" />
          <stop offset="72%" stopColor="#0c0c10" />
          <stop offset="100%" stopColor="#020203" />
        </radialGradient>

        <radialGradient id={g("obsRim")} cx="78%" cy="82%" r="55%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>

        <linearGradient id={g("sheen")} x1="20%" y1="0%" x2="55%" y2="45%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        <linearGradient id={g("felt")} x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#f3ece1" />
          <stop offset="48%" stopColor="#e5dacc" />
          <stop offset="100%" stopColor="#cfc3ae" />
        </linearGradient>

        <linearGradient id={g("feltFold")} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#000" stopOpacity="0.1" />
          <stop offset="45%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.08" />
        </linearGradient>

        <linearGradient id={g("gold")} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9a7730" />
          <stop offset="45%" stopColor="#dfc06a" />
          <stop offset="100%" stopColor="#a88438" />
        </linearGradient>

        <radialGradient id={g("warm")} cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#ff9a3c" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#ff9a3c" stopOpacity="0" />
        </radialGradient>

        <filter id={g("amber")} x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="1.1" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id={g("shadow")} x="-30%" y="-20%" width="160%" height="150%">
          <feDropShadow dx="0" dy="2.2" stdDeviation="2" floodColor="#000" floodOpacity="0.48" />
        </filter>
      </defs>

      <g className="mystique-avatar__root" filter={`url(#${g("shadow")})`}>
        {/* ground */}
        <ellipse cx="50" cy="124" rx="22" ry="3.2" fill="#000" opacity="0.22" />

        {/* robe skirt */}
        <path
          className="mystique-avatar__cloak"
          d="M14 53 C20 41 34 35 50 35 C66 35 80 41 86 53
             L92 102 C92 110 84 116 50 116 C16 116 8 110 8 102 Z"
          fill={`url(#${g("felt")})`}
          filter={`url(#${g("fabric")})`}
        />
        <path
          d="M14 53 C20 41 34 35 50 35 C66 35 80 41 86 53
             L92 102 C92 110 84 116 50 116 C16 116 8 110 8 102 Z"
          fill={`url(#${g("feltFold")})`}
        />

        {/* left bell sleeve */}
        <path
          d="M10 49 C6 56 4 66 6 76 C8 84 13 88 19 86 L23 61 C21 53 17 49 10 49 Z"
          fill={`url(#${g("felt")})`}
          filter={`url(#${g("fabric")})`}
        />
        <path
          d="M6 76 C8 84 13 88 19 86"
          fill="none"
          stroke={`url(#${g("gold")})`}
          strokeWidth="0.75"
        />

        {/* right sleeve */}
        <path
          d="M90 49 C94 56 96 68 94 78 C92 86 87 90 81 88 L77 61 C79 53 83 49 90 49 Z"
          fill={`url(#${g("felt")})`}
          filter={`url(#${g("fabric")})`}
        />
        <path
          d="M94 78 C92 86 87 90 81 88"
          fill="none"
          stroke={`url(#${g("gold")})`}
          strokeWidth="0.75"
        />

        {/* hood */}
        <path
          className="mystique-avatar__hood"
          d="M24 13 C30 1 40 0 50 0 C60 0 70 1 76 13
             L81 45 C81 51 75 55 50 55 C25 55 19 51 19 45 Z"
          fill={`url(#${g("felt")})`}
          filter={`url(#${g("fabric")})`}
        />

        {/* torso */}
        <path
          className="mystique-avatar__body"
          d="M37 51 C37 47 43 45 50 45 C57 45 63 47 63 51
             L65 71 C65 77 59 81 50 81 C41 81 35 77 35 71 Z"
          fill={`url(#${g("obs")})`}
        />
        <path
          d="M37 51 C37 47 43 45 50 45 C57 45 63 47 63 51
             L65 71 C65 77 59 81 50 81 C41 81 35 77 35 71 Z"
          fill={`url(#${g("obsRim")})`}
        />

        {/* chest emblem */}
        <g className="mystique-avatar__emblem" filter={`url(#${g("amber")})`}>
          <path
            d="M40 61 A10 10 0 0 0 60 61 A7 7 0 0 1 40 61 Z"
            fill="#f09840"
          />
          <path d="M49 70.5 L50 74 L51 70.5 Z" fill="#d4af37" />
          <path d="M49 75 L50 78.2 L51 75 Z" fill="#d4af37" />
          <circle cx="50" cy="79.5" r="0.75" fill="#c9a04a" />
        </g>

        {/* resting hand — viewer right */}
        <g>
          <path
            d="M79 68 C83 68 86 72 86 77 C86 81 83 84 79 83 C76 82 74 78 74 74 C74 70 76 68 79 68 Z"
            fill={`url(#${g("obs")})`}
          />
        </g>

        {/* wave hand — viewer left */}
        <g className="mystique-avatar__wave-arm">
          <path
            d="M21 56 C17 56 14 59 14 63 C14 67 17 70 21 69 L24 58 C23 56 22 56 21 56 Z"
            fill={`url(#${g("obs")})`}
          />
          <path
            d="M11 42 C11 38 14 36 17 37 C20 38 22 41 21 44
               C19 47 15 47 13 45 C11 44 11 42 11 42 Z"
            fill={`url(#${g("obs")})`}
          />
        </g>

        {/* face */}
        <circle cx="50" cy="29" r="16.5" fill={`url(#${g("obs")})`} />
        <ellipse cx="43" cy="22" rx="5.5" ry="3.8" fill={`url(#${g("sheen")})`} />

        {/* hood inner rim */}
        <path
          d="M26 21 C30 13 39 10 50 10 C61 10 70 13 74 21"
          fill="none"
          stroke={`url(#${g("gold")})`}
          strokeWidth="0.55"
          opacity="0.5"
        />

        {/* hood finial */}
        <path d="M50 0 L51.1 5.8 L48.9 5.8 Z" fill={`url(#${g("gold")})`} />
        <path
          d="M50 5.8 V13"
          fill="none"
          stroke={`url(#${g("gold")})`}
          strokeWidth="0.45"
          opacity="0.7"
        />
        <circle cx="50" cy="14" r="0.95" fill="#c9a04a" />

        {/* brooch */}
        <circle cx="50" cy="46" r="3.2" fill="none" stroke={`url(#${g("gold")})`} strokeWidth="0.8" />
        <circle cx="50" cy="46" r="1.2" fill="#c9a04a" />

        {/* eyes */}
        <g className="mystique-avatar__eyes" filter={`url(#${g("amber")})`}>
          <path
            d="M39 27.5 Q42 24 45 27.5"
            fill="none"
            stroke="#f5a045"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M55 27.5 Q58 24 61 27.5"
            fill="none"
            stroke="#f5a045"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </g>

        {/* hood lapels */}
        <path
          d="M24 13 L18 45 C18 50 24 52 29 49 L31 26 C29 18 26 15 24 13 Z"
          fill={`url(#${g("felt")})`}
          filter={`url(#${g("fabric")})`}
        />
        <path
          d="M76 13 L82 45 C82 50 76 52 71 49 L69 26 C71 18 74 15 76 13 Z"
          fill={`url(#${g("felt")})`}
          filter={`url(#${g("fabric")})`}
        />

        {/* hem trim + embroidery */}
        <path
          d="M10 102 C24 98 38 100 50 101 C62 100 76 98 90 102"
          fill="none"
          stroke={`url(#${g("gold")})`}
          strokeWidth="0.9"
        />
        <g stroke={`url(#${g("gold")})`} fill="none" strokeWidth="0.35" opacity="0.55">
          <path d="M24 104 Q30 101 36 104" />
          <path d="M64 104 Q70 101 76 104" />
        </g>

        {/* feet */}
        <ellipse cx="42" cy="114.5" rx="5.5" ry="3.2" fill={`url(#${g("obs")})`} />
        <ellipse cx="58" cy="114.5" rx="5.5" ry="3.2" fill={`url(#${g("obs")})`} />
        <ellipse
          cx="42"
          cy="115.5"
          rx="4.8"
          ry="0.9"
          fill="none"
          stroke={`url(#${g("gold")})`}
          strokeWidth="0.55"
        />
        <ellipse
          cx="58"
          cy="115.5"
          rx="4.8"
          ry="0.9"
          fill="none"
          stroke={`url(#${g("gold")})`}
          strokeWidth="0.55"
        />

        {/* inner warmth */}
        <ellipse
          className="mystique-avatar__hood-glow"
          cx="50"
          cy="33"
          rx="20"
          ry="14"
          fill={`url(#${g("warm")})`}
        />
      </g>
    </svg>
  );
}
