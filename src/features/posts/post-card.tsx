import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '@/api/posts.api';
import { extractErrorMessage } from '@/api/client';
import { useToast } from '@/context/toast-context';
import { usePermissions } from '@/hooks/use-permissions';
import { Avatar, RoleBadge } from '@/components/ui/avatar';
import { ROLE_LABELS } from '@/lib/permissions';
import { formatRelativeTime } from '@/lib/formatters';
import type { Post } from '@/lib/api-types';
import { Icon } from '@/components/ui/icon';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { notify } = useToast();
  const { can } = usePermissions();
  const queryClient = useQueryClient();

  const [showComments, setShowComments] = useState(false);
  const [commentBody, setCommentBody] = useState('');
  const [bookmarked, setBookmarked] = useState(false);

  const commentsQuery = useQuery({
    queryKey: ['post-comments', post.id],
    queryFn: () => postsApi.comments(post.id),
    enabled: showComments,
  });

  const addCommentMutation = useMutation({
    mutationFn: () => postsApi.addComment(post.id, commentBody.trim()),
    onSuccess: async () => {
      setCommentBody('');
      await queryClient.invalidateQueries({ queryKey: ['post-comments', post.id] });
      await queryClient.invalidateQueries({ queryKey: ['posts'] });
      notify('Comment added to the discussion');
    },
    onError: (error) => notify(extractErrorMessage(error), 'error'),
  });

  const likeMutation = useMutation({
    mutationFn: () => postsApi.toggleLike(post.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      const previous = queryClient.getQueriesData({ queryKey: ['posts'] });

      queryClient.setQueriesData({ queryKey: ['posts'] }, (old: unknown) => {
        const data = old as { items: Post[] } | undefined;
        if (!data?.items) return old;

        return {
          ...data,
          items: data.items.map((candidate) =>
            candidate.id === post.id
              ? {
                  ...candidate,
                  likedByViewer: !candidate.likedByViewer,
                  likeCount: candidate.likeCount + (candidate.likedByViewer ? -1 : 1),
                }
              : candidate,
          ),
        };
      });

      return { previous };
    },
    onError: (error, _variables, context) => {
      context?.previous?.forEach(([key, value]) => {
        queryClient.setQueryData(key, value);
      });
      notify(extractErrorMessage(error), 'error');
    },
    onSuccess: (result) => {
      queryClient.setQueriesData({ queryKey: ['posts'] }, (old: unknown) => {
        const data = old as { items: Post[] } | undefined;
        if (!data?.items) return old;

        return {
          ...data,
          items: data.items.map((candidate) =>
            candidate.id === post.id
              ? { ...candidate, likedByViewer: result.liked, likeCount: result.likeCount }
              : candidate,
          ),
        };
      });
    },
  });

  const author = post.author;

  const handleCommentSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!commentBody.trim()) {
      notify('Write something before commenting', 'error');
      return;
    }
    addCommentMutation.mutate();
  };

  return (
    <article className="surface-card p-5">
      <div className="flex items-start gap-3">
        <Avatar name={author?.fullName ?? 'Member'} url={author?.avatarUrl} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-on-surface">{author?.fullName}</span>
            {author ? (
              <RoleBadge role={author.role} label={ROLE_LABELS[author.role]} />
            ) : null}
            <span className="text-xs text-on-surface-variant">@{author?.handle}</span>
            <span className="ml-auto text-xs text-on-surface-variant">
              {formatRelativeTime(post.createdAt)} ·{' '}
              {post.visibility === 'PUBLIC' ? 'Public' : 'Members only'}
            </span>
          </div>

          <h3 className="mt-2 font-headline text-lg font-bold leading-snug text-on-surface">
            {post.title}
          </h3>

          <div
            className="rich-text mt-1.5"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />

          {post.tags.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-surface-container px-2.5 py-1 text-[11px] font-semibold text-on-surface-variant"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-4 flex items-center gap-5 border-t border-outline-variant pt-3">
            <button
              type="button"
              onClick={() => likeMutation.mutate()}
              disabled={likeMutation.isPending}
              aria-pressed={post.likedByViewer}
              className={`group flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold transition-colors hover:bg-surface-container ${
                post.likedByViewer
                  ? 'text-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon
                name="favorite"
                className={`text-[18px] transition-transform group-hover:scale-110 ${
                  post.likedByViewer ? 'fill-current' : ''
                }`}
              />
              {post.likeCount}
            </button>

            <button
              type="button"
              onClick={() => setShowComments((open) => !open)}
              aria-expanded={showComments}
              className={`group flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold transition-colors hover:bg-surface-container ${
                showComments
                  ? 'text-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon name="chat_bubble" className="text-[18px] transition-transform group-hover:scale-110" />
              {post.commentCount} comments
            </button>

            <button
              type="button"
              onClick={() => notify('Post link copied to your clipboard', 'info')}
              className="group flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
            >
              <Icon name="share" className="text-[18px] transition-transform group-hover:scale-110" />
              Share
            </button>

            <button
              type="button"
              onClick={() => setBookmarked((saved) => !saved)}
              aria-pressed={bookmarked}
              aria-label="Bookmark"
              className={`group ml-auto rounded-lg px-2 py-1 transition-colors hover:bg-surface-container ${
                bookmarked ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon
                name="bookmark_border"
                className={`text-[18px] transition-transform group-hover:scale-110 ${
                  bookmarked ? 'fill-current' : ''
                }`}
              />
            </button>
          </div>

          {showComments ? (
            <div className="mt-4 rounded-xl border border-outline-variant bg-surface-container-low p-4">
              {commentsQuery.isLoading ? (
                <p className="text-sm text-on-surface-variant">Loading discussion...</p>
              ) : null}

              {commentsQuery.isError ? (
                <p className="text-sm font-semibold text-error">
                  {extractErrorMessage(commentsQuery.error)}
                </p>
              ) : null}

              {!commentsQuery.isLoading && !commentsQuery.isError ? (
                !commentsQuery.data || commentsQuery.data.length === 0 ? (
                  <p className="text-sm text-on-surface-variant">
                    No comments yet. Start the discussion.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {commentsQuery.data.map((comment) => (
                      <li key={comment.id} className="flex items-start gap-2.5">
                        <Avatar
                          name={comment.author.fullName}
                          url={comment.author.avatarUrl}
                          size="sm"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-on-surface">
                              {comment.author.fullName}
                            </span>
                            <RoleBadge
                              role={comment.author.role}
                              label={ROLE_LABELS[comment.author.role]}
                            />
                            <span className="text-[11px] text-on-surface-variant">
                              {formatRelativeTime(comment.createdAt)}
                            </span>
                          </div>
                          <p className="mt-0.5 text-sm leading-relaxed text-on-surface-variant">
                            {comment.body}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )
              ) : null}

              {can('comments:create') ? (
                <form
                  onSubmit={handleCommentSubmit}
                  className="mt-4 flex items-start gap-2 border-t border-outline-variant pt-4"
                >
                  <input
                    value={commentBody}
                    onChange={(event) => setCommentBody(event.target.value)}
                    placeholder="Add to the discussion..."
                    aria-label="Comment body"
                    className="field flex-1"
                  />
                  <button
                    type="submit"
                    disabled={addCommentMutation.isPending}
                    className="btn-primary shrink-0 px-4 py-2"
                  >
                    {addCommentMutation.isPending ? (
                      <Icon name="progress_activity" className="animate-spin text-[16px]" />
                    ) : (
                      <Icon name="send" className="text-[16px]" />
                    )}
                    Post
                  </button>
                </form>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
