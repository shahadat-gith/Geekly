import { CALLOUT_KINDS } from './articleDocument.js';

function normalizeCalloutKind(value) {
  return CALLOUT_KINDS.includes(value) ? value : 'info';
}

/** Editable callout container with info/warning/success/error variants. */
export function createCalloutExtension({ Node, mergeAttributes, addNodeView }) {
  return Node.create({
    name: 'callout',
    group: 'block',
    content: 'block+',
    defining: true,
    isolating: true,

    addAttributes() {
      return {
        kind: {
          default: 'info',
          parseHTML: (element) => normalizeCalloutKind(element.getAttribute('data-callout')),
          renderHTML: (attributes) => ({
            'data-callout': normalizeCalloutKind(attributes.kind),
          }),
        },
      };
    },

    parseHTML() {
      return [{ tag: 'div[data-callout]' }];
    },

    renderHTML({ node, HTMLAttributes }) {
      const kind = normalizeCalloutKind(node.attrs.kind);
      return [
        'div',
        mergeAttributes(HTMLAttributes, {
          class: `article-callout article-callout-${kind}`,
        }),
        0,
      ];
    },

    addNodeView: addNodeView ? () => addNodeView() : undefined,
  });
}

export { normalizeCalloutKind };
