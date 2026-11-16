import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import { CALLOUT_KINDS } from './articleDocument.js';

const CALLOUT_META = {
  info: { label: 'Info', icon: 'bx-info-circle' },
  warning: { label: 'Warning', icon: 'bx-error' },
  success: { label: 'Success', icon: 'bx-check-circle' },
  error: { label: 'Error', icon: 'bx-x-circle' },
};

export function CalloutNodeView({ node, editor }) {
  const kind = CALLOUT_KINDS.includes(node.attrs.kind) ? node.attrs.kind : 'info';
  const meta = CALLOUT_META[kind];

  return (
    <NodeViewWrapper
      as="div"
      className={`article-callout article-callout-${kind}`}
      data-callout={kind}
    >
      <div className="article-callout-header" contentEditable={false}>
        <span className="article-callout-title">
          <i aria-hidden="true" className={`bx ${meta.icon} text-[16px]`} />
          {meta.label}
        </span>
        {editor.isEditable && (
          <label className="article-callout-picker">
            <span className="sr-only">Callout type</span>
            <select
              value={kind}
              onChange={(event) => editor.chain().focus().updateAttributes('callout', { kind: event.target.value }).run()}
              aria-label="Callout type"
            >
              {CALLOUT_KINDS.map((value) => (
                <option key={value} value={value}>
                  {CALLOUT_META[value].label}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <NodeViewContent className="article-callout-content" />
    </NodeViewWrapper>
  );
}
