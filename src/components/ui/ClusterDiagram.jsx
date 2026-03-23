/**
 * SVG cluster jewel diagram — supports 8–12 passive Large Cluster Jewel layouts.
 *
 * Notables and jewel sockets stay at FIXED angular positions on the ring.
 * Small passives fill the gaps between them, adapting to the passive count.
 * Switching 8→12 only adds/redistributes smalls — landmarks never move.
 *
 * Props:
 *   size         — SVG render size (default 200)
 *   mode         — 'two-sides' | 'split' | 'single-middle'
 *   passiveCount — 8..12
 */
export default function ClusterDiagram({ size = 200, mode = 'two-sides', passiveCount = 8 }) {
  const cx = 100;
  const cy = 95;
  const r = 68;
  const notableR = 15;
  const smallR = 7;
  const jewelSocketR = 10;

  // Entry socket below the ring
  const socketPos = { x: cx, y: cy + r + 30 };

  // Convert clockwise-from-bottom angle → SVG coords on the ring
  function angleToPos(angleCW) {
    const angleRad = ((90 - angleCW) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(angleRad),
      y: cy + r * Math.sin(angleRad),
    };
  }

  // Build positioned nodes (landmarks fixed, smalls interpolated)
  const nodes = buildNodes(passiveCount, angleToPos);

  // First node is always at dead-bottom (0°), aligned with entry connector
  const bottomNode = nodes[0];

  // Determine notable colors based on mode
  function getNotableStyle(type) {
    if (mode === 'split') {
      if (type === 'notable1') {
        return { fill: 'url(#desired-grad)', stroke: '#4ac864', filter: 'url(#glow-green)' };
      }
      if (type === 'notable2') {
        return { fill: 'url(#socket-grad)', stroke: '#c8a964', filter: 'url(#glow-gold)' };
      }
      if (type === 'notable3') {
        return { fill: 'url(#small-grad)', stroke: '#888', filter: 'none' };
      }
    }

    // Default: two-sides or single
    if (type === 'notable1' || type === 'notable3') {
      return { fill: 'url(#desired-grad)', stroke: '#4ac864', filter: 'url(#glow-green)' };
    }
    if (type === 'notable2') {
      return { fill: 'url(#undesired-grad)', stroke: '#c84a4a', filter: 'url(#glow-red)' };
    }
    return {};
  }

  function getNotableLabel(type) {
    if (mode === 'split') {
      if (type === 'notable1') return 'S';  // Side
      if (type === 'notable2') return 'M';  // Middle
      if (type === 'notable3') return '?';  // Unknown other side
    }
    if (type === 'notable1') return '1';
    if (type === 'notable2') return '2';
    if (type === 'notable3') return '3';
    return '';
  }

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

      {/* Connector from bottom node to entry socket */}
      <line
        x1={bottomNode.pos.x}
        y1={bottomNode.pos.y}
        x2={socketPos.x}
        y2={socketPos.y}
        stroke="#4a4a5e"
        strokeWidth="2.5"
      />

      {/* Render all nodes */}
      {nodes.map((node, i) => {
        const { type, pos } = node;

        if (type === 'small') {
          return (
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
          );
        }

        if (type === 'jewel') {
          return (
            <g key={`jewel-${i}`}>
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
          );
        }

        // Notable nodes
        const style = getNotableStyle(type);
        const label = getNotableLabel(type);
        return (
          <g key={`notable-${i}`}>
            <circle
              cx={pos.x}
              cy={pos.y}
              r={notableR}
              fill={style.fill}
              stroke={style.stroke}
              strokeWidth="2"
              filter={style.filter}
            />
            <text
              x={pos.x}
              y={pos.y + 1}
              textAnchor="middle"
              dominantBaseline="central"
              fill="white"
              fontSize="13"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              {label}
            </text>
          </g>
        );
      })}

      {/* Entry Socket (gold diamond at bottom) */}
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

/**
 * Builds positioned nodes for the cluster ring.
 *
 * 5 landmarks at FIXED angles (degrees clockwise from bottom/entry):
 *   Notable 1  — 45°  (right side,  ~4 o'clock)
 *   Jewel 1    — 110° (upper-right, ~2 o'clock)
 *   Notable 2  — 180° (top center,  12 o'clock)
 *   Jewel 2    — 250° (upper-left, ~10 o'clock)
 *   Notable 3  — 315° (left side,   ~8 o'clock)
 *
 * Small passives are evenly interpolated in the gaps between landmarks.
 * The gap distribution per passive count matches the in-game layout order.
 */
function buildNodes(passiveCount, angleToPos) {
  // Fixed landmark angles (degrees clockwise from bottom)
  const NOTABLE1 = 45;
  const JEWEL1   = 110;
  const NOTABLE2 = 180;
  const JEWEL2   = 250;
  const NOTABLE3 = 315;

  const landmarks = [
    { type: 'notable1', angle: NOTABLE1 },
    { type: 'jewel',    angle: JEWEL1 },
    { type: 'notable2', angle: NOTABLE2 },
    { type: 'jewel',    angle: JEWEL2 },
    { type: 'notable3', angle: NOTABLE3 },
  ];

  // 6 gaps around the ring between landmarks (and entry)
  const gapBounds = [
    [0,        NOTABLE1], // gap 0: entry    → notable1
    [NOTABLE1, JEWEL1],   // gap 1: notable1 → jewel1
    [JEWEL1,   NOTABLE2], // gap 2: jewel1   → notable2
    [NOTABLE2, JEWEL2],   // gap 3: notable2 → jewel2
    [JEWEL2,   NOTABLE3], // gap 4: jewel2   → notable3
    [NOTABLE3, 360],      // gap 5: notable3 → entry
  ];

  // How many small passives go in each gap per passive count
  // Total smalls = passiveCount − 5 (3 notables + 2 jewels are fixed)
  const gapSmalls = {
    8:  [1, 0, 1, 1, 0, 0],  // 3 smalls
    9:  [1, 1, 1, 1, 0, 0],  // 4 smalls
    10: [1, 1, 1, 1, 1, 0],  // 5 smalls
    11: [2, 1, 1, 1, 1, 0],  // 6 smalls
    12: [2, 1, 1, 1, 1, 1],  // 7 smalls — bottom symmetric: 2 right (like 11) + 1 left of entry
  };

  const smalls = gapSmalls[passiveCount] || gapSmalls[8];
  const nodes = [];

  for (let g = 0; g < 6; g++) {
    const [start, end] = gapBounds[g];
    const n = smalls[g];

    if (g === 0 && n > 0) {
      // Gap 0 (entry → notable1): anchor first small at dead-bottom (0°)
      // so it aligns with the entry connector line
      nodes.push({ type: 'small', pos: angleToPos(0) });
      // Additional smalls distributed evenly from 0° toward notable1
      for (let s = 1; s < n; s++) {
        const angle = s * (end / n);
        nodes.push({ type: 'small', pos: angleToPos(angle) });
      }
    } else {
      // Normal: distribute smalls evenly within the gap
      for (let s = 0; s < n; s++) {
        const t = (s + 1) / (n + 1);
        const angle = start + t * (end - start);
        nodes.push({ type: 'small', pos: angleToPos(angle) });
      }
    }

    // Place the landmark at the end of this gap (except gap 5 which returns to entry)
    if (g < 5) {
      nodes.push({ type: landmarks[g].type, pos: angleToPos(landmarks[g].angle) });
    }
  }

  return nodes;
}
