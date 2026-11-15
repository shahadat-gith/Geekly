import { useMemo, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaApi, topicsApi } from '../../api/index.js';
import { useToast } from '../../context/toastContext.js';
import { Input, Select, Textarea } from '../ui/Field.jsx';
import { Button } from '../ui/Button.jsx';
import { Modal } from '../ui/Modal.jsx';
import { Alert } from '../ui/Alert.jsx';

const EMPTY_FORM = {
  name: '',
  description: '',
  parent: '',
  sortOrder: 0,
  coverImage: { url: '', key: '' },
};

function initialForm(topic, parentId) {
  if (!topic) return { ...EMPTY_FORM, parent: parentId || '' };

  return {
    name: topic.name || '',
    description: topic.description || '',
    parent: topic.parent || '',
    sortOrder: topic.sortOrder ?? 0,
    coverImage: topic.coverImage || { url: '', key: '' },
  };
}

export function TopicModal({ open, onClose, topic = null, parentId = '', topics = [] }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [form, setForm] = useState(() => initialForm(topic, parentId));
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const bannerInputRef = useRef(null);

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      topic ? topicsApi.updateTopicApi(topic.id, payload) : topicsApi.createTopicApi(payload),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'topics'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'articles'] });
      toast({
        title: topic ? 'Topic updated' : 'Topic created',
        description: `“${saved.name}” is ready to use.`,
      });
      onClose();
    },
    onError: (err) => setError(err.message),
  });

  // A topic can't be its own parent, nor be moved under one of its descendants.
  const parentOptions = useMemo(() => {
    const blocked = new Set();
    if (topic) {
      blocked.add(topic.id);
      for (const item of topics) {
        if ((item.ancestors || []).includes(topic.id)) blocked.add(item.id);
      }
    }

    return topics
      .filter((item) => !blocked.has(item.id))
      .sort((a, b) => a.path.localeCompare(b.path));
  }, [topics, topic]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Topic name is required.');
      return;
    }

    saveMutation.mutate({
      name: form.name.trim(),
      description: form.description,
      parent: form.parent || null,
      sortOrder: Number(form.sortOrder) || 0,
      ...(!form.parent && (form.coverImage?.url || form.coverImage?.key || topic?.coverImage?.url || topic?.coverImage?.key)
        ? { coverImage: form.coverImage }
        : {}),
    });
  }

  async function onBannerSelected(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      const image = await mediaApi.uploadTopicBannerApi(file);
      update('coverImage', image);
    } catch (uploadError) {
      setError(uploadError.message || 'Banner upload failed.');
    } finally {
      setUploading(false);
    }
  }

  const title = topic ? 'Edit topic' : form.parent ? 'Add sub-topic' : 'Add topic';
  const parentName = topics.find((item) => item.id === form.parent)?.name;

  return (
    <Modal
      open={open}
      onClose={saveMutation.isPending ? () => {} : onClose}
      title={title}
      description={
        topic
          ? 'Update the topic and where it sits in the library.'
          : form.parent
            ? `Nested under ${parentName || 'the selected topic'}.`
            : 'Create a top-level subject or choose a parent for a sub-topic.'
      }
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={saveMutation.isPending || uploading}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={saveMutation.isPending || uploading}
            type="submit"
            form="topic-form"
          >
            {saveMutation.isPending ? (
              <>
                <i aria-hidden="true" className="bx bx-loader-alt animate-admin-spin text-[16px]" />
                Saving…
              </>
            ) : (
              <>
                <i aria-hidden="true" className="bx bx-check text-[17px]" />
                {topic ? 'Save changes' : 'Create topic'}
              </>
            )}
          </Button>
        </>
      }
    >
      <form id="topic-form" onSubmit={onSubmit} className="flex flex-col gap-4">
        {error && <Alert>{error}</Alert>}

        <Input
          label="Topic name"
          required
          value={form.name}
          onChange={(event) => update('name', event.target.value)}
          placeholder="e.g. System Design"
          maxLength={120}
          autoFocus
        />

        <Select
          label="Parent topic"
          hint="Leave empty to create a top-level subject."
          value={form.parent}
          onChange={(event) => update('parent', event.target.value)}
        >
          <option value="">None — top-level subject</option>
          {parentOptions.map((item) => (
            <option key={item.id} value={item.id}>
              {'— '.repeat(item.depth)}
              {item.name}
            </option>
          ))}
        </Select>

        {!form.parent && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold text-text-secondary">Parent topic banner</span>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              onChange={onBannerSelected}
              className="sr-only"
            />
            {form.coverImage?.url && (
              <img
                src={form.coverImage.url}
                alt={`${form.name || 'Topic'} banner preview`}
                className="h-32 w-full rounded-field border border-border object-cover"
              />
            )}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={uploading}
                onClick={() => bannerInputRef.current?.click()}
              >
                <i aria-hidden="true" className={`bx ${uploading ? 'bx-loader-alt animate-admin-spin' : 'bx-upload'} text-[15px]`} />
                {uploading ? 'Uploading…' : form.coverImage?.url ? 'Replace banner' : 'Upload banner'}
              </Button>
              {form.coverImage?.url && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => update('coverImage', { url: '', key: '' })}
                >
                  Remove banner
                </Button>
              )}
              <span className="text-[10.5px] text-text-tertiary">JPEG, PNG, WebP, GIF or AVIF · max 10 MB</span>
            </div>
          </div>
        )}

        <Textarea
          label="Description"
          value={form.description}
          onChange={(event) => update('description', event.target.value)}
          placeholder="A short description of what this topic covers."
          rows={3}
          maxLength={1000}
          hint="Shown alongside the topic in the admin library."
        />

        <Input
          label="Sort order"
          type="number"
          min="0"
          value={form.sortOrder}
          onChange={(event) => update('sortOrder', event.target.value)}
          hint="Lower comes first."
        />
      </form>
    </Modal>
  );
}
