import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { readingTime } from '../../utils/format.js';
import { AnnotationDialog } from './annotations/AnnotationDialog.jsx';
import { AnnotationLayer } from './annotations/AnnotationLayer.jsx';
import { EditorToolbar } from './toolbar/EditorToolbar.jsx';
import {
  annotationInRange,
  createAnnotationId,
} from './tiptap/articleDocument.js';
import { createEditorExtensions } from './tiptap/articleExtensions.jsx';
import { createDiagramStore } from './tiptap/diagramStore.js';

function selectionDetails(editor) {
  if (!editor) return null;
  const { from, to, empty, $from, $to } = editor.state.selection;
  const annotation = empty ? null : annotationInRange(editor.state.doc, from, to);
  const contained = Boolean(annotation && from >= annotation.from && to <= annotation.to);

  return {
    from,
    to,
    empty,
    text: empty ? '' : editor.state.doc.textBetween(from, to, ' '),
    annotation,
    canCreate:
      !empty &&
      $from.sameParent($to) &&
      $from.parent.type.name !== 'codeBlock' &&
      !annotation,
    canEdit: contained,
    overlaps: Boolean(annotation) && !contained,
  };
}

export function RichTextEditor({
  value = null,
  html = '',
  diagrams = [],
  onChange,
  onUploadImage,
  onGenerateDiagramImage,
  onUploadDiagramImage,
  minHeight = '440px',
}) {
  const [initialContent] = useState(() => value || '');
  const [diagramStore] = useState(() => createDiagramStore(diagrams));
  const [dialog, setDialog] = useState(null);
  const imageActions = useMemo(
    () => ({
      upload: onUploadImage ? (file) => onUploadImage(file) : undefined,
    }),
    [onUploadImage],
  );
  const diagramActions = useMemo(
    () => ({
      generate: onGenerateDiagramImage
        ? (diagramId) => onGenerateDiagramImage(diagramId)
        : undefined,
      upload: onUploadDiagramImage
        ? (diagramId, file) => onUploadDiagramImage(diagramId, file)
        : undefined,
    }),
    [onGenerateDiagramImage, onUploadDiagramImage],
  );
  const extensions = useMemo(
    () => createEditorExtensions(diagramStore, imageActions, diagramActions),
    [diagramStore, imageActions, diagramActions],
  );

  const editor = useEditor({
    extensions,
    content: initialContent,
    editable: true,
    editorProps: {
      attributes: {
        class: 'rte-content px-4 py-5 outline-none sm:px-5',
        style: `min-height: ${minHeight}`,
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-label': 'Article content',
      },
    },
    onUpdate: ({ editor: current }) => {
      onChange?.({
        doc: current.getJSON(),
        html: current.isEmpty ? '' : current.getHTML(),
      });
    },
  });

  useEffect(() => {
    diagramStore.set(diagrams);
  }, [diagrams, diagramStore]);

  const active = useEditorState({
    editor,
    selector: ({ editor: current }) => {
      if (!current) return {};
      const selection = selectionDetails(current);
      const headingLevel = current.isActive('heading') ? current.getAttributes('heading').level : null;
      const alignLeft = current.isActive({ textAlign: 'left' });
      const alignCenter = current.isActive({ textAlign: 'center' });
      const alignRight = current.isActive({ textAlign: 'right' });
      const alignJustify = current.isActive({ textAlign: 'justify' });

      return {
        bold: current.isActive('bold'),
        italic: current.isActive('italic'),
        underline: current.isActive('underline'),
        strike: current.isActive('strike'),
        highlight: current.isActive('highlight'),
        code: current.isActive('code'),
        link: current.isActive('link'),
        headingLevel,
        paragraph: current.isActive('paragraph'),
        bulletList: current.isActive('bulletList'),
        orderedList: current.isActive('orderedList'),
        blockquote: current.isActive('blockquote'),
        codeBlock: current.isActive('codeBlock'),
        codeLanguage: current.getAttributes('codeBlock').language || 'plaintext',
        table: current.isActive('table'),
        alignLeft: alignLeft || (!alignCenter && !alignRight && !alignJustify),
        alignCenter,
        alignRight,
        alignJustify,
        canUndo: current.can().undo(),
        canRedo: current.can().redo(),
        words: current.getText().trim()
          ? current.getText().trim().split(/\s+/).length
          : 0,
        selection,
      };
    },
  });

  const startAnnotation = useCallback(() => {
    if (!editor) return;
    const selection = selectionDetails(editor);

    if (selection.canEdit && selection.annotation) {
      setDialog({
        mode: 'edit',
        id: selection.annotation.id,
        from: selection.annotation.from,
        to: selection.annotation.to,
        text: editor.state.doc.textBetween(selection.annotation.from, selection.annotation.to, ' '),
        kind: selection.annotation.kind,
        content: selection.annotation.content,
        error: '',
      });
      return;
    }

    if (!selection.canCreate) return;
    setDialog({
      mode: 'create',
      from: selection.from,
      to: selection.to,
      text: selection.text,
      kind: 'explanation',
      content: '',
      error: '',
    });
  }, [editor]);

  function saveAnnotation({ kind, content }) {
    if (!editor || !dialog) return;

    if (dialog.mode === 'create') {
      const currentText = editor.state.doc.textBetween(dialog.from, dialog.to, ' ');
      if (currentText !== dialog.text) {
        setDialog((current) => ({
          ...current,
          error: 'The selected text changed. Select it again and retry.',
        }));
        return;
      }
      const applied = editor
        .chain()
        .focus()
        .setTextSelection({ from: dialog.from, to: dialog.to })
        .addAnnotation({ id: createAnnotationId(), kind, content })
        .run();
      if (!applied) {
        setDialog((current) => ({
          ...current,
          error: 'That selection overlaps an existing annotation. Choose different text.',
        }));
        return;
      }
    } else {
      const applied = editor.chain().focus().updateAnnotation(dialog.id, { kind, content }).run();
      if (!applied) {
        setDialog((current) => ({ ...current, error: 'This annotation could not be updated.' }));
        return;
      }
    }

    setDialog(null);
    editor.commands.focus();
  }

  function insertImage() {
    editor
      ?.chain()
      .focus()
      .insertContent({
        type: 'articleImage',
        attrs: {
          assetKey: null,
          assetUrl: null,
          alt: '',
          caption: '',
          align: 'center',
        },
      })
      .run();
  }

  const words = active?.words ?? readingTime(html).words;
  const selection = active?.selection;
  const annotationLabel = selection?.canEdit ? 'Edit annotation' : 'Annotate selection';
  const annotationDisabled = !selection?.canCreate && !selection?.canEdit;

  return (
    <div
      className="overflow-hidden rounded-field border border-border bg-surface transition-shadow focus-within:border-border-focus focus-within:ring-4 focus-within:ring-brand-soft"
      onKeyDown={(event) => {
        if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'e') {
          event.preventDefault();
          startAnnotation();
        }
      }}
    >
      <EditorToolbar
        editor={editor}
        active={active || {}}
        selection={selection}
        onAnnotate={startAnnotation}
        onInsertImage={insertImage}
      />

      {editor && (
        <BubbleMenu
          editor={editor}
          pluginKey="article-annotation-menu"
          appendTo={() => document.body}
          options={{ placement: 'top', offset: 8, flip: true, shift: true }}
          shouldShow={({ editor: current, from, to }) => {
            if (from === to) return false;
            const { $from, $to } = current.state.selection;
            return $from.sameParent($to) && $from.parent.type.name !== 'codeBlock';
          }}
          className="flex items-center gap-1 rounded-button border border-border bg-surface p-1 shadow-dropdown"
        >
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={startAnnotation}
            disabled={annotationDisabled}
            title={selection?.overlaps ? 'This selection crosses an existing annotation.' : annotationLabel}
            className="inline-flex min-h-[30px] items-center gap-1.5 rounded-[0.45rem] bg-accent-soft px-2.5 text-[11.5px] font-semibold text-accent transition hover:bg-accent/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft disabled:cursor-not-allowed disabled:opacity-45"
          >
            <i aria-hidden="true" className="bx bx-comment-detail text-[15px]" />
            {annotationLabel}
          </button>
        </BubbleMenu>
      )}

      <AnnotationLayer editor={editor} editable>
        <EditorContent editor={editor} />
      </AnnotationLayer>

      <div className="flex items-center justify-between gap-3 border-t border-border-secondary bg-surface-secondary/40 px-4 py-2 text-[10.5px] text-text-tertiary">
        <span>{words} word{words === 1 ? '' : 's'}</span>
        <span className="hidden sm:inline">
          Select text to format it · Ctrl/Cmd + B, I, U and Shift + E work too
        </span>
      </div>

      <AnnotationDialog
        key={dialog ? `${dialog.mode}:${dialog.id || `${dialog.from}-${dialog.to}`}` : 'closed'}
        open={Boolean(dialog)}
        mode={dialog?.mode}
        selectedText={dialog?.text || ''}
        initialKind={dialog?.kind || 'explanation'}
        initialContent={dialog?.content || ''}
        error={dialog?.error || ''}
        onClose={() => setDialog(null)}
        onSave={saveAnnotation}
      />
    </div>
  );
}
