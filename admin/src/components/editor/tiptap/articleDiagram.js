function cleanDiagramId(value) {
  return String(value || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
}

/**
 * Diagram placeholder. The node only references the Diagram document and the
 * optional article asset; it never duplicates diagram structure.
 */
export function createArticleDiagramExtension({ Node, mergeAttributes, addNodeView }) {
  return Node.create({
    name: 'articleDiagram',
    group: 'block',
    atom: true,
    selectable: true,
    draggable: false,

    addAttributes() {
      return {
        diagramId: {
          default: null,
          parseHTML: (element) => element.getAttribute('data-article-diagram'),
          renderHTML: (attributes) =>
            attributes.diagramId ? { 'data-article-diagram': attributes.diagramId } : {},
        },
        assetKey: {
          default: null,
          parseHTML: (element) => element.getAttribute('data-asset-key'),
          renderHTML: (attributes) =>
            attributes.assetKey ? { 'data-asset-key': attributes.assetKey } : {},
        },
        assetUrl: {
          default: null,
          parseHTML: (element) =>
            element.getAttribute('data-asset-url') ||
            element.querySelector('img')?.getAttribute('src') ||
            null,
          renderHTML: (attributes) =>
            attributes.assetUrl ? { 'data-asset-url': attributes.assetUrl } : {},
        },
        alt: {
          default: '',
          parseHTML: (element) =>
            element.getAttribute('data-alt') || element.querySelector('img')?.getAttribute('alt') || '',
          renderHTML: (attributes) => (attributes.alt ? { 'data-alt': attributes.alt } : {}),
        },
        caption: {
          default: '',
          parseHTML: (element) =>
            element.getAttribute('data-caption') ||
            element.querySelector('figcaption')?.textContent ||
            '',
          renderHTML: (attributes) =>
            attributes.caption ? { 'data-caption': attributes.caption } : {},
        },
      };
    },

    parseHTML() {
      return [{ tag: 'figure[data-article-diagram]' }];
    },

    renderHTML({ node, HTMLAttributes }) {
      const diagramId = cleanDiagramId(node.attrs.diagramId);
      const image = String(node.attrs.assetUrl || '').trim();
      const caption = String(node.attrs.caption || node.attrs.alt || '').trim();
      return [
        'figure',
        mergeAttributes(HTMLAttributes, {
          class: 'article-image-block article-diagram-block article-image-align-center',
          'data-article-diagram': diagramId,
        }),
        ...(image
          ? [
              [
                'img',
                {
                  src: image,
                  alt: String(node.attrs.alt || ''),
                  loading: 'lazy',
                  class: 'article-media-image',
                },
              ],
            ]
          : []),
        ...(image && caption ? [['figcaption', caption]] : []),
      ];
    },

    addNodeView: addNodeView ? () => addNodeView() : undefined,
  });
}

export { cleanDiagramId };
