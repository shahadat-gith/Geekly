
/// <reference path="../../types/highlight.d.ts" />
import { useMemo } from 'react';
import hljs from 'highlight.js/lib/core';

import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import cpp from 'highlight.js/lib/languages/cpp';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import sql from 'highlight.js/lib/languages/sql';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';

const LANGUAGES = {
  javascript,
  js: javascript,
  typescript,
  ts: typescript,
  python,
  py: python,
  java,
  cpp,
  'c++': cpp,
  json,
  bash,
  shell: bash,
  sh: bash,
  sql,
  html: xml,
  xml,
  css,
};

Object.entries(LANGUAGES).forEach(([name, definition]) => {
  if (!hljs.getLanguage(name)) {
    hljs.registerLanguage(name, definition);
  }
});

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Syntax-highlighted code sample.
 * Colours come from the `.hljs-*` rules in index.css.
 */
export function CodeBlock({
  code = '',
  language = 'javascript',
  label,
  className = '',
}) {
  const normalizedLanguage = language.toLowerCase();
  const highlighted = useMemo(() => {
    if (!code) return '';

    const definition = LANGUAGES[normalizedLanguage];

    if (!definition || !hljs.getLanguage(normalizedLanguage)) {
      return escapeHtml(code);
    }

    return hljs.highlight(code, {
      language: normalizedLanguage,
      ignoreIllegals: true,
    }).value;
  }, [code, normalizedLanguage]);

  return (
    <div
      className={[
        'overflow-hidden rounded-field border border-border bg-surface',
        'shadow-card',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex min-h-10 items-center justify-between gap-3 border-b border-border-secondary bg-surface-secondary px-4 py-2">
        <span className="truncate text-[12px] font-medium text-text-secondary">
          {label || 'Code example'}
        </span>

        <span className="shrink-0 rounded-md bg-bg-secondary px-2 py-1 font-mono text-[10.5px] font-medium text-text-tertiary">
          {normalizedLanguage}
        </span>
      </div>

      <pre className="m-0 max-h-[520px] overflow-auto px-4 py-4 text-[13px] leading-[1.75] selection:bg-brand-soft">
        <code
          className={`hljs font-mono language-${normalizedLanguage}`}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    </div>
  );
}
