import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCircleCheck, FaCircleXmark, FaFolderOpen } from 'react-icons/fa6';
import {
  checkSlugApi,
  createDeploymentApi,
  createProjectApi,
  finalizeDeploymentApi,
  uploadDeploymentFileApi,
} from '../api/deployments.js';
import { Alert } from '../components/ui/Alert.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Input } from '../components/ui/Input.jsx';
import { siteHost } from '../components/deployments/deploymentMeta.js';

const CONCURRENCY = 4;

// Relative path from the folder picker: strip the selected folder's own name.
const relativePathOf = (file) => file.webkitRelativePath || file.name;

function errorText(error, fallback) {
  return error?.response?.data?.message || fallback;
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
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        to="/deployments"
        className="inline-flex items-center gap-2 text-[13px] font-medium text-text-secondary transition-colors hover:text-text"
      >
        <FaArrowLeft aria-hidden="true" className="text-[11px]" />
        My sites
      </Link>

      <header className="mt-5">
        <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#527C42]">
          Static hosting
        </p>
        <h1 className="m-0 mt-2 font-heading text-[28px] font-semibold tracking-[-0.035em] text-text sm:text-[32px]">
          New site
        </h1>
        <p className="m-0 mt-2 text-[13.5px] leading-relaxed text-text-secondary">
          Pick a name and address, then choose the built folder of your website.
        </p>
      </header>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-6">
        <Card className="flex flex-col gap-6 p-5 sm:p-6">
          <Input
            label="Site name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            placeholder="My portfolio"
            disabled={busy}
          />

          <div className="flex flex-col gap-2">
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
            <p className="m-0 flex items-center gap-2 text-[12.5px]" role="status">
              {slugState.status === 'checking' && <span className="text-text-tertiary">Checking availability…</span>}
              {slugState.status === 'available' && (
                <span className="inline-flex items-center gap-1.5 text-success">
                  <FaCircleCheck aria-hidden="true" /> {siteHost(normalizedSlug)} is available
                </span>
              )}
              {(slugState.status === 'taken' || slugState.status === 'error') && (
                <span className="inline-flex items-center gap-1.5 text-error">
                  <FaCircleXmark aria-hidden="true" /> Not available
                </span>
              )}
            </p>
          </div>
        </Card>

        <Card className="flex flex-col gap-4 p-5 sm:p-6">
          <div>
            <h2 className="m-0 text-[15px] font-semibold text-text">Site folder</h2>
            <p className="m-0 mt-1 text-[13px] leading-relaxed text-text-secondary">
              Choose the folder your build produced. It must contain an index.html at its top level.
            </p>
          </div>

          {folderSupported ? (
            <label className="flex cursor-pointer flex-col items-center gap-3 rounded-card border border-dashed border-border-focus/60 bg-surface-secondary/60 px-6 py-8 text-center transition-colors hover:bg-brand-soft/40 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-brand-soft has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft">
                <FaFolderOpen aria-hidden="true" className="text-[17px] text-[#527C42]" />
              </div>
              <span className="text-[14px] font-medium text-text">
                {files.length > 0 ? 'Choose a different folder' : 'Choose a folder'}
              </span>
              <span className="text-[12.5px] text-text-tertiary">
                {files.length > 0 ? `${files.length} file(s) selected` : 'No folder selected yet'}
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

          {busy && (
            <div className="flex flex-col gap-2" aria-live="polite">
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-tertiary">
                <div
                  className="h-2 rounded-full bg-brand transition-[width] duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="m-0 text-[12.5px] text-text-tertiary">Uploading… {progress}%</p>
            </div>
          )}
        </Card>

        {error && <Alert tone="error">{error}</Alert>}

        <div className="flex flex-col-reverse gap-3 xs:flex-row xs:justify-end">
          <Button as={Link} to="/deployments" variant="secondary" className="w-full xs:w-auto">
            Cancel
          </Button>
          <Button type="submit" disabled={!canSubmit} className="w-full xs:w-auto">
            {busy ? 'Publishing…' : 'Publish site'}
          </Button>
        </div>
      </form>
    </div>
  );
}
