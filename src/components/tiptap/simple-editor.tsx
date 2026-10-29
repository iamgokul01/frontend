import type { Editor } from "@tiptap/core";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import CharacterCount from "@tiptap/extension-character-count";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { EditorToolbar } from "./editor-toolbar";
import { ToolbarButton } from "./toolbar-button";

interface SimpleEditorProps {
  onReady?: (editor: Editor) => void;
  maxLength?: number;
  placeholder?: string;
  footerHint?: string;
}

export function SimpleEditor({
  onReady,
  maxLength = 2000,
  placeholder = "Share an update or story with the community...",
  footerHint = "Bold, lists, links and quotes are supported",
}: SimpleEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: "noopener noreferrer nofollow" },
        },
      }),
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image.configure({ inline: false, allowBase64: false }),
      CharacterCount.configure({ limit: maxLength }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "tiptap-prose",
        "aria-label": "Post body",
      },
    },
    onCreate: ({ editor: instance }) => {
      onReady?.(instance);
    },
  });

  if (!editor) {
    return (
      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface">
        <div className="h-[132px] animate-pulse bg-surface-container" />
      </div>
    );
  }

  return (
    <div className="overflow-visible  border border-outline-variant bg-surface transition-shadow focus-within:border-primary focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--app-primary)_22%,transparent)]">
      <EditorToolbar editor={editor} />

      <div className="tiptap-editor">
        <EditorContent editor={editor} />
      </div>

      <BubbleMenu
        editor={editor}
        options={{ placement: "top" }}
        className="surface-card rounded-xl flex items-center gap-0.5 px-1.5 py-1"
      >
        <ToolbarButton
          icon="format_bold"
          label="Bold"
          compact
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          icon="format_italic"
          label="Italic"
          compact
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          icon="underline"
          label="Underline"
          compact
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
        <ToolbarButton
          icon="strike"
          label="Strikethrough"
          compact
          onClick={() => editor.chain().focus().toggleStrike().run()}
        />
        <ToolbarButton
          icon="code"
          label="Inline code"
          compact
          onClick={() => editor.chain().focus().toggleCode().run()}
        />
        <ToolbarButton
          icon="link"
          label="Add link"
          compact
          onClick={() =>
            editor.chain().focus().toggleLink({ href: "https://" }).run()
          }
        />
      </BubbleMenu>

      {footerHint ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant bg-surface-container-low px-3 py-2">
          <span className="text-[11px] text-on-surface-variant">
            {footerHint}
          </span>
          <CharacterCounter editor={editor} limit={maxLength} />
        </div>
      ) : null}
    </div>
  );
}

interface CharacterCounterProps {
  editor: Editor;
  limit: number;
}

export function CharacterCounter({ editor, limit }: CharacterCounterProps) {
  const { characters, words, over } = useEditorState({
    editor,
    selector: ({ editor: instance }) => {
      // During a hot reload the editor can be rebuilt before the extension
      // storage is registered, so read it defensively instead of assuming
      // it is present.
      const storage = instance?.storage?.characterCount;
      const count = (storage?.characters?.() ?? 0) as number;
      const wordCount = (storage?.words?.() ?? 0) as number;

      return {
        characters: count,
        words: wordCount,
        over: count > limit,
      };
    },
  });

  return (
    <span
      aria-label="Character count"
      className={`text-xs font-semibold ${
        over ? "text-error" : "text-on-surface-variant"
      }`}
    >
      {characters} / {limit}
      {words > 0 ? (
        <span className="ml-2 hidden sm:inline">{words} words</span>
      ) : null}
    </span>
  );
}
