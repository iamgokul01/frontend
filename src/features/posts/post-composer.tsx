import { useCallback, useRef, useState, type FormEvent } from 'react';
import type { Editor } from '@tiptap/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '@/api/posts.api';
import { extractErrorMessage } from '@/api/client';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { Avatar } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { SimpleEditor } from '@/components/tiptap/simple-editor';

const CATEGORIES = [
  'Community Culture',
  'Design Systems',
  'Security & Safety',
  'Announcements',
];

const MAX_LENGTH = 2000;

export function PostComposer() {
  const { user } = useAuth();
  const { notify } = useToast();
  const queryClient = useQueryClient();

  const editorRef = useRef<Editor | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [visibility, setVisibility] = useState<'PUBLIC' | 'MEMBERS_ONLY'>('PUBLIC');
  const [tags, setTags] = useState('');

  const handleEditorReady = useCallback((editor: Editor) => {
    editorRef.current = editor;
  }, []);

  const createMutation = useMutation({
    mutationFn: () => {
      const editor = editorRef.current;
      const html = editor?.getHTML() ?? '';
      const plainText = editor?.getText().trim() ?? '';

      return postsApi.create({
        title: title.trim() || plainText.slice(0, 60),
        body: html,
        category,
        visibility,
        tags: tags
          .split(/[\s,]+/)
          .map((tag) => tag.replace(/^#/, '').trim())
          .filter(Boolean)
          .slice(0, 6),
      });
    },
    onSuccess: async () => {
      editorRef.current?.commands.clearContent();
      setTitle('');
      setTags('');
      await queryClient.invalidateQueries({ queryKey: ['posts'] });
      await queryClient.invalidateQueries({ queryKey: ['analytics'] });
      notify('Your post has been published to the community feed!');
    },
    onError: (error) => notify(extractErrorMessage(error), 'error'),
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const editor = editorRef.current;
    const plainText = editor?.getText().trim() ?? '';

    if (!plainText) {
      notify('Write something before publishing', 'error');
      return;
    }

    const characters = (editor?.storage.characterCount.characters() as number) ?? 0;

    if (characters > MAX_LENGTH) {
      notify(`Posts are limited to ${MAX_LENGTH} characters`, 'error');
      return;
    }

    createMutation.mutate();
  };

  const handleClear = () => {
    editorRef.current?.commands.clearContent();
    setTitle('');
    setTags('');
  };

  return (
    <form onSubmit={handleSubmit} className="surface-card p-5">
      <div className="flex items-center gap-3">
        <Avatar name={user?.fullName ?? 'Member'} url={user?.avatarUrl} />
        <div>
          <p className="text-sm font-bold text-on-surface">{user?.fullName}</p>
          <p className="text-xs text-on-surface-variant">Sharing with VibeSocial Community</p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Post title"
          aria-label="Post title"
          className="field"
        />

        <SimpleEditor
          onReady={handleEditorReady}
          maxLength={MAX_LENGTH}
          placeholder="Share an update or story with the community..."
        />

        <div className="flex flex-col gap-3 border-t border-outline-variant pt-4 sm:flex-row">
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Post category"
            className="field sm:max-w-[220px]"
          >
            {CATEGORIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <select
            value={visibility}
            onChange={(event) =>
              setVisibility(event.target.value as 'PUBLIC' | 'MEMBERS_ONLY')
            }
            aria-label="Post visibility"
            className="field sm:max-w-[200px]"
          >
            <option value="PUBLIC">Public</option>
            <option value="MEMBERS_ONLY">Members only</option>
          </select>

          <input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="#Community #DesignSystem"
            aria-label="Post tags"
            className="field flex-1"
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" type="button" onClick={handleClear}>
            Clear
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <Icon name="progress_activity" className="animate-spin text-[18px]" />
            ) : (
              <Icon name="send" className="text-[18px]" />
            )}
            Publish Post
          </Button>
        </div>
      </div>
    </form>
  );
}
