import {
  ANNOTATION_KIND_LABELS,
  createAnnotationId,
  normalizeAnnotationKind,
} from './articleDocument.js';

function annotationRangesForId(doc, id) {
  const ranges = [];
  doc.descendants((node, pos) => {
    if (!node.isText) return;
    const mark = node.marks.find(
      (candidate) => candidate.type.name === 'annotation' && candidate.attrs.id === id,
    );
    if (!mark) return;

    const from = pos;
    const to = pos + node.nodeSize;
    const previous = ranges[ranges.length - 1];
    if (previous && previous.to === from) previous.to = to;
    else ranges.push({ from, to, attrs: mark.attrs });
  });
  return ranges;
}

/** Build the annotation mark for an app-specific Tiptap installation. */
export function createAnnotationExtension({ Mark, mergeAttributes }) {
  return Mark.create({
    name: 'annotation',
    inclusive: false,
    keepOnSplit: false,

    addAttributes() {
      return {
        id: {
          default: null,
          parseHTML: (element) => element.getAttribute('data-annotation-id'),
          renderHTML: (attributes) =>
            attributes.id ? { 'data-annotation-id': attributes.id } : {},
        },
        kind: {
          default: 'explanation',
          parseHTML: (element) =>
            normalizeAnnotationKind(element.getAttribute('data-annotation-kind')),
          renderHTML: (attributes) => ({
            'data-annotation-kind': normalizeAnnotationKind(attributes.kind),
          }),
        },
        content: {
          default: '',
          parseHTML: (element) => element.getAttribute('data-annotation-content') || '',
          renderHTML: (attributes) => ({
            'data-annotation-content': attributes.content || '',
          }),
        },
      };
    },

    parseHTML() {
      return [{ tag: 'span[data-annotation-id]' }];
    },

    renderHTML({ HTMLAttributes }) {
      const kind = normalizeAnnotationKind(HTMLAttributes['data-annotation-kind']);
      const content = HTMLAttributes['data-annotation-content'] || '';
      return [
        'span',
        mergeAttributes(HTMLAttributes, {
          'data-annotation': '',
          class: 'article-annotation',
          tabindex: '0',
          role: 'button',
          'aria-label': `${ANNOTATION_KIND_LABELS[kind]}. ${content}. Activate to open the annotation.`,
        }),
        0,
      ];
    },

    addCommands() {
      return {
        addAnnotation:
          (attributes = {}) =>
          ({ state, tr, dispatch }) => {
            const { from, to, empty, $from, $to } = state.selection;
            const markType = state.schema.marks.annotation;
            const content = String(attributes.content || '').trim();
            if (!markType || empty || from === to || !content) return false;
            if (!$from.sameParent($to)) return false;
            if ($from.parent.type.name === 'codeBlock') return false;

            const existing = annotationRangesForId(state.doc, attributes.id);
            if (existing.length) return false;

            let overlaps = false;
            state.doc.nodesBetween(from, to, (node) => {
              if (node.isText && node.marks.some((mark) => mark.type.name === 'annotation')) {
                overlaps = true;
              }
            });
            if (overlaps) return false;

            tr.addMark(
              from,
              to,
              markType.create({
                id: attributes.id || createAnnotationId(),
                kind: normalizeAnnotationKind(attributes.kind),
                content: content.slice(0, 2000),
              }),
            );
            if (dispatch) dispatch(tr);
            return true;
          },

        updateAnnotation:
          (id, attributes = {}) =>
          ({ state, tr, dispatch }) => {
            const markType = state.schema.marks.annotation;
            const ranges = annotationRangesForId(state.doc, id);
            if (!markType || !ranges.length) return false;

            const content =
              attributes.content === undefined
                ? ranges[0].attrs.content
                : String(attributes.content).trim().slice(0, 2000);
            if (!content) return false;

            const nextAttrs = {
              id,
              kind: normalizeAnnotationKind(attributes.kind ?? ranges[0].attrs.kind),
              content,
            };
            for (const range of ranges) {
              tr.removeMark(range.from, range.to, markType);
              tr.addMark(range.from, range.to, markType.create(nextAttrs));
            }
            if (dispatch) dispatch(tr);
            return true;
          },

        removeAnnotation:
          (id) =>
          ({ state, tr, dispatch }) => {
            const markType = state.schema.marks.annotation;
            const ranges = annotationRangesForId(state.doc, id);
            if (!markType || !ranges.length) return false;

            for (const range of ranges) tr.removeMark(range.from, range.to, markType);
            if (dispatch) dispatch(tr);
            return true;
          },
      };
    },
  });
}
