import * as React from "react";

export default function Arrow(props: {
  from: { x: number; y: number };
  to: { x: number; y: number };
}) {
  const dx = props.from.x - props.to.x;
  const dy = props.from.y - props.to.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const ang = (Math.atan2(dy, dx) * 180) / Math.PI;

  return (
    <React.Fragment>
      <svg
        style={{
          position: "absolute",
          left: props.from.x,
          top: props.from.y,
          width: 1,
          height: 1,
          overflow: "visible",
        }}
      >
        <defs>
          <marker
            id="arrow"
            markerWidth="24"
            markerHeight="24"
            refX="2"
            refY="6"
            orient="auto"
          >
            <path d="M2,2 L2,11 L10,6 L2,2" fill="#78716C" />
          </marker>
        </defs>

        <g transform={`rotate(${ang - 180} 0 0)`}>
          <line
            x1={0}
            y1={0}
            x2={dist - 20}
            y2={0}
            stroke="#78716C"
            strokeWidth={2}
            markerEnd="url(#arrow)"
          />
        </g>
      </svg>
    </React.Fragment>
  );
}
