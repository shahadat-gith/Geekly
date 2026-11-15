import { useCallback, useEffect, useRef, useState } from 'react';
import { readingTime } from '../../utils/format.js';

function ToolbarButton({ active, onClick, label, children }) {
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active || undefined}
      className={`inline-flex h-8 min-w-8 items-center justify-center rounded-button px-1.5 text-[12px] font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft ${
        active
          ? 'bg-brand-soft text-brand'
          : 'text-text-secondary hover:bg-surface hover:text-text'
      }`}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Start writing the article…',
  minHeight = '440px',
}) {
  const editorRef = useRef(null);
  const lastValue = useRef(null);
  const [active, setActive] = useState({});

  // Only write into the DOM when the value changes from the outside (article
  // load, reset). Typing already leaves the DOM as the source of truth, so
  // the caret never jumps.
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    if (value !== lastValue.current) {
      if (editor.innerHTML !== value) editor.innerHTML = value || '';
      lastValue.current = value;
    }
  }, [value]);

  const refreshActive = useCallback(() => {
    if (!editorRef.current) return;

    const state = {};
    for (const command of ['bold', 'italic', 'underline', 'strikeThrough', 'insertUnorderedList', 'insertOrderedList']) {
      try {
        state[command] = document.queryCommandState(command);
      } catch {
        state[command] = false;
      }
    }

    let block;
    try {
      block = String(document.queryCommandValue('formatBlock') || '').toLowerCase();
    } catch {
      block = '';
    }
    state.block = block.replace(/[<>]/g, '');

    setActive(state);
  }, []);

  function emitChange() {
    const editor = editorRef.current;
    if (!editor) return;
    const html = editor.innerHTML;
    lastValue.current = html;
    onChange?.(html);
    refreshActive();
  }

  function run(command, argument = null) {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    document.execCommand('styleWithCSS', false, false);
    document.execCommand(command, false, argument);
    emitChange();
  }

  function addLink() {
    const url = window.prompt('Link URL', 'https://');
    if (!url || url === 'https://') return;
    run('createLink', url);
  }

  function addImage() {
    const url = window.prompt('Image URL', 'https://');
    if (!url || url === 'https://') return;
    run('insertImage', url);
  }

  function addInlineCode() {
    const selection = window.getSelection();
    const text = selection?.toString();
    if (!text) return;
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    run('insertHTML', `<code>${escaped}</code>`);
  }

  function clearFormatting() {
    run('removeFormat');
    run('formatBlock', 'p');
  }

  function handleBlur() {
    const editor = editorRef.current;
    if (!editor) return;
    if (!editor.textContent.trim() && !editor.querySelector('img, figure')) {
      editor.innerHTML = '';
      lastValue.current = '';
      onChange?.('');
    }
  }

  const { words } = readingTime(value);

  return (
    <div className="overflow-hidden rounded-field border border-border bg-surface transition-shadow focus-within:border-border-focus focus-within:ring-4 focus-within:ring-brand-soft">
      <div
        role="toolbar"
        aria-label="Article formatting"
        className="flex flex-wrap items-center gap-0.5 border-b border-border-secondary bg-surface-secondary/60 px-2 py-2"
      >
        <ToolbarButton active={active.bold} onClick={() => run('bold')} label="Bold">
          <i aria-hidden="true" className="bx bx-bold text-[16px]" />
        </ToolbarButton>
        <ToolbarButton active={active.italic} onClick={() => run('italic')} label="Italic">
          <i aria-hidden="true" className="bx bx-italic text-[16px]" />
        </ToolbarButton>
        <ToolbarButton active={active.underline} onClick={() => run('underline')} label="Underline">
          <i aria-hidden="true" className="bx bx-underline text-[16px]" />
        </ToolbarButton>
        <ToolbarButton
          active={active.strikeThrough}
          onClick={() => run('strikeThrough')}
          label="Strikethrough"
        >
          <i aria-hidden="true" className="bx bx-strikethrough text-[16px]" />
        </ToolbarButton>

        <span aria-hidden="true" className="mx-1 h-5 w-px bg-border" />

        <ToolbarButton
          active={active.block === 'h2'}
          onClick={() => run('formatBlock', 'h2')}
          label="Heading 2"
        >
          <span className="text-[11.5px] font-bold">H2</span>
        </ToolbarButton>
        <ToolbarButton
          active={active.block === 'h3'}
          onClick={() => run('formatBlock', 'h3')}
          label="Heading 3"
        >
          <span className="text-[11.5px] font-bold">H3</span>
        </ToolbarButton>
        <ToolbarButton
          active={active.block === 'p'}
          onClick={() => run('formatBlock', 'p')}
          label="Paragraph"
        >
          <span className="text-[11.5px] font-bold">P</span>
        </ToolbarButton>

        <span aria-hidden="true" className="mx-1 h-5 w-px bg-border" />

        <ToolbarButton
          active={active.insertUnorderedList}
          onClick={() => run('insertUnorderedList')}
          label="Bullet list"
        >
          <i aria-hidden="true" className="bx bx-list-ul text-[17px]" />
        </ToolbarButton>
        <ToolbarButton
          active={active.insertOrderedList}
          onClick={() => run('insertOrderedList')}
          label="Numbered list"
        >
          <i aria-hidden="true" className="bx bx-list-ol text-[17px]" />
        </ToolbarButton>
        <ToolbarButton
          active={active.block === 'blockquote'}
          onClick={() => run('formatBlock', 'blockquote')}
          label="Quote"
        >
          <i aria-hidden="true" className="bx bxs-quote-alt-left text-[16px]" />
        </ToolbarButton>
        <ToolbarButton
          active={active.block === 'pre'}
          onClick={() => run('formatBlock', 'pre')}
          label="Code block"
        >
          <i aria-hidden="true" className="bx bx-code-block text-[17px]" />
        </ToolbarButton>

        <span aria-hidden="true" className="mx-1 h-5 w-px bg-border" />

        <ToolbarButton onClick={addLink} label="Add link">
          <i aria-hidden="true" className="bx bx-link-alt text-[17px]" />
        </ToolbarButton>
        <ToolbarButton onClick={addImage} label="Insert image from URL">
          <i aria-hidden="true" className="bx bx-image-add text-[17px]" />
        </ToolbarButton>
        <ToolbarButton onClick={addInlineCode} label="Inline code">
          <i aria-hidden="true" className="bx bx-code-alt text-[17px]" />
        </ToolbarButton>

        <span aria-hidden="true" className="mx-1 h-5 w-px bg-border" />

        <ToolbarButton onClick={() => run('undo')} label="Undo">
          <i aria-hidden="true" className="bx bx-undo text-[17px]" />
        </ToolbarButton>
        <ToolbarButton onClick={() => run('redo')} label="Redo">
          <i aria-hidden="true" className="bx bx-redo text-[17px]" />
        </ToolbarButton>
        <ToolbarButton onClick={clearFormatting} label="Clear formatting">
          <i aria-hidden="true" className="bx bx-eraser text-[17px]" />
        </ToolbarButton>
      </div>

      <div
        ref={editorRef}
        role="textbox"
        aria-multiline="true"
        aria-label="Article content"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={emitChange}
        onKeyUp={refreshActive}
        onMouseUp={refreshActive}
        onBlur={handleBlur}
        className="rte-content px-4 py-5 outline-none sm:px-5"
        style={{ minHeight }}
      />

      <div className="flex items-center justify-between gap-3 border-t border-border-secondary bg-surface-secondary/40 px-4 py-2 text-[10.5px] text-text-tertiary">
        <span>{words} word{words === 1 ? '' : 's'}</span>
        <span className="hidden sm:inline">
          Select text to format it · Ctrl/Cmd + B, I and U work too
        </span>
      </div>
    </div>
  );
}
