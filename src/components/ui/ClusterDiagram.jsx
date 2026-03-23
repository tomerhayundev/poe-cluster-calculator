/**
 * Original SVG cluster jewel diagram — accurate 8-passive Large Cluster Jewel layout.
 *
 * Correct clockwise layout from entry socket at bottom:
 *   Socket(entry) → Small → Notable1(green) → Small → JewelSocket → Notable2(red) → JewelSocket → Small → Notable3(green) → Small → back to Socket
 *
 * That's 10 ring positions evenly spaced at 36° apart.
 * The entry socket sits below the ring, connected by a short line.
 */
export default function ClusterDiagram({ size = 200 }) {
  const cx = 100;
  const cy = 100;
  const r = 70;
  const notableR = 15;
  const smallR = 7;
  const jewelSocketR = 10;

  // 10 positions on the ring, evenly spaced 36° apart.
  // Position 0 = bottom center (6 o'clock, where entry connects).
  // Going CLOCKWISE: 0→1→2→...→9
  // In SVG, Y grows downward. To go clockwise from bottom:
  //   bottom = 90° in SVG coords (cos90=0, sin90=1 → cy+r = bottom)
  //   clockwise in SVG = subtract angle
  function ringPos(index) {
    const angleDeg = 90 - index * 36; // clockwise from bottom
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(angleRad),
      y: cy + r * Math.sin(angleRad),
    };
  }

  // Ring positions (clockwise from bottom):
  // 0: entry point (bottom, where socket connects — no node drawn here, just the arc)
  // 1: small passive
  // 2: Notable 1 (desired, green) — left side
  // 3: small passive
  // 4: Jewel socket — upper-left
  // 5: Notable 2 (undesired, red) — top
  // 6: Jewel socket — upper-right
  // 7: small passive
  // 8: Notable 3 (desired, green) — right side
  // 9: small passive

  const small1 = ringPos(1);
  const notable1 = ringPos(2);
  const small2 = ringPos(3);
  const jsocket1 = ringPos(4);
  const notable2 = ringPos(5);
  const jsocket2 = ringPos(6);
  const small3 = ringPos(7);
  const notable3 = ringPos(8);
  const small4 = ringPos(9);

  // Entry socket below the ring
  const entryPoint = ringPos(0);
  const socketPos = { x: cx, y: cy + r + 26 };

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

      {/* Connection line from ring bottom to entry socket */}
      <line
        x1={entryPoint.x}
        y1={entryPoint.y}
        x2={socketPos.x}
        y2={socketPos.y}
        stroke="#4a4a5e"
        strokeWidth="2.5"
      />

      {/* --- Small Passives (4 total) --- */}
      {[small1, small2, small3, small4].map((pos, i) => (
        <circle
          key={`small-${i}`}
          cx={pos.x}
          cy={pos.y}
          r={smallR}
          fill="url(#small-grad)"
          stroke="#666"
          strokeWidth="1.5"
          opacity="0.6"
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
          {/* Inner diamond shape to distinguish from passives */}
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

      {/* --- Notable 1 — Desired (left, green) --- */}
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

      {/* --- Notable 3 — Desired (right, green) --- */}
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
