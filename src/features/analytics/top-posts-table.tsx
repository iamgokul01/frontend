import { Avatar } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/empty-state';
import { Pagination } from '@/components/ui/pagination';
import { ROLE_LABELS } from '@/lib/permissions';
import { formatCompactNumber, formatDate } from '@/lib/formatters';
import type { Paginated, TopPost } from '@/lib/api-types';
import { Icon } from '@/components/ui/icon';

interface TopPostsTableProps {
  data?: Paginated<TopPost>;
  page: number;
  onPageChange: (page: number) => void;
}

export function TopPostsTable({ data, page, onPageChange }: TopPostsTableProps) {
  const posts = data?.items ?? [];

  if (!posts.length) {
    return (
      <EmptyState
        icon="article"
        title="No publications in this window"
        description="Published posts rank here by composite engagement index."
      />
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-low">
              {[
                'Post Title & Summary',
                'Author & Role',
                'Published',
                'Total Views',
                'Likes',
                'Engagement',
              ].map((heading) => (
                <th
                  key={heading}
                  className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.08em] text-on-surface-variant"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {posts.map((post) => (
              <tr
                key={post.id}
                className="border-b border-outline-variant/60 transition-colors last:border-0 hover:bg-surface-container/50"
              >
                <td className="max-w-[320px] px-5 py-4">
                  <p className="truncate font-headline text-sm font-bold text-on-surface">
                    {post.title}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-on-surface-variant">{post.summary}</p>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={post.author.fullName} url={post.author.avatarUrl} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-on-surface">
                        {post.author.fullName}
                      </p>
                      <p className="truncate text-[11px] text-on-surface-variant">
                        {ROLE_LABELS[post.author.role]}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4 text-xs text-on-surface-variant">
                  {formatDate(post.createdAt)}
                </td>

                <td className="px-5 py-4">
                  <p className="text-sm font-bold text-on-surface">
                    {formatCompactNumber(post.viewCount)}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-2.5 py-1 text-xs font-bold text-on-surface">
                    <Icon name="favorite" className="text-[14px]" />
                    {formatCompactNumber(post.likeCount)}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-container">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.min(post.engagement * 4, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-on-surface">{post.engagement}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        pageCount={data?.pageCount ?? 1}
        total={data?.total ?? 0}
        limit={data?.limit ?? 10}
        onPageChange={onPageChange}
      />
    </>
  );
}
