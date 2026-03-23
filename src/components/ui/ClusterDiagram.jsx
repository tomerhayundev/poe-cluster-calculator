/**
 * Original SVG cluster jewel diagram — accurate 8-passive Large Cluster Jewel layout.
 *
 * Correct layout from the reference image (clockwise from bottom):
 *   Small(bottom) → Notable1(left) → JewelSocket(upper-left) → Small(top-left) → Notable2(top) → Small(top-right) → JewelSocket(upper-right) → Notable3(right) → back to Small(bottom)
 *
 * That's 8 nodes on the ring. Entry socket sits below, connected to the bottom small passive.
 */
export default function ClusterDiagram({ size = 200 }) {
  const cx = 100;
  const cy = 95;
  const r = 68;
  const notableR = 15;
  const smallR = 7;
  const jewelSocketR = 10;

  // 8 positions on the ring, evenly spaced 45° apart.
  // Position 0 = bottom center (6 o'clock).
  // Clockwise in SVG (Y-down): start at 90° and subtract.
  function ringPos(index) {
    const angleDeg = 90 - index * 45;
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(angleRad),
      y: cy + r * Math.sin(angleRad),
    };
  }

  // 8 ring positions (clockwise from bottom):
  // 0: Small passive (bottom center) — entry connects here
  // 1: Notable 1 (desired, green) — lower-left
  // 2: Jewel socket (blue) — upper-left
  // 3: Small passive — top-left of Notable 2
  // 4: Notable 2 (undesired, red) — top center
  // 5: Small passive — top-right of Notable 2
  // 6: Jewel socket (blue) — upper-right
  // 7: Notable 3 (desired, green) — lower-right

  const smallBottom = ringPos(0);
  const notable1 = ringPos(1);
  const jsocket1 = ringPos(2);
  const smallLeft = ringPos(3);
  const notable2 = ringPos(4);
  const smallRight = ringPos(5);
  const jsocket2 = ringPos(6);
  const notable3 = ringPos(7);

  // Entry socket below the ring, connected to bottom small
  const socketPos = { x: cx, y: cy + r + 30 };

  return (
    <svg
      width={size}
      height={size + 30}
      viewBox="0 -5 200 230"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
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
        <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

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
        <radialGradient id="jewelsocket-grad" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#6a9aff" />
          <stop offset="100%" stopColor="#1a3a7a" />
        </radialGradient>
      </defs>

      {/* Ring path */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#4a4a5e"
        strokeWidth="3"
        opacity="0.7"
      />

      {/* Connection line from bottom small passive to entry socket */}
      <line
        x1={smallBottom.x}
        y1={smallBottom.y}
        x2={socketPos.x}
        y2={socketPos.y}
        stroke="#4a4a5e"
        strokeWidth="2.5"
      />

      {/* --- Small Passives (3 total: bottom + flanking Notable 2) --- */}
      {[smallBottom, smallLeft, smallRight].map((pos, i) => (
        <circle
          key={`small-${i}`}
          cx={pos.x}
          cy={pos.y}
          r={smallR}
          fill="url(#small-grad)"
          stroke="#666"
          strokeWidth="1.5"
          opacity="0.7"
        />
      ))}

      {/* --- Jewel Sockets (2 total, blue) --- */}
      {[jsocket1, jsocket2].map((pos, i) => (
        <g key={`jsocket-${i}`}>
          <circle
            cx={pos.x}
            cy={pos.y}
            r={jewelSocketR}
            fill="url(#jewelsocket-grad)"
            stroke="#5588cc"
            strokeWidth="2"
            filter="url(#glow-blue)"
          />
          <rect
            x={pos.x - 4}
            y={pos.y - 4}
            width={8}
            height={8}
            rx={1}
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1"
            transform={`rotate(45, ${pos.x}, ${pos.y})`}
          />
        </g>
      ))}

      {/* --- Notable 2 — Undesired (top, red) --- */}
      <circle
        cx={notable2.x}
        cy={notable2.y}
        r={notableR}
        fill="url(#undesired-grad)"
        stroke="#c84a4a"
        strokeWidth="2"
        filter="url(#glow-red)"
      />
      <text
        x={notable2.x}
        y={notable2.y + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize="13"
        fontWeight="bold"
        fontFamily="sans-serif"
      >
        2
      </text>

      {/* --- Notable 1 — Desired (lower-left, green) --- */}
      <circle
        cx={notable1.x}
        cy={notable1.y}
        r={notableR}
        fill="url(#desired-grad)"
        stroke="#4ac864"
        strokeWidth="2"
        filter="url(#glow-green)"
      />
      <text
        x={notable1.x}
        y={notable1.y + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize="13"
        fontWeight="bold"
        fontFamily="sans-serif"
      >
        1
      </text>

      {/* --- Notable 3 — Desired (lower-right, green) --- */}
      <circle
        cx={notable3.x}
        cy={notable3.y}
        r={notableR}
        fill="url(#desired-grad)"
        stroke="#4ac864"
        strokeWidth="2"
        filter="url(#glow-green)"
      />
      <text
        x={notable3.x}
        y={notable3.y + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize="13"
        fontWeight="bold"
        fontFamily="sans-serif"
      >
        3
      </text>

      {/* --- Entry Socket (gold diamond at bottom) --- */}
      <rect
        x={socketPos.x - 11}
        y={socketPos.y - 11}
        width={22}
        height={22}
        rx={3}
        fill="url(#socket-grad)"
        stroke="#c8a964"
        strokeWidth="2"
        filter="url(#glow-gold)"
        transform={`rotate(45, ${socketPos.x}, ${socketPos.y})`}
      />
    </svg>
  );
}
