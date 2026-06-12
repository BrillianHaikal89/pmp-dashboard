function DeltaBadge({ val }: { val: number }) {
  if (val === 0) return <span className="sbc-delta neutral">±0</span>;
  return (
    <span className={`sbc-delta ${val > 0 ? "up" : "down"}`}>
      {val > 0 ? "▲" : "▼"} {Math.abs(val)}
    </span>
  );
}

export function StatRow({
  label,
  val24,
  val25,
  color24,
}: {
  label: string;
  val24: number;
  val25: number;
  color24: string;
}) {
  const delta = val25 - val24;
  return (
    <div className="sbc-stat-row">
      <div className="sbc-stat-label">
        <span className="sbc-swatch" style={{ background: color24 }} />
        {label}
      </div>
      <div className="sbc-stat-nums">
        <span className="sbc-num">{val24}</span>
        <span className="sbc-arrow">→</span>
        <span className="sbc-num">{val25}</span>
        <DeltaBadge val={delta} />
      </div>
    </div>
  );
}
