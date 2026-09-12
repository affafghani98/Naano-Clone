import type { AudienceSlice } from "@/lib/creators";

export function AudienceBars({
  title,
  slices,
}: {
  title: string;
  slices: AudienceSlice[];
}) {
  return (
    <div>
      <p className="text-sm font-medium">{title}</p>
      <ul className="mt-3 space-y-2">
        {slices.map((slice) => (
          <li key={slice.label}>
            <div className="flex justify-between text-xs text-neutral-600">
              <span>{slice.label}</span>
              <span>{slice.percent}%</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full rounded-full bg-neutral-950"
                style={{ width: `${slice.percent}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
