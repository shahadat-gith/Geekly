import { EditorContent, useEditor } from '@tiptap/react';
import { AnnotationLayer } from '../annotations/AnnotationLayer.jsx';
import { articleDocHasContent } from './articleDocument.js';
import { createPreviewExtensions } from './articleExtensions.jsx';

export function ArticleDocumentPreview({ doc, diagrams = [], emptyText = '' }) {
  const editor = useEditor({
    extensions: createPreviewExtensions(diagrams),
    content: doc,
    editable: false,
    editorProps: {
      attributes: { class: 'article-preview-content outline-none' },
    },
  });

  if (!articleDocHasContent(doc)) {
    return emptyText ? (
      <p className="m-0 text-[13px] italic text-text-tertiary">{emptyText}</p>
    ) : null;
  }

  return (
    <AnnotationLayer editor={editor} editable={false} className="article-prose">
      <EditorContent editor={editor} />
    </AnnotationLayer>
  );
}
