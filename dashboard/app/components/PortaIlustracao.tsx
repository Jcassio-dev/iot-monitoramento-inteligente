"use client";

interface PortaIlustracaoProps {
  aberta: boolean;
}

export function PortaIlustracao({ aberta }: PortaIlustracaoProps) {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-auto max-w-[180px]">
      <rect x="30" y="20" width="140" height="130" rx="2" fill="none" stroke="var(--ink)" strokeWidth="2" />

      {aberta && (
        <rect x="36" y="26" width="128" height="118" fill="var(--ink)" opacity="0.06" />
      )}

      <g
        style={{
          transformOrigin: "38px 30px",
          transform: aberta ? "rotateY(0deg) skewY(-8deg) scaleX(0.78) translateX(2px)" : "none",
          transition: "transform 0.5s cubic-bezier(0.34, 1.2, 0.64, 1)",
        }}
      >
        <rect
          x="38"
          y="30"
          width="124"
          height="110"
          rx="1"
          fill={aberta ? "var(--ok)" : "var(--signal)"}
          opacity={aberta ? 0.15 : 0.12}
          stroke={aberta ? "var(--ok)" : "var(--signal)"}
          strokeWidth="2"
          style={{ transition: "fill 0.4s ease, stroke 0.4s ease" }}
        />
        <circle
          cx="148"
          cy="86"
          r="3.5"
          fill={aberta ? "var(--ok)" : "var(--signal)"}
          style={{ transition: "fill 0.4s ease" }}
        />
      </g>

      {aberta && (
        <circle cx="100" cy="135" r="4" fill="var(--ok)" opacity="0.6">
          <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.6s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );
}
