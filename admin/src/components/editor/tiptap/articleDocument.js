// Admin-side helpers for the canonical Tiptap article document.
// Validation and HTML generation live on the API; this module only contains the
// schema contracts and ProseMirror selection helpers the editor needs.

export const ANNOTATION_KINDS = ['explanation', 'definition', 'context', 'source'];
export const ANNOTATION_KIND_LABELS = {
  explanation: 'Explanation',
  definition: 'Definition',
  context: 'Context',
  source: 'Source',
};

export const CALLOUT_KINDS = ['info', 'warning', 'success', 'error'];

export function normalizeAnnotationKind(value) {
  return ANNOTATION_KINDS.includes(value) ? value : 'explanation';
}

export function createAnnotationId() {
  const random =
    typeof globalThis.crypto?.randomUUID === 'function'
      ? globalThis.crypto.randomUUID().replace(/-/g, '').slice(0, 20)
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  return `ann_${random}`;
}

export function isArticleDoc(value) {
  return Boolean(value) && typeof value === 'object' && value.type === 'doc' && Array.isArray(value.content);
}

function textFromNode(node) {
  if (!node || typeof node !== 'object') return '';
  if (node.type === 'text') return String(node.text || '');
  if (node.type === 'hardBreak') return ' ';
  if (node.type === 'codeBlock') {
    return `${(node.content || []).map((child) => child?.text || '').join('')} `;
  }
  return (node.content || []).map(textFromNode).join(' ');
}

export function articleDocText(doc) {
  return textFromNode(doc).replace(/\s+/g, ' ').trim();
}

export function articleDocHasContent(doc) {
  if (!isArticleDoc(doc)) return false;
  if (articleDocText(doc)) return true;
  let found = false;
  const visit = (node) => {
    if (!node || found) return;
    if (
      node.type === 'articleImage' ||
      node.type === 'articleDiagram' ||
      node.type === 'horizontalRule'
    ) {
      found = true;
    } else {
      (node.content || []).forEach(visit);
    }
  };
  visit(doc);
  return found;
}

export function articleDocDiagramIds(doc) {
  const ids = new Set();
  const visit = (node) => {
    if (!node) return;
    if (node.type === 'articleDiagram' && node.attrs?.diagramId) {
      ids.add(String(node.attrs.diagramId));
    }
    (node.content || []).forEach(visit);
  };
  visit(doc);
  return ids;
}

/** Collect contiguous mark ranges for every annotation in a ProseMirror doc. */
export function annotationRanges(doc) {
  const ranges = [];
  doc.descendants((node, pos) => {
    if (!node.isText) return;
    const mark = node.marks.find((candidate) => candidate.type.name === 'annotation');
    if (!mark) return;

    const from = pos;
    const to = pos + node.nodeSize;
    const previous = ranges[ranges.length - 1];
    if (previous && previous.id === mark.attrs.id && previous.to === from) {
      previous.to = to;
      return;
    }
    ranges.push({
      id: mark.attrs.id,
      kind: mark.attrs.kind,
      content: mark.attrs.content,
      from,
      to,
      mark,
    });
  });
  return ranges;
}

export function annotationInRange(doc, from, to) {
  return annotationRanges(doc).find((range) => range.from < to && range.to > from) || null;
}

export function annotationAtPosition(doc, pos) {
  return annotationRanges(doc).find((range) => range.from <= pos && pos <= range.to) || null;
}
