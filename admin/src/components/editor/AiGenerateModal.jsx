import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { aiApi } from '../../api/index.js';
import { Alert } from '../ui/Alert.jsx';
import { Button } from '../ui/Button.jsx';
import { Select, Input, Textarea } from '../ui/Field.jsx';
import { Modal } from '../ui/Modal.jsx';
import { modelPriceLabel } from '../../utils/aiModels.js';

const STEPS = [
  'Reading the reference article',
  'Outlining a mentor-led explanation',
  'Writing the sections and planning technical diagrams',
];

export function AiGenerateModal({
  open,
  onClose,
  topics = [],
  topicId = '',
  onTopicChange,
  onGenerated,
}) {
  const [reference, setReference] = useState('');
  const [instructions, setInstructions] = useState('');
  const [error, setError] = useState('');

  const modelsQuery = useQuery({
    queryKey: ['admin', 'ai', 'models'],
    queryFn: () => aiApi.getAiModelsApi(),
    enabled: open,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const generateMutation = useMutation({
    mutationFn: aiApi.generateArticleDraftApi,
    onSuccess: (data) => {
      setError('');
      onGenerated?.(data);
      onClose?.();
    },
    onError: (err) => setError(err.message),
  });

  const textModels = (modelsQuery.data?.models ?? []).filter(
    (model) => model.type === 'text' && model.enabled
  );
  const defaultModel =
    textModels.find((model) => model.isDefault) || textModels[0] || null;

  const pending = generateMutation.isPending;

  function handleClose() {
    if (pending) return;
    setError('');
    onClose?.();
  }

  function onSubmit(event) {
    event.preventDefault();
    if (!topicId) {
      setError('Choose the topic you want the draft to teach.');
      return;
    }

    setError('');
    generateMutation.mutate({ topicId, reference, instructions });
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Write with AI"
      description="Give the writer one reference article and a topic. It teaches the topic like a mentor and saves a structured draft with editable diagrams."
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={handleClose} disabled={pending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="ai-article-form"
            size="sm"
            disabled={pending || !defaultModel || topics.length === 0}
          >
            {pending ? (
              <>
                <i aria-hidden="true" className="bx bx-loader-alt animate-admin-spin text-[16px]" />
                Drafting…
              </>
            ) : (
              <>
                <i aria-hidden="true" className="bx bx-magic-wand text-[16px]" />
                Generate draft
              </>
            )}
          </Button>
        </>
      }
    >
      {modelsQuery.isError && (
        <Alert tone="warning" title="Could not load the text model" className="mb-4">
          {modelsQuery.error.message}
        </Alert>
      )}

      {!modelsQuery.isLoading && !defaultModel && (
        <Alert tone="warning" title="No text model is set up" className="mb-4">
          Add a text model in{' '}
          <Link to="/settings?section=ai-models" className="font-semibold text-brand hover:underline">
            Settings
          </Link>{' '}
          and mark it as the default. Drafts use that model automatically.
        </Alert>
      )}

      {error && (
        <Alert tone="error" title="Draft not generated" className="mb-4">
          {error}
        </Alert>
      )}

      <form id="ai-article-form" onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input
          label="Reference article"
          type="url"
          value={reference}
          onChange={(event) => setReference(event.target.value)}
          placeholder="https://example.com/reference-article"
          hint="One URL. The draft will cover its key ideas in original wording, not copy its text. Leave blank to write from the model’s knowledge."
          disabled={pending}
        />

        <Select
          label="Topic"
          required
          value={topicId}
          onChange={(event) => onTopicChange?.(event.target.value)}
          disabled={pending || topics.length === 0}
          hint={
            topics.length === 0
              ? 'Create a topic before using AI writing.'
              : 'The draft is written for this topic and its sub-topic path.'
          }
        >
          <option value="">{topics.length === 0 ? 'No topics yet' : 'Select a topic'}</option>
          {topics.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {'— '.repeat(topic.depth)}
              {topic.name}
            </option>
          ))}
        </Select>

        <div className="rounded-field border border-border-secondary bg-surface-secondary/50 px-3.5 py-3">
          <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.09em] text-text-tertiary">
            Model
          </p>
          {defaultModel ? (
            <>
              <p className="m-0 mt-1 text-[12.5px] font-semibold text-text">{defaultModel.name}</p>
              <p
                className="m-0 mt-0.5 truncate font-mono text-[10.5px] text-text-tertiary"
                title={defaultModel.modelId}
              >
                {defaultModel.modelId}
              </p>
              <p className="m-0 mt-1.5 text-[10.5px] text-text-tertiary">
                {modelPriceLabel(defaultModel)} · change the default in{' '}
                <Link to="/settings?section=ai-models" className="font-semibold text-brand hover:underline">
                  Settings
                </Link>
              </p>
            </>
          ) : (
            <p className="m-0 mt-1 text-[12px] text-text-secondary">
              Add a text model in{' '}
              <Link to="/settings?section=ai-models" className="font-semibold text-brand hover:underline">
                Settings
              </Link>
              .
            </p>
          )}
        </div>

        <Textarea
          label="Custom instructions"
          value={instructions}
          onChange={(event) => setInstructions(event.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Optional. Focus on caching trade-offs, include a comparison of Redis and Memcached, keep it practical for beginners…"
          hint="The AI follows your direction for focus, depth, tone and examples."
          disabled={pending}
        />

        <div className="rounded-field border border-border-secondary bg-surface-secondary/60 p-3.5">
          <p className="m-0 flex items-center gap-1.5 text-[12px] font-semibold text-text-secondary">
            <i aria-hidden="true" className="bx bx-bulb text-[15px] text-brand" />
            What comes back
          </p>
          <ul className="m-0 mt-2 space-y-1.5 pl-1 text-[11.5px] leading-relaxed text-text-tertiary">
            <li className="flex gap-1.5">
              <i aria-hidden="true" className="bx bx-check mt-0.5 text-[13px] text-success" />
              A title, subtitle and full article, saved automatically as a draft.
            </li>
            <li className="flex gap-1.5">
              <i aria-hidden="true" className="bx bx-check mt-0.5 text-[13px] text-success" />
              Diagram placeholders backed by saved structure, ready to generate as a light-theme image or replace manually.
            </li>
            <li className="flex gap-1.5">
              <i aria-hidden="true" className="bx bx-check mt-0.5 text-[13px] text-success" />
              You can review, edit and publish the draft from the article editor.
            </li>
          </ul>
        </div>

        {pending && (
          <div className="rounded-field border border-brand/25 bg-brand-soft/60 p-3.5">
            <p className="m-0 flex items-center gap-2 text-[12px] font-semibold text-brand">
              <i aria-hidden="true" className="bx bx-loader-alt animate-admin-spin text-[16px]" />
              Reading the reference and writing the draft…
            </p>
            <ol className="m-0 mt-2 space-y-1 pl-5 text-[11.5px] leading-relaxed text-text-secondary">
              {STEPS.map((step) => (
                <li key={step} className="list-decimal">
                  {step}
                </li>
              ))}
            </ol>
            <p className="m-0 mt-2 text-[10.5px] text-text-tertiary">
              Detailed articles take one to three minutes. Keep this window open.
            </p>
          </div>
        )}
      </form>
    </Modal>
  );
}
