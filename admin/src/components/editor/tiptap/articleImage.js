const ALIGNMENTS = ['left', 'center', 'right'];

function safeAssetUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (raw.startsWith('/')) return raw;
  try {
    const url = new URL(raw);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

/** Self-contained image block. Asset metadata lives in the Tiptap node. */
export function createArticleImageExtension({ Node, mergeAttributes, addNodeView }) {
  return Node.create({
    name: 'articleImage',
    group: 'block',
    atom: true,
    selectable: true,
    draggable: false,

    addAttributes() {
      return {
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
            element.getAttribute('data-caption') || element.querySelector('figcaption')?.textContent || '',
          renderHTML: (attributes) =>
            attributes.caption ? { 'data-caption': attributes.caption } : {},
        },
        align: {
          default: 'center',
          parseHTML: (element) =>
            ALIGNMENTS.includes(element.getAttribute('data-align'))
              ? element.getAttribute('data-align')
              : 'center',
          renderHTML: (attributes) => ({
            'data-align': ALIGNMENTS.includes(attributes.align) ? attributes.align : 'center',
          }),
        },
      };
    },

    parseHTML() {
      return [{ tag: 'figure[data-article-image]' }, { tag: 'figure[data-article-media]' }];
    },

    renderHTML({ node, HTMLAttributes }) {
      const align = ALIGNMENTS.includes(node.attrs.align) ? node.attrs.align : 'center';
      const image = safeAssetUrl(node.attrs.assetUrl);
      const alt = String(node.attrs.alt || '');
      return [
        'figure',
        mergeAttributes(HTMLAttributes, {
          class: `article-image-block article-image-align-${align}`,
        }),
        ...(image
          ? [
              [
                'img',
                {
                  src: image,
                  alt,
                  loading: 'lazy',
                  class: 'article-media-image',
                },
              ],
            ]
          : []),
        ...(node.attrs.caption ? [['figcaption', String(node.attrs.caption)]] : []),
      ];
    },

    addNodeView: addNodeView ? () => addNodeView() : undefined,
  });
}

export { ALIGNMENTS as IMAGE_ALIGNMENTS, safeAssetUrl };
