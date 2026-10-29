import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Editor } from '@tiptap/core';
import { describe, expect, it } from 'vitest';
import { SimpleEditor } from './simple-editor';

const renderEditor = () => render(<SimpleEditor maxLength={2000} />);

describe('SimpleEditor', () => {
  it('exposes the formatting controls', async () => {
    renderEditor();

    await waitFor(() => {
      expect(screen.getByLabelText('Post body')).toBeInTheDocument();
    });

    ['Bold', 'Italic', 'Underline', 'Strikethrough', 'Inline code'].forEach((label) => {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    });

    ['Bullet list', 'Numbered list', 'Quote', 'Code block'].forEach((label) => {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Add link' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Insert image' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Redo' })).toBeInTheDocument();
  });

  it('opens the heading dropdown and switches the block type', async () => {
    renderEditor();

    await waitFor(() => {
      expect(screen.getByLabelText('Post body')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: /Paragraph/i }));

    const option = await screen.findByRole('menuitem', { name: 'Heading 2' });
    await userEvent.click(option);

    expect(screen.getByRole('button', { name: /Heading 2/i })).toBeInTheDocument();
  });

  it('counts characters as the body is typed', async () => {
    const editorRef = { current: null as Editor | null };

    render(
      <SimpleEditor
        maxLength={2000}
        onReady={(editor) => {
          editorRef.current = editor;
        }}
      />,
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Character count')).toHaveTextContent('0 / 2000');
    });

    // The editor is assigned from a callback, so it is read back through the
    // ref rather than a narrowed local.
    const instance = editorRef.current as Editor;

    instance.commands.insertContent('Hello VibeSocial');

    const counted = instance.storage.characterCount.characters() as number;
    expect(counted).toBeGreaterThan(0);

    await waitFor(() => {
      expect(screen.getByLabelText('Character count')).toHaveTextContent(
        `${counted} / 2000`,
      );
    });
  });

  it('opens the link popover from the toolbar', async () => {
    renderEditor();

    await waitFor(() => {
      expect(screen.getByLabelText('Post body')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: 'Add link' }));

    expect(await screen.findByLabelText('Link URL')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument();
  });
});
