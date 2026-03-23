/**
 * Original SVG cluster jewel diagram showing positions 1, 2, 3
 * Replaces the copied image from the original project.
 */
export default function ClusterDiagram({ size = 200 }) {
  const cx = 100;
  const cy = 100;
  const r = 70; // main ring radius
  const nodeR = 16; // node circle radius
  const smallR = 8; // small passive radius

  // Positions on the ring (clock positions)
  // Pos 1 = bottom-left (7 o'clock), Pos 2 = top (12 o'clock), Pos 3 = bottom-right (5 o'clock)
  const angle1 = (210 * Math.PI) / 180; // 7 o'clock
  const angle2 = (90 * Math.PI) / 180;  // 12 o'clock (top)
  const angle3 = (330 * Math.PI) / 180; // 5 o'clock

  const pos1 = { x: cx + r * Math.cos(angle1), y: cy - r * Math.sin(angle1) };
  const pos2 = { x: cx + r * Math.cos(angle2), y: cy - r * Math.sin(angle2) };
  const pos3 = { x: cx + r * Math.cos(angle3), y: cy - r * Math.sin(angle3) };

  // Small passives between notable positions
  const smallAngles = [150, 180, 240, 270, 0, 30, 60, 120].map(
    (deg) => (deg * Math.PI) / 180
  );
  const smallNodes = smallAngles.map((a) => ({
    x: cx + r * Math.cos(a),
    y: cy - r * Math.sin(a),
  }));

  // Jewel socket at bottom center
  const socketPos = { x: cx, y: cy + r + 28 };

  return (
    <svg
      width={size}
      height={size + 30}
      viewBox="0 -5 200 230"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Glow filters */}
        <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Gradients */}
        <radialGradient id="desired-grad" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#6aff6a" />
          <stop offset="100%" stopColor="#1a7a1a" />
        </radialGradient>
        <radialGradient id="undesired-grad" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#ff6a6a" />
          <stop offset="100%" stopColor="#7a1a1a" />
        </radialGradient>
        <radialGradient id="socket-grad" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#c8a964" />
          <stop offset="100%" stopColor="#6a5a30" />
        </radialGradient>
        <radialGradient id="small-grad" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#888" />
          <stop offset="100%" stopColor="#444" />
        </radialGradient>
      </defs>

      {/* Background ring */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#3a3a52"
        strokeWidth="3"
        opacity="0.6"
      />

      {/* Ring arc segments (connecting lines between nodes) */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#555"
        strokeWidth="2"
        strokeDasharray="4 6"
        opacity="0.4"
      />

      {/* Connection to socket */}
      <line
        x1={cx}
        y1={cy + r}
        x2={socketPos.x}
        y2={socketPos.y}
        stroke="#3a3a52"
        strokeWidth="2"
      />

      {/* Small passive nodes */}
      {smallNodes.map((pos, i) => (
        <circle
          key={`small-${i}`}
          cx={pos.x}
          cy={pos.y}
          r={smallR}
          fill="url(#small-grad)"
          stroke="#555"
          strokeWidth="1.5"
          opacity="0.5"
        />
      ))}

      {/* Position 2 — Undesired (top, red) */}
      <circle
        cx={pos2.x}
        cy={pos2.y}
        r={nodeR}
        fill="url(#undesired-grad)"
        stroke="#c84a4a"
        strokeWidth="2"
        filter="url(#glow-red)"
      />
      <text
        x={pos2.x}
        y={pos2.y + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize="14"
        fontWeight="bold"
        fontFamily="sans-serif"
      >
        2
      </text>

      {/* Position 1 — Desired (bottom-left, green) */}
      <circle
        cx={pos1.x}
        cy={pos1.y}
        r={nodeR}
        fill="url(#desired-grad)"
        stroke="#4ac864"
        strokeWidth="2"
        filter="url(#glow-green)"
      />
      <text
        x={pos1.x}
        y={pos1.y + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize="14"
        fontWeight="bold"
        fontFamily="sans-serif"
      >
        1
      </text>

      {/* Position 3 — Desired (bottom-right, green) */}
      <circle
        cx={pos3.x}
        cy={pos3.y}
        r={nodeR}
        fill="url(#desired-grad)"
        stroke="#4ac864"
        strokeWidth="2"
        filter="url(#glow-green)"
      />
      <text
        x={pos3.x}
        y={pos3.y + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize="14"
        fontWeight="bold"
        fontFamily="sans-serif"
      >
        3
      </text>

      {/* Jewel Socket */}
      <rect
        x={socketPos.x - 12}
        y={socketPos.y - 12}
        width={24}
        height={24}
        rx={4}
        fill="url(#socket-grad)"
        stroke="#c8a964"
        strokeWidth="2"
        filter="url(#glow-gold)"
        transform={`rotate(45, ${socketPos.x}, ${socketPos.y})`}
      />
    </svg>
  );
}
