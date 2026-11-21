import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaCircleCheck,
  FaCircleXmark,
  FaFolderOpen,
  FaGlobe,
  FaSpinner,
} from 'react-icons/fa6';
import {
  checkSlugApi,
  createDeploymentApi,
  createProjectApi,
  finalizeDeploymentApi,
  uploadDeploymentFileApi,
} from '../api/deployments.js';
import { Alert } from '../components/ui/Alert.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { siteHost } from '../components/deployments/deploymentMeta.js';

const CONCURRENCY = 4;

// Relative path from the folder picker: strip the selected folder's own name.
const relativePathOf = (file) => file.webkitRelativePath || file.name;

function errorText(error, fallback) {
  return error?.response?.data?.message || fallback;
}

function SectionCard({ step, title, description, children }) {
  return (
    <section className="rounded-card border border-border bg-surface p-5 shadow-card sm:p-6">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border bg-surface-tertiary font-mono text-[11px] font-semibold text-text-secondary"
        >
          {step}
        </span>

        <div className="min-w-0">
          <h2 className="m-0 text-[14.5px] font-semibold tracking-[-0.01em] text-text">
            {title}
          </h2>
          <p className="m-0 mt-1 text-[12.5px] leading-relaxed text-text-secondary">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-5">{children}</div>
    </section>
  );
}

function SlugStatus({ state, host }) {
  if (state.status === 'idle') return null;

  return (
    <p className="m-0 flex items-center gap-2 text-[12.5px]" role="status" aria-live="polite">
      {state.status === 'checking' && (
        <>
          <FaSpinner aria-hidden="true" className="animate-spin text-[11px] text-text-tertiary" />
          <span className="text-text-tertiary">Checking availability…</span>
        </>
      )}

      {state.status === 'available' && (
        <>
          <FaCircleCheck aria-hidden="true" className="text-[11px] text-success" />
          <span className="text-success">{host} is available</span>
        </>
      )}

      {(state.status === 'taken' || state.status === 'error') && (
        <>
          <FaCircleXmark aria-hidden="true" className="text-[11px] text-error" />
          <span className="text-error">Not available</span>
        </>
      )}
    </p>
  );
}

