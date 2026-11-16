import { useEffect, useRef, useState } from 'react';
import { CALLOUT_KINDS } from '../tiptap/articleDocument.js';

const CODE_LANGUAGES = [
  'plaintext', 'bash', 'c', 'cpp', 'csharp', 'css', 'diff', 'go', 'graphql', 'html',
  'java', 'javascript', 'json', 'jsx', 'kotlin', 'markdown', 'php', 'python', 'ruby',
  'rust', 'scss', 'shell', 'sql', 'swift', 'tsx', 'typescript', 'yaml',
];

function ToolbarButton({ active, disabled, onClick, label, children }) {
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active || undefined}
      disabled={disabled}
      className={`inline-flex h-8 min-w-8 items-center justify-center rounded-button px-1.5 text-[12px] font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft disabled:cursor-not-allowed disabled:opacity-35 ${
        active ? 'bg-brand-soft text-brand' : 'text-text-secondary hover:bg-surface hover:text-text'
      }`}
    >
      {children}
    </button>
  );
}

function ToolbarMenu({ label, icon, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <ToolbarButton active={open} onClick={() => setOpen((value) => !value)} label={label}>
        <i aria-hidden="true" className={`bx ${icon} text-[17px]`} />
      </ToolbarButton>
      {open && (
        <div
          role="menu"
          aria-label={label}
          onClick={() => setOpen(false)}
          className="absolute left-0 top-[calc(100%+0.35rem)] z-40 min-w-[12.5rem] rounded-field border border-border bg-surface p-1 shadow-dropdown"
        >
          {children}
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon, children, onClick, disabled }) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-button px-2 py-1.5 text-left text-[11.5px] font-medium text-text-secondary transition hover:bg-surface-secondary hover:text-text disabled:cursor-not-allowed disabled:opacity-40"
    >
      <i aria-hidden="true" className={`bx ${icon} text-[15px]`} />
      {children}
    </button>
  );
}

function isSafeUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return false;
  if (raw.startsWith('/') || raw.startsWith('#')) return true;
  try {
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(new URL(raw).protocol);
  } catch {
    return false;
  }
}

