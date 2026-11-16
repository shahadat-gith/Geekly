import { useState } from 'react';
import { Alert } from '../../ui/Alert.jsx';
import { Button } from '../../ui/Button.jsx';
import { Select, Textarea } from '../../ui/Field.jsx';
import { Modal } from '../../ui/Modal.jsx';
import {
  ANNOTATION_KINDS,
  ANNOTATION_KIND_LABELS,
  normalizeAnnotationKind,
} from '../tiptap/articleDocument.js';

export function AnnotationDialog({
  open,
  mode = 'create',
  selectedText = '',
  initialKind = 'explanation',
  initialContent = '',
  error = '',
  onClose,
  onSave,
}) {
  const [kind, setKind] = useState(normalizeAnnotationKind(initialKind));
  const [content, setContent] = useState(initialContent);
  const [localError, setLocalError] = useState('');

  function submit(event) {
    event.preventDefault();
    const nextContent = content.trim();
    if (!nextContent) {
      setLocalError('Write an explanation for this annotation.');
      return;
    }
    if (!selectedText.trim()) {
      setLocalError('Select some text before creating an annotation.');
      return;
    }
    setLocalError('');
    onSave?.({ kind, content: nextContent });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'edit' ? 'Edit annotation' : 'Annotate selection'}
      description="The explanation appears when a reader hovers over or taps the marked text."
      size="sm"
      footer={
        <>
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="annotation-form" size="sm">
            <i aria-hidden="true" className="bx bx-check text-[16px]" />
            {mode === 'edit' ? 'Save annotation' : 'Add annotation'}
          </Button>
        </>
      }
    >
      <form id="annotation-form" onSubmit={submit} className="flex flex-col gap-4">
        <div className="rounded-field border border-accent/25 bg-accent-soft/55 px-3.5 py-3">
          <p className="m-0 text-[10.5px] font-semibold text-accent">Annotated text</p>
          <p className="m-0 mt-1 line-clamp-3 text-[12.5px] leading-relaxed text-text-secondary">
            “{selectedText}”
          </p>
        </div>

        {(localError || error) && (
          <Alert tone="error" title="Annotation not saved" role="alert">
            {localError || error}
          </Alert>
        )}

        <Select
          label="Type"
          value={kind}
          onChange={(event) => setKind(event.target.value)}
        >
          {ANNOTATION_KINDS.map((value) => (
            <option key={value} value={value}>
              {ANNOTATION_KIND_LABELS[value]}
            </option>
          ))}
        </Select>

        <Textarea
          label="Explanation"
          required
          data-autofocus
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={5}
          maxLength={2000}
          placeholder="Explain the term or add the context a reader needs."
          hint={`${content.length}/2000 characters`}
          error={localError && !content.trim() ? 'An explanation is required.' : undefined}
        />
      </form>
    </Modal>
  );
}
