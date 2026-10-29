interface PaginationProps {
  page: number;
  pageCount: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  pageCount,
  total,
  limit,
  onPageChange,
}: PaginationProps) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1).filter(
    (candidate) => {
      if (pageCount <= 7) return true;
      if (candidate === 1 || candidate === pageCount) return true;
      return Math.abs(candidate - page) <= 1;
    },
  );

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-outline-variant px-5 py-4 sm:flex-row">
      <p className="text-xs text-on-surface-variant">
        Showing <span className="font-bold text-on-surface">{from}</span> to{' '}
        <span className="font-bold text-on-surface">{to}</span> of{' '}
        <span className="font-bold text-on-surface">{total}</span> members
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="rounded-lg border border-outline-variant px-3 py-1.5 text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container disabled:opacity-40"
        >
          Previous
        </button>

        {pages.map((candidate, index) => {
          const previous = pages[index - 1];
          const showGap = previous !== undefined && candidate - previous > 1;

          return (
            <span key={candidate} className="flex items-center gap-1.5">
              {showGap ? <span className="px-1 text-xs text-outline">…</span> : null}
              <button
                type="button"
                onClick={() => onPageChange(candidate)}
                aria-current={candidate === page ? 'page' : undefined}
                className={`h-8 min-w-8 rounded-lg px-2 text-xs font-bold transition-colors ${
                  candidate === page
                    ? 'bg-primary text-on-primary'
                    : 'border border-outline-variant text-on-surface hover:bg-surface-container'
                }`}
              >
                {candidate}
              </button>
            </span>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          aria-label="Next page"
          className="rounded-lg border border-outline-variant px-3 py-1.5 text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
