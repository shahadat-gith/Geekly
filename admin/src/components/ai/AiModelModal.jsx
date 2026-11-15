import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { aiApi } from '../../api/index.js';
import { useToast } from '../../context/toastContext.js';
import { Alert } from '../ui/Alert.jsx';
import { Button } from '../ui/Button.jsx';
import { Input, Select, Textarea } from '../ui/Field.jsx';
import { Modal } from '../ui/Modal.jsx';
import { MODEL_TYPES, modelType } from '../../utils/aiModels.js';

const priceValue = (value) => (value == null ? '' : String(value));

function ModelForm({ model, onSaved, onClose }) {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [name, setName] = useState(model?.name || '');
  const [modelId, setModelId] = useState(model?.modelId || '');
  const [type, setType] = useState(model?.type || 'text');
  const [inputPrice, setInputPrice] = useState(priceValue(model?.pricePerMillionInput));
  const [outputPrice, setOutputPrice] = useState(priceValue(model?.pricePerMillionOutput));
  const [imagePrice, setImagePrice] = useState(priceValue(model?.pricePerImage));
  const [megapixelPrice, setMegapixelPrice] = useState(priceValue(model?.pricePerMegapixel));
  const [videoPrice, setVideoPrice] = useState(priceValue(model?.pricePerSecond));
  const [characterPrice, setCharacterPrice] = useState(priceValue(model?.pricePerMillionCharacters));
  const [notes, setNotes] = useState(model?.notes || '');
  const [enabled, setEnabled] = useState(model ? model.enabled !== false : true);
  const [isDefault, setIsDefault] = useState(Boolean(model?.isDefault));
  const [error, setError] = useState('');

  const isImage = type === 'image';
  const isVideo = type === 'video';
  const currentType = modelType(type);

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      model ? aiApi.updateAiModelApi(model.id, payload) : aiApi.createAiModelApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ai', 'models'] });
      toast({ title: model ? 'Model updated' : 'Model added' });
      onSaved?.();
      onClose?.();
    },
    onError: (saveError) => setError(saveError.message),
  });

  function onSubmit(event) {
    event.preventDefault();
    setError('');

    saveMutation.mutate({
      name,
      modelId,
      type,
      pricePerMillionInput: isImage ? null : inputPrice,
      pricePerMillionOutput: isImage ? null : outputPrice,
      pricePerImage: isImage ? imagePrice : null,
      pricePerMegapixel: isImage ? megapixelPrice : null,
      pricePerSecond: isVideo ? videoPrice : null,
      pricePerMillionCharacters: type === 'audio' ? characterPrice : null,
      notes,
      enabled,
      isDefault: enabled ? isDefault : false,
    });
  }

  const busy = saveMutation.isPending;

  return (
    <Modal
      open
      onClose={busy ? () => {} : onClose}
      title={model ? 'Edit model' : 'Add a new model'}
      description="Store the provider model id once. Generation always uses the default model for its type, so nobody types a model name again."
      size="md"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" form="ai-model-form" size="sm" disabled={busy}>
            {busy ? (
              <>
                <i aria-hidden="true" className="bx bx-loader-alt animate-admin-spin text-[16px]" />
                Saving…
              </>
            ) : (
              <>
                <i aria-hidden="true" className="bx bx-check text-[16px]" />
                {model ? 'Save model' : 'Add model'}
              </>
            )}
          </Button>
        </>
      }
    >
      {error && (
        <Alert tone="error" title="Model not saved" className="mb-4">
          {error}
        </Alert>
      )}

      <form id="ai-model-form" onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input
          label="Display name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Claude Sonnet 4"
          maxLength={120}
          disabled={busy}
          hint="Only used inside the admin console."
        />

        <Input
          label="Provider model id"
          required
          value={modelId}
          onChange={(event) => setModelId(event.target.value)}
          placeholder="anthropic/claude-sonnet-4"
          spellCheck={false}
          maxLength={200}
          disabled={busy}
          hint="Exact id the provider expects, with no spaces."
        />

        <Select
          label="Type"
          required
          value={type}
          onChange={(event) => setType(event.target.value)}
          disabled={busy}
          hint={currentType.hint}
        >
          {MODEL_TYPES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </Select>

        {isImage ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Price per image (USD)"
              type="number"
              min="0"
              step="0.0001"
              value={imagePrice}
              onChange={(event) => setImagePrice(event.target.value)}
              disabled={busy}
              hint="For models billed per output image."
            />
            <Input
              label="Price per megapixel (USD)"
              type="number"
              min="0"
              step="0.0001"
              value={megapixelPrice}
              onChange={(event) => setMegapixelPrice(event.target.value)}
              disabled={busy}
              hint="For models billed by output resolution."
            />
            <p className="m-0 text-[10.5px] leading-relaxed text-text-tertiary sm:col-span-2">
              Reference prices only; actual usage cost comes from the provider response.
            </p>
          </div>
        ) : isVideo ? (
          <Input
            label="Price per second (USD)"
            type="number"
            min="0"
            step="0.0001"
            value={videoPrice}
            onChange={(event) => setVideoPrice(event.target.value)}
            disabled={busy}
            hint="Reference price per generated second; actual usage cost comes from the provider response."
          />
        ) : type === 'audio' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Input price (USD per 1M tokens)"
              type="number"
              min="0"
              step="0.0001"
              value={inputPrice}
              onChange={(event) => setInputPrice(event.target.value)}
              disabled={busy}
              hint="For token-priced audio models."
            />
            <Input
              label="Output price (USD per 1M tokens)"
              type="number"
              min="0"
              step="0.0001"
              value={outputPrice}
              onChange={(event) => setOutputPrice(event.target.value)}
              disabled={busy}
              hint="For token-priced audio models."
            />
            <Input
              label="Price per million characters (USD)"
              type="number"
              min="0"
              step="0.01"
              value={characterPrice}
              onChange={(event) => setCharacterPrice(event.target.value)}
              disabled={busy}
              hint="For character-priced text-to-speech models."
              className="sm:col-span-2"
            />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Input price (USD per 1M tokens)"
              type="number"
              min="0"
              step="0.0001"
              value={inputPrice}
              onChange={(event) => setInputPrice(event.target.value)}
              disabled={busy}
              hint="Leave empty when unknown."
            />
            <Input
              label="Output price (USD per 1M tokens)"
              type="number"
              min="0"
              step="0.0001"
              value={outputPrice}
              onChange={(event) => setOutputPrice(event.target.value)}
              disabled={busy}
              hint="Leave empty when unknown."
            />
          </div>
        )}

        <Textarea
          label="Notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={2}
          maxLength={300}
          disabled={busy}
          placeholder="Optional. What this model is good at, limits, provider quirks…"
        />

        <div className="flex flex-col gap-2 rounded-field border border-border-secondary bg-surface-secondary/50 p-3.5">
          <label className="flex items-start gap-2.5 text-[12.5px] text-text-secondary">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(event) => setEnabled(event.target.checked)}
              disabled={busy}
              className="mt-0.5 h-4 w-4 accent-[var(--color-brand)]"
            />
            <span>
              <span className="font-semibold text-text">Enabled</span>
              <span className="block text-[11px] text-text-tertiary">
                Disabled models stay in the list but are never used for generation.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-2.5 text-[12.5px] text-text-secondary">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(event) => setIsDefault(event.target.checked)}
              disabled={busy || !enabled}
              className="mt-0.5 h-4 w-4 accent-[var(--color-brand)]"
            />
            <span>
              <span className="font-semibold text-text">Default for {currentType.label.toLowerCase()}</span>
              <span className="block text-[11px] text-text-tertiary">
                There is one default per type. Choosing this replaces the current one.
              </span>
            </span>
          </label>
        </div>
      </form>
    </Modal>
  );
}

export function AiModelModal({ open, onClose, model = null, onSaved }) {
  if (!open) return null;

  return (
    <ModelForm
      key={model?.id || 'new'}
      model={model}
      onSaved={onSaved}
      onClose={onClose}
    />
  );
}
