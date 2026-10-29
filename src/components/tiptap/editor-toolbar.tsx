import { useEffect, useRef, useState } from 'react';
import type { Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import { Icon, type IconName } from '@/components/ui/icon';
import { ToolbarButton } from './toolbar-button';
import { LinkPopover } from './link-popover';
import { ImagePopover } from './image-popover';

type HeadingLevel = 0 | 1 | 2 | 3;
type Alignment = 'left' | 'center' | 'right' | 'justify';

const HEADING_OPTIONS: { level: HeadingLevel; label: string; icon: IconName }[] = [
  { level: 0, label: 'Paragraph', icon: 'paragraph' },
  { level: 1, label: 'Heading 1', icon: 'heading_1' },
  { level: 2, label: 'Heading 2', icon: 'heading_2' },
  { level: 3, label: 'Heading 3', icon: 'heading_3' },
];

const ALIGNMENTS: { value: Alignment; label: string; icon: IconName }[] = [
  { value: 'left', label: 'Align left', icon: 'align_left' },
  { value: 'center', label: 'Align center', icon: 'align_center' },
  { value: 'right', label: 'Align right', icon: 'align_right' },
  { value: 'justify', label: 'Align justify', icon: 'align_justify' },
];

interface EditorToolbarProps {
  editor: Editor;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const [openPanel, setOpenPanel] = useState<'link' | 'image' | 'heading' | null>(null);
  const headingRef = useRef<HTMLDivElement>(null);

  const state = useEditorState({
    editor,
    selector: ({ editor: instance }) => ({
      bold: instance.isActive('bold'),
      italic: instance.isActive('italic'),
      underline: instance.isActive('underline'),
      strike: instance.isActive('strike'),
      code: instance.isActive('code'),
      link: instance.isActive('link'),
      bulletList: instance.isActive('bulletList'),
      orderedList: instance.isActive('orderedList'),
      blockquote: instance.isActive('blockquote'),
      codeBlock: instance.isActive('codeBlock'),
      heading: instance.isActive('heading', { level: 1 })
        ? 1
        : instance.isActive('heading', { level: 2 })
          ? 2
          : instance.isActive('heading', { level: 3 })
            ? 3
            : 0,
      alignment: instance.isActive({ textAlign: 'center' })
        ? 'center'
        : instance.isActive({ textAlign: 'right' })
          ? 'right'
          : instance.isActive({ textAlign: 'justify' })
            ? 'justify'
            : 'left',
      canUndo: instance.can().undo(),
      canRedo: instance.can().redo(),
    }),
  });

  useEffect(() => {
    if (openPanel !== 'heading') return undefined;

    const onPointerDown = (event: MouseEvent) => {
      if (!headingRef.current?.contains(event.target as Node)) {
        setOpenPanel(null);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [openPanel]);

  const activeHeading =
    HEADING_OPTIONS.find((option) => option.level === state.heading) ?? HEADING_OPTIONS[0];

  const chain = () => editor.chain().focus();

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-outline-variant bg-surface-container-low px-2 py-1.5">
      <div className="relative" ref={headingRef}>
        <button
          type="button"
          onClick={() => setOpenPanel(openPanel === 'heading' ? null : 'heading')}
          aria-haspopup="menu"
          aria-expanded={openPanel === 'heading'}
          className="flex h-8 min-w-[104px] items-center justify-between gap-1 rounded-lg px-2 text-xs font-bold text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
        >
          <Icon name={activeHeading.icon} className="text-[15px]" />
          <span className="hidden sm:inline">{activeHeading.label}</span>
          <Icon name="expand_more" className="text-[15px]" />
        </button>

        {openPanel === 'heading' ? (
          <div
            role="menu"
            className="surface-card absolute left-0 top-full z-30 mt-2 w-48 p-1.5"
          >
            {HEADING_OPTIONS.map((option) => (
              <button
                key={option.level}
                type="button"
                role="menuitem"
                onClick={() => {
                  if (option.level === 0) {
                    chain().setParagraph().run();
                  } else {
                    chain()
                      .toggleHeading({ level: option.level as 1 | 2 | 3 })
                      .run();
                  }
                  setOpenPanel(null);
                }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-semibold transition-colors ${
                  state.heading === option.level
                    ? 'bg-primary-container text-primary'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <Icon name={option.icon} className="text-[16px]" />
                {option.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <Divider />

      <ToolbarButton
        icon="format_bold"
        label="Bold"
        active={state.bold}
        onClick={() => chain().toggleBold().run()}
      />
      <ToolbarButton
        icon="format_italic"
        label="Italic"
        active={state.italic}
        onClick={() => chain().toggleItalic().run()}
      />
      <ToolbarButton
        icon="underline"
        label="Underline"
        active={state.underline}
        onClick={() => chain().toggleUnderline().run()}
      />
      <ToolbarButton
        icon="strike"
        label="Strikethrough"
        active={state.strike}
        onClick={() => chain().toggleStrike().run()}
      />
      <ToolbarButton
        icon="code"
        label="Inline code"
        active={state.code}
        onClick={() => chain().toggleCode().run()}
      />

      <Divider />

      <div className="relative">
        <ToolbarButton
          icon="link"
          label="Add link"
          active={state.link}
          onClick={() => setOpenPanel(openPanel === 'link' ? null : 'link')}
        />
        {openPanel === 'link' ? (
          <LinkPopover editor={editor} onClose={() => setOpenPanel(null)} />
        ) : null}
      </div>

      <div className="relative">
        <ToolbarButton
          icon="image"
          label="Insert image"
          onClick={() => setOpenPanel(openPanel === 'image' ? null : 'image')}
        />
        {openPanel === 'image' ? (
          <ImagePopover editor={editor} onClose={() => setOpenPanel(null)} />
        ) : null}
      </div>

      <Divider />

      <ToolbarButton
        icon="list"
        label="Bullet list"
        active={state.bulletList}
        onClick={() => chain().toggleBulletList().run()}
      />
      <ToolbarButton
        icon="list_ordered"
        label="Numbered list"
        active={state.orderedList}
        onClick={() => chain().toggleOrderedList().run()}
      />
      <ToolbarButton
        icon="blockquote"
        label="Quote"
        active={state.blockquote}
        onClick={() => chain().toggleBlockquote().run()}
      />
      <ToolbarButton
        icon="code"
        label="Code block"
        active={state.codeBlock}
        onClick={() => chain().toggleCodeBlock().run()}
      />

      <Divider />

      {ALIGNMENTS.map((alignment) => (
        <ToolbarButton
          key={alignment.value}
          icon={alignment.icon}
          label={alignment.label}
          active={state.alignment === alignment.value}
          className="hidden md:flex"
          onClick={() => chain().setTextAlign(alignment.value).run()}
        />
      ))}

      <Divider />

      <ToolbarButton
        icon="undo"
        label="Undo"
        disabled={!state.canUndo}
        onClick={() => chain().undo().run()}
      />
      <ToolbarButton
        icon="redo"
        label="Redo"
        disabled={!state.canRedo}
        onClick={() => chain().redo().run()}
      />
    </div>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-outline-variant" aria-hidden />;
}