export function EditorToolbar({ editor, active, selection, onAnnotate, onInsertImage }) {
  if (!editor) return null;

  const blockValue = active?.headingLevel ? `h${active.headingLevel}` : 'p';
  const annotationLabel = selection?.canEdit ? 'Edit annotation' : 'Annotate selection';
  const annotationDisabled = !selection?.canCreate && !selection?.canEdit;

  function setBlock(value) {
    if (value === 'p') editor.chain().focus().setParagraph().run();
    else editor.chain().focus().setHeading({ level: Number(value.slice(1)) }).run();
  }

  function runLink() {
    const previous = editor.getAttributes('link').href || '';
    const url = window.prompt('Link URL', previous || 'https://');
    if (url === null) return;
    if (!url.trim() || url.trim() === 'https://') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    if (!isSafeUrl(url)) {
      window.alert('Use an http(s), mailto, tel or relative link.');
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  }

  return (
    <div
      role="toolbar"
      aria-label="Article formatting"
      className="flex flex-wrap items-center gap-0.5 border-b border-border-secondary bg-surface-secondary/60 px-2 py-2"
    >
      <select
        aria-label="Text style"
        value={blockValue}
        onChange={(event) => setBlock(event.target.value)}
        className="h-8 rounded-button border border-border bg-surface px-1.5 text-[11.5px] font-semibold text-text-secondary outline-none focus:border-border-focus focus:ring-4 focus:ring-brand-soft"
      >
        <option value="p">Paragraph</option>
        {[1, 2, 3, 4, 5, 6].map((level) => (
          <option key={level} value={`h${level}`}>Heading {level}</option>
        ))}
      </select>

      <span aria-hidden="true" className="mx-1 h-5 w-px bg-border" />

      <ToolbarButton active={active.bold} onClick={() => editor.chain().focus().toggleBold().run()} label="Bold">
        <i aria-hidden="true" className="bx bx-bold text-[16px]" />
      </ToolbarButton>
      <ToolbarButton active={active.italic} onClick={() => editor.chain().focus().toggleItalic().run()} label="Italic">
        <i aria-hidden="true" className="bx bx-italic text-[16px]" />
      </ToolbarButton>
      <ToolbarButton active={active.underline} onClick={() => editor.chain().focus().toggleUnderline().run()} label="Underline">
        <i aria-hidden="true" className="bx bx-underline text-[16px]" />
      </ToolbarButton>
      <ToolbarButton active={active.strike} onClick={() => editor.chain().focus().toggleStrike().run()} label="Strikethrough">
        <i aria-hidden="true" className="bx bx-strikethrough text-[16px]" />
      </ToolbarButton>
      <ToolbarButton active={active.highlight} onClick={() => editor.chain().focus().toggleHighlight().run()} label="Highlight">
        <i aria-hidden="true" className="bx bx-highlight text-[17px]" />
      </ToolbarButton>
      <ToolbarButton active={active.code} onClick={() => editor.chain().focus().toggleCode().run()} label="Inline code">
        <i aria-hidden="true" className="bx bx-code-alt text-[17px]" />
      </ToolbarButton>

      <span aria-hidden="true" className="mx-1 h-5 w-px bg-border" />

      <ToolbarButton active={active.alignLeft} onClick={() => editor.chain().focus().setTextAlign('left').run()} label="Align left">
        <i aria-hidden="true" className="bx bx-align-left text-[17px]" />
      </ToolbarButton>
      <ToolbarButton active={active.alignCenter} onClick={() => editor.chain().focus().setTextAlign('center').run()} label="Align center">
        <i aria-hidden="true" className="bx bx-align-middle text-[17px]" />
      </ToolbarButton>
      <ToolbarButton active={active.alignRight} onClick={() => editor.chain().focus().setTextAlign('right').run()} label="Align right">
        <i aria-hidden="true" className="bx bx-align-right text-[17px]" />
      </ToolbarButton>
      <ToolbarButton active={active.alignJustify} onClick={() => editor.chain().focus().setTextAlign('justify').run()} label="Justify">
        <i aria-hidden="true" className="bx bx-align-justify text-[17px]" />
      </ToolbarButton>

      <span aria-hidden="true" className="mx-1 h-5 w-px bg-border" />

      <ToolbarButton active={active.bulletList} onClick={() => editor.chain().focus().toggleBulletList().run()} label="Bullet list">
        <i aria-hidden="true" className="bx bx-list-ul text-[17px]" />
      </ToolbarButton>
      <ToolbarButton active={active.orderedList} onClick={() => editor.chain().focus().toggleOrderedList().run()} label="Numbered list">
        <i aria-hidden="true" className="bx bx-list-ol text-[17px]" />
      </ToolbarButton>
      <ToolbarButton active={active.blockquote} onClick={() => editor.chain().focus().toggleBlockquote().run()} label="Quote">
        <i aria-hidden="true" className="bx bxs-quote-alt-left text-[16px]" />
      </ToolbarButton>
      <ToolbarButton active={active.codeBlock} onClick={() => editor.chain().focus().toggleCodeBlock().run()} label="Code block">
        <i aria-hidden="true" className="bx bx-code-block text-[17px]" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} label="Divider">
        <i aria-hidden="true" className="bx bx-minus text-[17px]" />
      </ToolbarButton>

      {active.codeBlock && (
        <select
          aria-label="Code language"
          value={active.codeLanguage || 'plaintext'}
          onChange={(event) =>
            editor.chain().focus().updateAttributes('codeBlock', { language: event.target.value }).run()
          }
          className="h-8 max-w-[9rem] rounded-button border border-border bg-surface px-1.5 text-[11px] font-medium text-text-secondary outline-none focus:border-border-focus focus:ring-4 focus:ring-brand-soft"
        >
          {CODE_LANGUAGES.map((language) => (
            <option key={language} value={language}>{language}</option>
          ))}
        </select>
      )}

      <span aria-hidden="true" className="mx-1 h-5 w-px bg-border" />

      <ToolbarButton active={active.link} onClick={runLink} label="Add link">
        <i aria-hidden="true" className="bx bx-link-alt text-[17px]" />
      </ToolbarButton>
      <ToolbarButton onClick={onInsertImage} label="Insert article image">
        <i aria-hidden="true" className="bx bx-image-add text-[17px]" />
      </ToolbarButton>

      <ToolbarMenu label="Table" icon="bx-table">
        <MenuItem icon="bx-table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
          Insert table
        </MenuItem>
        <MenuItem icon="bx-row-before" disabled={!active.table} onClick={() => editor.chain().focus().addRowAfter().run()}>
          Add row below
        </MenuItem>
        <MenuItem icon="bx-column-insert" disabled={!active.table} onClick={() => editor.chain().focus().addColumnAfter().run()}>
          Add column right
        </MenuItem>
        <MenuItem icon="bx-row-delete" disabled={!active.table} onClick={() => editor.chain().focus().deleteRow().run()}>
          Delete row
        </MenuItem>
        <MenuItem icon="bx-column-delete" disabled={!active.table} onClick={() => editor.chain().focus().deleteColumn().run()}>
          Delete column
        </MenuItem>
        <MenuItem icon="bx-trash" disabled={!active.table} onClick={() => editor.chain().focus().deleteTable().run()}>
          Delete table
        </MenuItem>
      </ToolbarMenu>

      <ToolbarMenu label="Callout" icon="bx-bulb">
        {CALLOUT_KINDS.map((kind) => (
          <MenuItem
            key={kind}
            icon="bx-message-square-detail"
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertContent({
                  type: 'callout',
                  attrs: { kind },
                  content: [{ type: 'paragraph' }],
                })
                .run()
            }
          >
            {kind.charAt(0).toUpperCase() + kind.slice(1)} callout
          </MenuItem>
        ))}
      </ToolbarMenu>

      <ToolbarButton
        active={Boolean(selection?.canEdit)}
        disabled={annotationDisabled}
        onClick={onAnnotate}
        label={annotationLabel}
      >
        <i aria-hidden="true" className="bx bx-comment-detail text-[17px]" />
      </ToolbarButton>

      <span aria-hidden="true" className="mx-1 h-5 w-px bg-border" />

      <ToolbarButton disabled={!active.canUndo} onClick={() => editor.chain().focus().undo().run()} label="Undo">
        <i aria-hidden="true" className="bx bx-undo text-[17px]" />
      </ToolbarButton>
      <ToolbarButton disabled={!active.canRedo} onClick={() => editor.chain().focus().redo().run()} label="Redo">
        <i aria-hidden="true" className="bx bx-redo text-[17px]" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} label="Clear formatting">
        <i aria-hidden="true" className="bx bx-eraser text-[17px]" />
      </ToolbarButton>
    </div>
  );
}
