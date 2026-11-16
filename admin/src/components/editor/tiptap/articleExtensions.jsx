import {
  Mark,
  mergeAttributes,
  Node,
  ReactNodeViewRenderer,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { TableKit } from '@tiptap/extension-table';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { createAnnotationExtension } from './annotation.js';
import { createArticleImageExtension } from './articleImage.js';
import { createArticleDiagramExtension } from './articleDiagram.js';
import { createCalloutExtension } from './callout.js';
import { createArticleExtensions } from './extensions.js';
import { createDiagramStore } from './diagramStore.js';
import { ArticleImageNodeView } from './ArticleImageNodeView.jsx';
import { ArticleDiagramNodeView } from './ArticleDiagramNodeView.jsx';
import { CalloutNodeView } from './CalloutNodeView.jsx';

const lowlight = createLowlight(common);

const Annotation = createAnnotationExtension({ Mark, mergeAttributes });
const Callout = createCalloutExtension({
  Node,
  mergeAttributes,
  addNodeView: () => ReactNodeViewRenderer(CalloutNodeView),
});

function articleImageExtension(imageActions) {
  return createArticleImageExtension({
    Node,
    mergeAttributes,
    addNodeView: () =>
      ReactNodeViewRenderer((props) => (
        <ArticleImageNodeView {...props} imageActions={imageActions} />
      )),
  });
}

function articleDiagramExtension(store, diagramActions) {
  return createArticleDiagramExtension({
    Node,
    mergeAttributes,
    addNodeView: () =>
      ReactNodeViewRenderer((props) => (
        <ArticleDiagramNodeView
          {...props}
          store={store}
          diagramActions={diagramActions}
        />
      )),
  });
}

export function createEditorExtensions(diagramStore, imageActions, diagramActions) {
  return createArticleExtensions({
    StarterKit,
    Placeholder,
    TextAlign,
    Highlight,
    TableKit,
    CodeBlockLowlight,
    lowlight,
    Annotation,
    ArticleImage: articleImageExtension(imageActions),
    ArticleDiagram: articleDiagramExtension(diagramStore, diagramActions),
    Callout,
  });
}

export function createPreviewExtensions(diagrams = []) {
  const diagramStore = createDiagramStore(diagrams);
  return createArticleExtensions({
    StarterKit,
    TextAlign,
    Highlight,
    TableKit,
    CodeBlockLowlight,
    lowlight,
    Annotation,
    ArticleImage: articleImageExtension(),
    ArticleDiagram: articleDiagramExtension(diagramStore),
    Callout,
    placeholder: '',
  });
}
