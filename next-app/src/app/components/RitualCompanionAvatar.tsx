"use client";

import { useId } from "react";

import "./RitualCompanionAvatar.css";

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
        {/* Fabric noise — subtle, not overwhelming */}
        <filter id={g("fabric")} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" result="n" />
          <feColorMatrix type="saturate" values="0" in="n" result="gn" />
          <feBlend in="SourceGraphic" in2="gn" mode="multiply" result="textured" />
          <feComposite in="textured" in2="SourceGraphic" operator="in" />
        </filter>

        {/* Deep obsidian body */}
        <radialGradient id={g("obs")} cx="32%" cy="22%" r="75%">
          <stop offset="0%" stopColor="#72686e" />
          <stop offset="28%" stopColor="#2e2430" />
          <stop offset="72%" stopColor="#100810" />
          <stop offset="100%" stopColor="#050205" />
        </radialGradient>

        <radialGradient id={g("obsRim")} cx="78%" cy="82%" r="55%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>

        {/* Face/hood sheen */}
        <linearGradient id={g("sheen")} x1="20%" y1="0%" x2="55%" y2="45%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* Robe — champagne-blush, richer depth */}
        <linearGradient id={g("felt")} x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#f5ede0" />
          <stop offset="40%" stopColor="#e8d9c8" />
          <stop offset="100%" stopColor="#c9b89e" />
        </linearGradient>

        {/* Robe fold shadow — deeper for dimensionality */}
        <linearGradient id={g("feltFold")} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#000" stopOpacity="0.14" />
          <stop offset="42%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.12" />
        </linearGradient>

        {/* Subtle shimmer overlay for lapels */}
        <linearGradient id={g("lapelShimmer")} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.09" />
          <stop offset="55%" stopColor="#fff" stopOpacity="0.02" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>

        {/* Gold trim — brighter, more jewellery-like */}
        <linearGradient id={g("gold")} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8c6820" />
          <stop offset="35%" stopColor="#f0d070" />
          <stop offset="68%" stopColor="#c99430" />
          <stop offset="100%" stopColor="#a07828" />
        </linearGradient>

        {/* Warm inner glow — rose-gold instead of orange */}
        <radialGradient id={g("warm")} cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#ffb06a" stopOpacity="0.34" />
          <stop offset="60%" stopColor="#e8803a" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#c05050" stopOpacity="0" />
        </radialGradient>

        {/* Eye glow filter */}
        <filter id={g("amber")} x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="1.3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id={g("shadow")} x="-30%" y="-20%" width="160%" height="150%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2.4" floodColor="#1a0820" floodOpacity="0.55" />
        </filter>
      </defs>

      <g className="mystique-avatar__root" filter={`url(#${g("shadow")})`}>
        {/* ground shadow */}
        <ellipse cx="50" cy="124" rx="22" ry="3.2" fill="#000" opacity="0.24" />

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
          strokeWidth="0.9"
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
          strokeWidth="0.9"
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

        {/* chest emblem — rose-gold warm tones */}
        <g className="mystique-avatar__emblem" filter={`url(#${g("amber")})`}>
          <path
            d="M40 61 A10 10 0 0 0 60 61 A7 7 0 0 1 40 61 Z"
            fill="#e8904a"
          />
          <path d="M49 70.5 L50 74 L51 70.5 Z" fill="#d4af37" />
          <path d="M49 75 L50 78.2 L51 75 Z" fill="#c8a030" />
          <circle cx="50" cy="79.5" r="0.85" fill="#b8902a" />
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

        {/* hood inner rim — gold, more visible */}
        <path
          d="M26 21 C30 13 39 10 50 10 C61 10 70 13 74 21"
          fill="none"
          stroke={`url(#${g("gold")})`}
          strokeWidth="0.7"
          opacity="0.65"
        />

        {/* hood finial */}
        <path d="M50 0 L51.4 6 L48.6 6 Z" fill={`url(#${g("gold")})`} />
        <path
          d="M50 6 V13"
          fill="none"
          stroke={`url(#${g("gold")})`}
          strokeWidth="0.5"
          opacity="0.8"
        />
        <circle cx="50" cy="14" r="1.1" fill="#d4a840" />

        {/* brooch — more presence */}
        <circle cx="50" cy="46" r="3.6" fill="none" stroke={`url(#${g("gold")})`} strokeWidth="1.0" />
        <circle cx="50" cy="46" r="1.5" fill="#d4a840" />
        <circle cx="50" cy="46" r="0.6" fill="#f8e890" />

        {/* eyes — deeper amber, thicker, more presence */}
        <g className="mystique-avatar__eyes" filter={`url(#${g("amber")})`}>
          <path
            d="M39 27.5 Q42 24 45 27.5"
            fill="none"
            stroke="#f0b060"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <path
            d="M55 27.5 Q58 24 61 27.5"
            fill="none"
            stroke="#f0b060"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
        </g>

        {/* hood lapels — with shimmer */}
        <path
          d="M24 13 L18 45 C18 50 24 52 29 49 L31 26 C29 18 26 15 24 13 Z"
          fill={`url(#${g("felt")})`}
          filter={`url(#${g("fabric")})`}
        />
        <path
          d="M24 13 L18 45 C18 50 24 52 29 49 L31 26 C29 18 26 15 24 13 Z"
          fill={`url(#${g("lapelShimmer")})`}
        />
        <path
          d="M76 13 L82 45 C82 50 76 52 71 49 L69 26 C71 18 74 15 76 13 Z"
          fill={`url(#${g("felt")})`}
          filter={`url(#${g("fabric")})` }
        />
        <path
          d="M76 13 L82 45 C82 50 76 52 71 49 L69 26 C71 18 74 15 76 13 Z"
          fill={`url(#${g("lapelShimmer")})`}
        />

        {/* hem trim + embroidery */}
        <path
          d="M10 102 C24 98 38 100 50 101 C62 100 76 98 90 102"
          fill="none"
          stroke={`url(#${g("gold")})`}
          strokeWidth="1.05"
        />
        <g stroke={`url(#${g("gold")})`} fill="none" strokeWidth="0.4" opacity="0.65">
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
          strokeWidth="0.6"
        />
        <ellipse
          cx="58"
          cy="115.5"
          rx="4.8"
          ry="0.9"
          fill="none"
          stroke={`url(#${g("gold")})`}
          strokeWidth="0.6"
        />

        {/* inner warmth — rose-gold glow, boosted */}
        <ellipse
          className="mystique-avatar__hood-glow"
          cx="50"
          cy="31"
          rx="22"
          ry="16"
          fill={`url(#${g("warm")})`}
        />
      </g>
    </svg>
  );
}
