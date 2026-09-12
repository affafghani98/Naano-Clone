import { formatEuro } from "@/lib/money";
import {
  formatCompact,
  tagLine,
  type MarketplaceCreator,
} from "@/lib/creators";

export function CreatorCard({
  creator,
  selected,
  onOpen,
  onToggleSelect,
  onToggleShortlist,
  onBook,
  emphasizeMatch,
}: {
  creator: MarketplaceCreator;
  selected: boolean;
  onOpen: () => void;
  onToggleSelect: () => void;
  onToggleShortlist: () => void;
  onBook: () => void;
  emphasizeMatch: boolean;
}) {
  return (
    <article className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <label className="flex items-center gap-2 text-sm text-neutral-500">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
          />
          Select
        </label>
        <div className="flex items-center gap-2">
          <a
            href={`https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(creator.name)}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[#0a66c2] underline"
          >
            LinkedIn
          </a>
          <button
            type="button"
            onClick={onToggleShortlist}
            className="text-lg leading-none"
            aria-label={creator.shortlisted ? "Remove from shortlist" : "Shortlist"}
          >
            {creator.shortlisted ? "★" : "☆"}
          </button>
          <button
            type="button"
            onClick={onBook}
            className="rounded-full bg-neutral-950 px-3 py-1 text-xs font-medium text-white"
          >
            Book
          </button>
        </div>
      </div>

      <button type="button" onClick={onOpen} className="mt-4 text-left">
        <img
          src={creator.photoUrl}
          alt=""
          className="h-16 w-16 rounded-full object-cover"
        />
        <h2 className="mt-3 font-semibold">{creator.name}</h2>
        <p className="mt-1 text-sm text-neutral-600">{tagLine(creator)}</p>
        {emphasizeMatch ? (
          <p className="mt-2 text-sm font-medium">{creator.matchPercent}% match</p>
        ) : null}
      </button>

      <dl className="mt-4 grid grid-cols-2 gap-2 text-xs text-neutral-600">
        <div>
          <dt>Followers</dt>
          <dd className="text-sm font-medium text-neutral-950">
            {formatCompact(creator.followers)}
          </dd>
        </div>
        <div>
          <dt>Median views</dt>
          <dd className="text-sm font-medium text-neutral-950">
            {formatCompact(creator.medianViews)}
          </dd>
        </div>
        <div>
          <dt>CPM</dt>
          <dd className="text-sm font-medium text-neutral-950">
            {formatEuro(creator.cpmCents)}
          </dd>
        </div>
        <div>
          <dt>Post cost</dt>
          <dd className="text-sm font-medium text-neutral-950">
            {formatEuro(creator.postCostCents)}
          </dd>
        </div>
      </dl>
    </article>
  );
}
