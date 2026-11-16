import { Fragment, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { aiApi } from '../api/index.js';
import { useToast } from '../context/toastContext.js';
import { AiModelModal } from '../components/ai/AiModelModal.jsx';
import { Alert } from '../components/ui/Alert.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { ConfirmDialog } from '../components/ui/ConfirmDialog.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { MODEL_TYPES, modelPriceLabel } from '../utils/aiModels.js';

function AiModelsSection() {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const modelsQuery = useQuery({
    queryKey: ['admin', 'ai', 'models'],
    queryFn: () => aiApi.getAiModelsApi(),
  });

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['admin', 'ai', 'models'] });

  const defaultMutation = useMutation({
    mutationFn: (id) => aiApi.updateAiModelApi(id, { isDefault: true }),
    onSuccess: () => {
      refresh();
      toast({ title: 'Default model updated' });
    },
    onError: (error) => toast({ title: 'Default not updated', description: error.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => aiApi.deleteAiModelApi(id),
    onSuccess: () => {
      setDeleting(null);
      setDeleteError('');
      refresh();
      toast({ title: 'Model deleted' });
    },
    onError: (error) => setDeleteError(error.message),
  });

  const models = modelsQuery.data?.models ?? [];
  const modelGroups = MODEL_TYPES
    .map((type) => ({ type, models: models.filter((model) => model.type === type.value) }))
    .filter((group) => group.models.length > 0);

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(model) {
    setEditing(model);
    setModalOpen(true);
  }

  return (
    <div className="flex flex-col gap-4">
      {modelsQuery.isError && (
        <Alert tone="error" title="Models could not load">
          <p className="m-0">{modelsQuery.error.message}</p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-3"
            onClick={() => modelsQuery.refetch()}
          >
            Try again
          </Button>
        </Alert>
      )}

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-secondary px-4 py-3.5">
          <div>
            <h2 className="m-0 text-[14.5px] font-semibold text-text">Models</h2>
            <p className="m-0 mt-0.5 text-[11px] text-text-tertiary">
              {models.length} model{models.length === 1 ? '' : 's'} stored · generation uses the
              default for each type.
            </p>
          </div>
          <Button type="button" size="sm" onClick={openAdd}>
            <i aria-hidden="true" className="bx bx-plus text-[16px]" />
            Add model
          </Button>
        </div>

        {!modelsQuery.isLoading && models.length === 0 ? (
          <EmptyState
            icon="bx-cube"
            title="No AI models yet"
            description="Add at least one text model to write articles. The first model of each type becomes its default."
            action={
              <Button type="button" size="sm" onClick={openAdd}>
                <i aria-hidden="true" className="bx bx-plus text-[16px]" />
                Add the first model
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="border-b border-border-secondary bg-surface-secondary/50">
                  <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                    Model
                  </th>
                  <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                    Price
                  </th>
                  <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                    Status
                  </th>
                  <th className="px-3 py-2.5 pr-4 text-right text-[10px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {modelGroups.map(({ type, models: groupModels }) => (
                  <Fragment key={type.value}>
                    <tr key={`${type.value}-group`} className="border-b border-border-secondary bg-surface-secondary/40">
                      <th
                        colSpan={4}
                        scope="rowgroup"
                        className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-secondary"
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <i aria-hidden="true" className={`bx ${type.icon} text-[14px]`} />
                          {type.label}
                          <span className="font-normal normal-case tracking-normal text-text-tertiary">
                            · {groupModels.length} model{groupModels.length === 1 ? '' : 's'}
                          </span>
                        </span>
                      </th>
                    </tr>
                    {groupModels.map((model) => (
                      <tr
                        key={model.id}
                        className="border-b border-border-secondary/70 transition last:border-0 hover:bg-surface-secondary/40"
                      >
                        <td className="max-w-[280px] px-4 py-3">
                          <p className="m-0 truncate text-[12.5px] font-semibold text-text">
                            {model.name}
                          </p>
                          <p
                            className="m-0 mt-0.5 truncate font-mono text-[10.5px] text-text-tertiary"
                            title={model.modelId}
                          >
                            {model.modelId}
                          </p>
                        </td>
                        <td className="max-w-[200px] px-3 py-3 text-[11px] text-text-secondary">
                          {modelPriceLabel(model)}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {model.isDefault && <Badge tone="success">Default</Badge>}
                            {!model.enabled && <Badge tone="neutral">Disabled</Badge>}
                            {model.enabled && !model.isDefault && (
                              <span className="text-[11px] text-text-tertiary">Enabled</span>
                            )}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 pr-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {!model.isDefault && model.enabled && (
                              <Button
                                type="button"
                                variant="soft"
                                size="sm"
                                disabled={defaultMutation.isPending}
                                onClick={() => defaultMutation.mutate(model.id)}
                              >
                                <i aria-hidden="true" className="bx bx-check text-[15px]" />
                                Make default
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => openEdit(model)}
                            >
                              <i aria-hidden="true" className="bx bx-edit text-[15px]" />
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDeleteError('');
                                setDeleting(model);
                              }}
                            >
                              <i aria-hidden="true" className="bx bx-trash text-[15px]" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <AiModelModal
        open={modalOpen}
        model={editing}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSaved={refresh}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => {
          if (deleteMutation.isPending) return;
          setDeleting(null);
          setDeleteError('');
        }}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
        title="Delete this model?"
        description={
          deleting
            ? `${deleting.name} (${deleting.modelId}) will be removed. If it was the default, another enabled ${deleting.type} model takes over.`
            : ''
        }
        confirmLabel="Delete model"
        busy={deleteMutation.isPending}
        error={deleteError}
      />
    </div>
  );
}

export default function Settings() {
  return (
    <div className="animate-rise">
      <PageHeader
        title="Settings"
        description="Manage models and other settings for the admin console."
      />
      <section className="mt-5">
        <div className="mb-3">
          <h2 className="m-0 text-[14px] font-semibold text-text">Models</h2>
          <p className="m-0 mt-1 text-[11.5px] text-text-tertiary">
            Manage available AI models and choose one default per model type.
          </p>
        </div>
        <AiModelsSection />
      </section>
    </div>
  );
}
