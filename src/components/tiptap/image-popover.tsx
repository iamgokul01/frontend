import { useEffect, useRef, useState } from 'react';
import type { Editor } from '@tiptap/core';
import { Button } from '@/components/ui/button';

interface ImagePopoverProps {
  editor: Editor;
  onClose: () => void;
}

export function ImagePopover({ editor, onClose }: ImagePopoverProps) {
  const [src, setSrc] = useState('');
  const [alt, setAlt] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const apply = () => {
    const value = src.trim();

    if (!value) {
      onClose();
      return;
    }

    const normalised = /^https?:\/\//i.test(value) ? value : `https://${value}`;

    editor.chain().focus().setImage({ src: normalised, alt: alt.trim() }).run();
    onClose();
  };

  return (
    <div className="surface-card absolute left-0 top-full z-30 mt-2 w-[300px] p-3">
      <label htmlFor="image-src" className="text-xs font-semibold text-on-surface">
        Image URL
      </label>
      <input
        id="image-src"
        ref={inputRef}
        value={src}
        onChange={(event) => setSrc(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            apply();
          }
        }}
        placeholder="https://example.com/cover.jpg"
        className="field mt-1.5 text-sm"
      />

      <label htmlFor="image-alt" className="mt-3 block text-xs font-semibold text-on-surface">
        Alt text
      </label>
      <input
        id="image-alt"
        value={alt}
        onChange={(event) => setAlt(event.target.value)}
        placeholder="Describe the image"
        className="field mt-1.5 text-sm"
      />

      <div className="mt-3 flex items-center justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={apply}>Insert</Button>
      </div>
    </div>
  );
}
