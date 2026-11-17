import { useState } from 'react';
import { FaPlay, FaVideo } from 'react-icons/fa6';

// Reference videos are stored as plain URLs, so a YouTube link can show its
// own thumbnail. Other hosts fall back to a neutral play tile.
function youtubeId(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    let id = null;
    if (host === 'youtu.be') {
      id = parsed.pathname.split('/').filter(Boolean)[0] || null;
    } else if (host === 'youtube.com' || host === 'm.youtube.com' || host.endsWith('.youtube.com')) {
      if (parsed.pathname === '/watch') id = parsed.searchParams.get('v');
      else id = parsed.pathname.match(/^\/(?:embed|shorts|live)\/([^/?#]+)/)?.[1] || null;
    }
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

function ReferenceVideo({ url }) {
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const id = youtubeId(url);

  return (
    <li>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Watch reference video in a new tab"
        className="group block overflow-hidden rounded-button border border-border bg-surface transition hover:border-brand/40"
      >
        <span className="relative block aspect-video w-full overflow-hidden bg-ink">
          {id && !thumbnailFailed ? (
            <img
              src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
              alt=""
              loading="lazy"
              onError={() => setThumbnailFailed(true)}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-ink-secondary text-ink-muted">
              <FaVideo aria-hidden="true" className="text-[18px]" />
            </span>
          )}
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/70 text-white backdrop-blur-sm transition group-hover:scale-110">
              <FaPlay aria-hidden="true" className="ml-0.5 text-[11px]" />
            </span>
          </span>
        </span>
      </a>
    </li>
  );
}

// Right-hand card. Nothing is rendered when the article has no reference videos.
export default function Videos({ videos = [] }) {
  if (videos.length === 0) return null;

  return (
    <section
      aria-label="Videos you may watch"
      className="rounded-card border border-border bg-surface p-4"
    >
      <div className="flex items-center gap-2">
        <h2 className="m-0 text-[13px] font-semibold tracking-[-0.01em] text-text">
          Videos you may watch
        </h2>
      </div>

      <ul className="m-0 mt-3 list-none space-y-2.5 p-0">
        {videos.map((url, index) => (
          <ReferenceVideo key={`${url}-${index}`} url={url} />
        ))}
      </ul>
    </section>
  );
}
