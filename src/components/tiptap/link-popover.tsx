import { useEffect, useRef, useState } from 'react';
import type { Editor } from '@tiptap/core';
import { Button } from '@/components/ui/button';

interface LinkPopoverProps {
  editor: Editor;
  onClose: () => void;
}

export function LinkPopover({ editor, onClose }: LinkPopoverProps) {
  const [href, setHref] = useState(editor.getAttributes('link').href ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const apply = () => {
    const value = href.trim();

    if (!value) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      onClose();
      return;
    }

    const normalised = /^(https?:\/\/|mailto:)/i.test(value) ? value : `https://${value}`;

    editor.chain().focus().extendMarkRange('link').setLink({ href: normalised }).run();
    onClose();
  };

  const remove = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    onClose();
  };

  return (
    <div className="surface-card absolute left-0 top-full z-30 mt-2 w-[290px] p-3">
      <label htmlFor="link-href" className="text-xs font-semibold text-on-surface">
        Link URL
      </label>

      <input
        id="link-href"
        ref={inputRef}
        value={href}
        onChange={(event) => setHref(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            apply();
          }
        }}
        placeholder="vibesocial.dev/story"
        className="field mt-1.5 text-sm"
      />

      <div className="mt-3 flex items-center justify-between gap-2">
        <Button variant="ghost" onClick={remove} className="text-error">
          Remove
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={apply}>Apply</Button>
        </div>
      </div>
    </div>
  );
}
