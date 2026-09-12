export function ReachChart({ points }: { points: number[] }) {
  if (points.length < 2) {
    return <p className="text-sm text-neutral-500">No reach history yet.</p>;
  }

  const width = 320;
  const height = 96;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = Math.max(max - min, 1);
  const coords = points.map((value, index) => {
    const x = (index / (points.length - 1)) * width;
    const y = height - ((value - min) / span) * (height - 8) - 4;
    return `${x},${y}`;
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-24 w-full" role="img">
      <title>Reach over time</title>
      <polyline
        fill="none"
        stroke="#171717"
        strokeWidth="2"
        points={coords.join(" ")}
      />
    </svg>
  );
}
