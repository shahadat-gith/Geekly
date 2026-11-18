
// Public reader serialisation for the canonical Tiptap article document.
// This renderer is intentionally framework-free and does not import editor code.

export const ANNOTATION_KINDS = [
  'explanation',
  'definition',
  'context',
  'source',
];

export const ANNOTATION_KIND_LABELS = {
  explanation: 'Explanation',
  definition: 'Definition',
  context: 'Context',
  source: 'Source',
};

const CALLOUT_KINDS = ['info', 'warning', 'success', 'error'];

const TEXT_ALIGNMENTS = ['left', 'center', 'right', 'justify'];
const IMAGE_ALIGNMENTS = ['left', 'center', 'right'];

const SAFE_PROTOCOLS = ['http:', 'https:'];
const SAFE_MAIL_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:'];

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function safeUrl(value, { allowMail = false } = {}) {
  const raw = String(value ?? '').trim();

  if (!raw) return '';

  // Allow same-origin relative paths and in-document anchors.
  if (
    raw.startsWith('/') &&
    !raw.startsWith('//') &&
    !raw.startsWith('/\\')
  ) {
    return raw;
  }

  if (raw.startsWith('#')) return raw;

  try {
    const url = new URL(raw);
    const protocols = allowMail
      ? SAFE_MAIL_PROTOCOLS
      : SAFE_PROTOCOLS;

    return protocols.includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

export function normalizeAnnotationKind(value) {
  return ANNOTATION_KINDS.includes(value)
    ? value
    : 'explanation';
}

function normalizeCalloutKind(value) {
  return CALLOUT_KINDS.includes(value)
    ? value
    : 'info';
}

export function isArticleDoc(value) {
  return (
    isObject(value) &&
    value.type === 'doc' &&
    Array.isArray(value.content)
  );
}

export function articleDocText(doc) {
  const parts = [];

  const visit = (node) => {
    if (!node || !isObject(node)) return;

    if (node.type === 'text') {
      parts.push(String(node.text || ''));
      return;
    }

    if (node.type === 'hardBreak') {
      parts.push(' ');
      return;
    }

    if (node.type === 'codeBlock') {
      parts.push(
        ...(node.content || []).map((child) => child?.text || ''),
        ' ',
      );
      return;
    }

    (node.content || []).forEach(visit);
    parts.push(' ');
  };

  visit(doc);

  return parts.join('').replace(/\s+/g, ' ').trim();
}

function escapeText(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(value) {
  return escapeText(value)
    .replace(/\r/g, '&#13;')
    .replace(/\n/g, '&#10;');
}

function normalizeInteger(value, min, max, fallback) {
  const number = Number.parseInt(value, 10);

  if (!Number.isFinite(number)) return fallback;

  return Math.min(Math.max(number, min), max);
}

function renderMarks(text, marks) {
  if (!Array.isArray(marks)) return text;

  const byType = new Map(
    marks.map((mark) => [mark?.type, mark]),
  );

  let html = text;

  if (byType.has('code')) {
    html = `<code>${html}</code>`;
  }

  if (byType.has('strike')) {
    html = `<s>${html}</s>`;
  }

  if (byType.has('underline')) {
    html = `<u>${html}</u>`;
  }

  if (byType.has('italic')) {
    html = `<em>${html}</em>`;
  }

  if (byType.has('bold')) {
    html = `<strong>${html}</strong>`;
  }

  const link = byType.get('link');

  if (link) {
    const href = safeUrl(link.attrs?.href, {
      allowMail: true,
    });

    if (href) {
      const target =
        link.attrs?.target === '_blank'
          ? ' target="_blank"'
          : link.attrs?.target === '_self'
            ? ' target="_self"'
            : '';

      html = `
        <a
          href="${escapeAttr(href)}"
          ${target}
          rel="noopener noreferrer nofollow"
        >${html}</a>
      `.replace(/\s+/g, ' ');
    }
  }

  if (byType.has('highlight')) {
    html = `<mark>${html}</mark>`;
  }

  const annotation = byType.get('annotation');

  if (annotation) {
    const kind = normalizeAnnotationKind(
      annotation.attrs?.kind,
    );

    const content = String(
      annotation.attrs?.content || '',
    ).trim();

    const id = String(annotation.attrs?.id || '');

    if (id && content) {
      const label = ANNOTATION_KIND_LABELS[kind];

      html = `
        <span
          data-annotation=""
          data-annotation-id="${escapeAttr(id)}"
          data-annotation-kind="${escapeAttr(kind)}"
          data-annotation-content="${escapeAttr(content)}"
          class="article-annotation"
          tabindex="0"
          role="button"
          aria-label="${escapeAttr(`${label}. ${content}`)}"
          aria-haspopup="dialog"
        >${html}</span>
      `;
    }
  }

  return html;
}

function renderInline(content) {
  if (!Array.isArray(content)) return '';

  return content
    .map((node) => {
      if (!node) return '';

      if (node.type === 'text') {
        return renderMarks(
          escapeText(node.text || ''),
          node.marks,
        );
      }

      if (node.type === 'hardBreak') {
        return '<br>';
      }

      return '';
    })
    .join('');
}

function alignStyle(attrs) {
  return TEXT_ALIGNMENTS.includes(attrs?.textAlign)
    ? ` style="text-align:${attrs.textAlign}"`
    : '';
}

function cellAttrs(attrs) {
  let result = '';

  const colspan = normalizeInteger(
    attrs?.colspan,
    1,
    100,
    1,
  );

  const rowspan = normalizeInteger(
    attrs?.rowspan,
    1,
    100,
    1,
  );

  if (colspan > 1) {
    result += ` colspan="${colspan}"`;
  }

  if (rowspan > 1) {
    result += ` rowspan="${rowspan}"`;
  }

  return result;
}

function renderChildren(node) {
  return (node.content || [])
    .map(renderNode)
    .join('');
}

function renderNode(node) {
  if (!node || !isObject(node)) return '';

  switch (node.type) {
    case 'paragraph':
      return `<p${alignStyle(node.attrs)}>${renderInline(node.content)}</p>`;

    case 'heading': {
      const level = normalizeInteger(
        node.attrs?.level,
        1,
        6,
        2,
      );

      return `<h${level}${alignStyle(node.attrs)}>${renderInline(node.content)}</h${level}>`;
    }

    case 'blockquote':
      return `<blockquote>${renderChildren(node)}</blockquote>`;

    case 'bulletList':
      return `<ul>${renderChildren(node)}</ul>`;

    case 'orderedList': {
      const start = normalizeInteger(
        node.attrs?.start,
        1,
        100000,
        1,
      );

      return `<ol${start > 1 ? ` start="${start}"` : ''}>${renderChildren(node)}</ol>`;
    }

    case 'listItem':
      return `<li>${renderChildren(node)}</li>`;

    case 'codeBlock': {
      const language = String(
        node.attrs?.language || 'plaintext',
      ).replace(/[^a-z0-9+#.-]/gi, '');

      const code = escapeText(
        (node.content || [])
          .filter((child) => child?.type === 'text')
          .map((child) => child.text || '')
          .join(''),
      );

      return `<pre><code class="language-${language}">${code}</code></pre>`;
    }

    case 'horizontalRule':
      return '<hr>';

    case 'articleImage': {
      const align = IMAGE_ALIGNMENTS.includes(
        node.attrs?.align,
      )
        ? node.attrs.align
        : 'center';

      const url = safeUrl(node.attrs?.assetUrl);

      if (!url) return '';

      const alt = escapeAttr(node.attrs?.alt || '');
      const caption = String(
        node.attrs?.caption || '',
      ).trim();

      return `
        <figure
          class="article-media article-media-align-${align}"
          data-align="${align}"
        >
          <img
            src="${escapeAttr(url)}"
            alt="${alt}"
            loading="lazy"
            decoding="async"
            class="article-media-image"
          >
          ${caption
          ? `<figcaption>${escapeText(caption)}</figcaption>`
          : ''
        }
        </figure>
      `;
    }

    case 'articleDiagram': {
      const url = safeUrl(node.attrs?.assetUrl);

      if (!url) return '';

      const altText = String(
        node.attrs?.alt || 'Diagram',
      );

      const alt = escapeAttr(altText);

      const caption = String(
        node.attrs?.caption || node.attrs?.alt || '',
      ).trim();

      const diagramId = escapeAttr(
        node.attrs?.diagramId || '',
      );

      return `
        <figure
          class="article-media article-media-align-center article-diagram"
          data-article-diagram="${diagramId}"
        >
          <img
            src="${escapeAttr(url)}"
            alt="${alt}"
            loading="lazy"
            decoding="async"
            class="article-media-image"
          >

          <button
            type="button"
            class="article-diagram-open"
            data-diagram-open
            data-diagram-src="${escapeAttr(url)}"
            data-diagram-alt="${alt}"
            data-diagram-caption="${escapeAttr(caption)}"
            aria-label="${escapeAttr(`Open ${altText} full screen`)}"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M21 16v5h-5"/>
            </svg>
            <span>Full screen</span>
          </button>

          ${caption
          ? `<figcaption>${escapeText(caption)}</figcaption>`
          : ''
        }
        </figure>
      `;
    }

    case 'callout': {
      const kind = normalizeCalloutKind(
        node.attrs?.kind,
      );

      const label =
        kind.charAt(0).toUpperCase() + kind.slice(1);

      return `
        <div
          class="article-callout article-callout-${kind}"
          data-callout="${kind}"
        >
          <p class="article-callout-label">${label}</p>
          ${renderChildren(node)}
        </div>
      `;
    }

    case 'table':
      return `<table><tbody>${renderChildren(node)}</tbody></table>`;

    case 'tableRow':
      return `<tr>${renderChildren(node)}</tr>`;

    case 'tableHeader':
      return `<th${cellAttrs(node.attrs)}>${renderChildren(node)}</th>`;

    case 'tableCell':
      return `<td${cellAttrs(node.attrs)}>${renderChildren(node)}</td>`;

    default:
      return '';
  }
}

export function renderArticleDocToHtml(doc) {
  if (!isArticleDoc(doc)) return '';

  return doc.content
    .map(renderNode)
    .join('');
}
