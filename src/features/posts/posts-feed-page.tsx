import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { postsApi } from '@/api/posts.api';
import { extractErrorMessage } from '@/api/client';
import { usePermissions } from '@/hooks/use-permissions';
import { EmptyState, Spinner } from '@/components/ui/empty-state';
import { PostComposer } from './post-composer';
import { PostCard } from './post-card';
import { Icon, type IconName } from '@/components/ui/icon';

const TABS: { key: 'trending' | 'latest' | 'announcements'; label: string; icon: IconName }[] = [
  { key: 'trending' as const, label: 'Trending', icon: 'local_fire_department' },
  { key: 'latest' as const, label: 'Latest', icon: 'schedule' },
  { key: 'announcements' as const, label: 'Announcements', icon: 'campaign' },
];

export function PostsFeedPage() {
  const { can } = usePermissions();
  const [sort, setSort] = useState<'trending' | 'latest' | 'announcements'>('trending');

  const postsQuery = useQuery({
    queryKey: ['posts', sort],
    queryFn: () => postsApi.list({ sort, limit: 20 }),
  });

  const topicsQuery = useQuery({
    queryKey: ['posts', 'topics'],
    queryFn: postsApi.trendingTopics,
  });

  const posts = postsQuery.data?.items ?? [];

  return (
    <div className="px-4 py-6 lg:px-8">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-5">
          <header className="surface-card p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
              VibeSocial Community Space
            </p>
            <h1 className="mt-1 font-headline text-3xl font-bold tracking-tight text-on-surface">
              Community Feed &amp; Discussions
            </h1>
            <p className="mt-1.5 text-sm text-on-surface-variant">
              Connect, share stories, announce team design updates, and celebrate milestones across our
              shared spaces.
            </p>
          </header>

          {can('posts:create') ? <PostComposer /> : null}

          <section className="surface-card flex items-center gap-2 px-4 py-3">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSort(tab.key)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                  sort === tab.key
                    ? 'bg-primary-container/40 text-primary'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <Icon name={tab.icon} className="text-[18px]" />
                {tab.label}
              </button>
            ))}
            <span className="ml-auto text-xs text-on-surface-variant">
              Showing active discussions
            </span>
          </section>

          {postsQuery.isLoading ? (
            <div className="surface-card">
              <Spinner label="Loading the feed" />
            </div>
          ) : null}

          {postsQuery.isError ? (
            <div className="surface-card">
              <EmptyState
                icon="cloud_off"
                title="Could not load the feed"
                description={extractErrorMessage(postsQuery.error)}
              />
            </div>
          ) : null}

          {!postsQuery.isLoading && !postsQuery.isError && posts.length === 0 ? (
            <div className="surface-card">
              <EmptyState
                icon="forum"
                title={sort === 'announcements' ? 'No announcements yet' : 'The feed is empty'}
                description={
                  sort === 'announcements'
                    ? 'Announcements posted by the community will appear here.'
                    : 'Be the first to share an update with the community.'
                }
              />
            </div>
          ) : null}

          <div className="flex flex-col gap-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>

        <aside className="flex min-w-0 flex-col gap-5">
          <section className="surface-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-lg font-bold text-on-surface">Trending Topics</h2>
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Live
              </span>
            </div>

            {topicsQuery.data?.length ? (
              <ul className="mt-4 flex flex-col gap-1">
                {topicsQuery.data.map((topic) => (
                  <li key={topic.tag}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-surface-container"
                    >
                      <span className="text-sm font-bold text-on-surface">#{topic.tag}</span>
                      <span className="text-xs text-on-surface-variant">
                        {topic.postCount} posts
                      </span>
                      <Icon name="arrow_forward" className="ml-auto text-[16px] text-outline" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-on-surface-variant">
                Hashtags appear here once posts are published.
              </p>
            )}
          </section>

          <section className="surface-card p-5">
            <h2 className="font-headline text-lg font-bold text-on-surface">
              Community Guidelines
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              VibeSocial thrives on kindness, constructive discourse, and mutual respect. Keep
              discussions helpful, tag topics accurately, and celebrate community accomplishments.
            </p>
            <div className="mt-4 flex items-center justify-between text-xs font-semibold">
              <span className="text-on-surface-variant">Terra Standards</span>
              <span className="text-primary">Read Handbook →</span>
            </div>
          </section>

          <section className="surface-panel p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-on-surface-variant">
              Community Snapshot
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="surface-card p-3">
                <p className="text-[11px] text-on-surface-variant">Active Members</p>
                <p className="font-headline text-xl font-bold text-on-surface">
                  {postsQuery.data?.total ?? 0}
                </p>
              </div>
              <div className="surface-card p-3">
                <p className="text-[11px] text-on-surface-variant">Stories Shared</p>
                <p className="font-headline text-xl font-bold text-primary">
                  {postsQuery.data?.total ?? 0}
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
