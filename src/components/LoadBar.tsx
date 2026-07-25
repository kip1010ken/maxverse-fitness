type LoadBarProps = {
  /** Number of segments filled, out of total */
  filled: number;
  total?: number;
  label?: string;
};

/**
 * Signature visual motif: a row of stacked segments, evoking loaded
 * weight plates. Used as a section divider and as a stat indicator
 * (e.g. plan intensity, progress) throughout the site.
 */
export default function LoadBar({ filled, total = 8, label }: LoadBarProps) {
  const segments = Array.from({ length: total }, (_, i) => i < filled);

  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1" role="img" aria-label={label ?? `${filled} of ${total}`}>
        {segments.map((isFilled, i) => (
          <span
            key={i}
            className={`h-2 w-6 rounded-sm ${isFilled ? "bg-flame" : "bg-steel/25"}`}
          />
        ))}
      </div>
      {label && (
        <span className="font-mono text-xs uppercase tracking-widest text-steel">
          {label}
        </span>
      )}
    </div>
  );
}
