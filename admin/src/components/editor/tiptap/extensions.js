/**
 * One extension composition for editing and previewing article documents.
 * Editor-specific NodeViews are supplied by the caller through the factories.
 */
export function createArticleExtensions({
  StarterKit,
  Placeholder = null,
  TextAlign,
  Highlight,
  TableKit,
  CodeBlockLowlight,
  lowlight,
  Annotation,
  ArticleImage,
  ArticleDiagram,
  Callout,
  placeholder = 'Start writing the article…',
}) {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4, 5, 6] },
      codeBlock: false,
      link: {
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        defaultProtocol: 'https',
        HTMLAttributes: { rel: 'noopener noreferrer nofollow' },
      },
    }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Highlight.configure({ multicolor: false }),
    TableKit.configure({ table: { resizable: false } }),
    CodeBlockLowlight.configure({
      lowlight,
      defaultLanguage: 'plaintext',
      HTMLAttributes: { class: 'article-code-block' },
    }),
    Placeholder?.configure({
      placeholder,
      showOnlyWhenEditable: true,
    }),
    Annotation,
    ArticleImage,
    ArticleDiagram,
    Callout,
  ].filter(Boolean);
}