export default function DeploymentNew() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  // Result is tagged with the slug it was fetched for, so stale answers never apply.
  const [slugResult, setSlugResult] = useState({ forValue: '', status: 'idle', reason: null });
  const normalizedSlug = slug.trim().toLowerCase();
  const slugState = !normalizedSlug
    ? { status: 'idle', reason: null }
    : slugResult.forValue === normalizedSlug
      ? slugResult
      : { status: 'checking', reason: null };
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const folderSupported = typeof document !== 'undefined' && 'webkitdirectory' in document.createElement('input');
  const slugRequest = useRef(0);

  // Debounced availability check. Responses for older input are ignored.
  useEffect(() => {
    const value = normalizedSlug;
    if (!value) return undefined;
    const requestId = ++slugRequest.current;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const result = await checkSlugApi(value, { signal: controller.signal });
        if (requestId !== slugRequest.current) return;
        setSlugResult({
          forValue: value,
          status: result.available ? 'available' : 'taken',
          reason: result.reason,
        });
      } catch (err) {
        if (controller.signal.aborted || requestId !== slugRequest.current) return;
        setSlugResult({
          forValue: value,
          status: 'error',
          reason: errorText(err, 'Could not check this address.'),
        });
      }
    }, 400);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [normalizedSlug]);

  function onPickFolder(event) {
    const picked = Array.from(event.target.files || []);
    setError(null);
    setFiles(picked);
  }

  async function uploadAll(deploymentId, picked) {
    let next = 0;
    let done = 0;
    const total = picked.length;

    async function worker() {
      while (next < total) {
        const file = picked[next];
        next += 1;
        const path = relativePathOf(file);
        await uploadDeploymentFileApi(deploymentId, { file, path });
        done += 1;
        setProgress(Math.round((done / total) * 100));
      }
    }

    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, total) }, worker));
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (busy) return;
    setError(null);

    const cleanName = name.trim();
    if (!cleanName) return setError('Give the site a name.');
    if (slugState.status !== 'available') return setError('Choose an available address first.');
    if (!files.length) return setError('Choose a folder that contains index.html.');

    setBusy(true);
    setProgress(0);
    try {
      const project = await createProjectApi({ name: cleanName, slug: normalizedSlug });
      const manifest = files.map((file) => ({ path: relativePathOf(file), size: file.size }));
      const deployment = await createDeploymentApi(project.id, manifest);
      await uploadAll(deployment.id, files);
      await finalizeDeploymentApi(deployment.id);
      navigate(`/deployments/${project.id}`);
    } catch (err) {
      setError(errorText(err, 'Upload failed. Check the folder and try again.'));
    } finally {
      setBusy(false);
    }
  }

  const canSubmit = !busy && slugState.status === 'available' && files.length > 0;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <PageHeader
        eyebrow="Static hosting"
        title="New site"
        description="Pick a name and address, then choose the built folder of your website."
      />

      <form onSubmit={onSubmit} className="mt-7 flex flex-col gap-4">
        <SectionCard
          step="01"
          title="Name and address"
          description="The address becomes the public geekly.in hostname for this site."
        >
          <div className="flex flex-col gap-5">
            <Input
              label="Site name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              placeholder="My portfolio"
              disabled={busy}
            />

            <div className="flex flex-col gap-2.5">
              <Input
                label="Address"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                maxLength={63}
                placeholder="my-portfolio"
                disabled={busy}
                error={slugState.status === 'taken' || slugState.status === 'error' ? slugState.reason : undefined}
                hint={slugState.status === 'idle' ? 'Lowercase letters, numbers and hyphens.' : undefined}
              />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <SlugStatus state={slugState} host={siteHost(normalizedSlug || 'your-site')} />

                <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-[11px] text-text-tertiary">
                  <FaGlobe aria-hidden="true" className="text-[10px]" />
                  {siteHost(normalizedSlug || 'your-site')}
                </span>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          step="02"
          title="Site folder"
          description="Choose the folder your build produced. It must contain an index.html at its top level."
        >
          <div className="flex flex-col gap-4">
            {folderSupported ? (
              <label
                className={[
                  'flex cursor-pointer flex-col items-center gap-2.5 rounded-card border border-dashed px-6 py-8 text-center transition-colors',
                  'border-border bg-surface-secondary hover:border-brand-light',
                  busy ? 'cursor-not-allowed opacity-60' : '',
                  'has-[:focus-visible]:border-brand has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
                ].join(' ')}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-soft">
                  <FaFolderOpen aria-hidden="true" className="text-[17px] text-brand-strong" />
                </div>

                <span className="text-[13.5px] font-semibold text-text">
                  {files.length > 0 ? 'Choose a different folder' : 'Choose a folder'}
                </span>

                <span className="font-mono text-[11px] text-text-tertiary">
                  {files.length > 0 ? `${files.length} file(s) selected` : 'no folder selected'}
                </span>

                <input
                  type="file"
                  webkitdirectory=""
                  multiple
                  onChange={onPickFolder}
                  disabled={busy}
                  className="sr-only"
                />
              </label>
            ) : (
              <Alert tone="error">
                Folder upload is not supported in this browser. Use a recent Chrome, Edge, Firefox or Safari.
              </Alert>
            )}

            {files.length > 0 && !busy && (
              <p className="m-0 flex items-start gap-2 rounded-field border border-border bg-surface-secondary px-3.5 py-2.5 text-[12px] leading-relaxed text-text-secondary">
                <FaCircleCheck aria-hidden="true" className="mt-0.5 shrink-0 text-[11px] text-success" />
                Ready to publish. Every file in the folder will be uploaded and the newest version becomes live.
              </p>
            )}

            {busy && (
              <div className="flex flex-col gap-2" aria-live="polite">
                <div className="flex items-center justify-between gap-3 font-mono text-[11px] text-text-secondary">
                  <span>Uploading files…</span>
                  <span className="tabular-nums">{progress}%</span>
                </div>

                <div
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Upload progress"
                  className="h-1.5 w-full overflow-hidden rounded-full bg-surface-tertiary"
                >
                  <div
                    className="h-full rounded-full bg-brand transition-[width] duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {error && <Alert tone="error">{error}</Alert>}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="m-0 font-mono text-[11px] text-text-tertiary">
            first version goes live immediately
          </p>

          <div className="flex flex-col-reverse gap-3 xs:flex-row">
            <Button
              as={Link}
              to="/deployments"
              variant="secondary"
              className="w-full xs:w-auto"
              aria-disabled={busy || undefined}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={!canSubmit} loading={busy} className="w-full xs:w-auto">
              {busy ? 'Publishing…' : 'Publish site'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
