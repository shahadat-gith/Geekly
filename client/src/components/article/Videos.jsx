
import { useState } from 'react';
import { FaPlay, FaVideo } from 'react-icons/fa6';

function youtubeId(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    let id = null;

    if (host === 'youtu.be') {
      id = parsed.pathname.split('/').filter(Boolean)[0] || null;
    } else if (
      host === 'youtube.com' ||
      host === 'm.youtube.com' ||
      host.endsWith('.youtube.com')
    ) {
      if (parsed.pathname === '/watch') {
        id = parsed.searchParams.get('v');
      } else {
        id =
          parsed.pathname.match(
            /^\/(?:embed|shorts|live)\/([^/?#]+)/
          )?.[1] || null;
      }
    }

    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

function ReferenceVideo({ url, index }) {
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const id = youtubeId(url);

  return (
    <li>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Watch reference video ${index + 1} in a new tab`}
        className="
          group block overflow-hidden rounded-xl border border-border
          bg-surface transition-all duration-200
          hover:border-brand-strong/60 hover:shadow-card
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-ring focus-visible:ring-offset-2
        "
      >
        <span className="relative block aspect-video overflow-hidden bg-ink">
          {id && !thumbnailFailed ? (
            <img
              src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
              alt=""
              loading="lazy"
              decoding="async"
              onError={() => setThumbnailFailed(true)}
              className="
                h-full w-full object-cover
                transition-transform duration-300
                group-hover:scale-[1.04]
              "
            />
          ) : (
            <span className="flex h-full w-full flex-col items-center justify-center gap-2 bg-surface-tertiary text-text-tertiary">
              <FaVideo aria-hidden="true" className="text-xl" />
              <span className="text-[10px] font-medium tracking-wide">
                VIDEO REFERENCE
              </span>
            </span>
          )}

          <span className="absolute inset-0 flex items-center justify-center bg-black/5 transition-colors group-hover:bg-black/15">
            <span
              className="
                flex size-10 items-center justify-center rounded-full
                border border-white/30 bg-black/65 text-white
                shadow-lg backdrop-blur-sm
                transition-transform duration-200
                group-hover:scale-110
              "
            >
              <FaPlay aria-hidden="true" className="ml-0.5 text-[11px]" />
            </span>
          </span>
        </span>
      </a>
    </li>
  );
}

export default function Videos({ videos = [] }) {
  if (videos.length === 0) return null;

  return (
    <section
      aria-label="Video references"
      className="
        rounded-card border border-border bg-surface
        p-4 shadow-card
      "
    >
      <div className="flex items-start justify-between gap-3 border-b border-border-secondary pb-3">
        <div>
          <h2 className="m-0 text-[13.5px] font-semibold tracking-[-0.01em] text-text">
            Video references
          </h2>
          <p className="m-0 mt-1 text-[11.5px] text-text-tertiary">
            Watch and explore further
          </p>
        </div>

        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-warning">
          <FaVideo aria-hidden="true" className="text-[13px]" />
        </span>
      </div>

      <ul className="m-0 mt-4 list-none space-y-3 p-0">
        {videos.map((url, index) => (
          <ReferenceVideo
            key={`${url}-${index}`}
            url={url}
            index={index}
          />
        ))}
      </ul>

      <p className="mb-0 mt-3 text-center text-[10.5px] text-text-tertiary">
        Opens in a new tab
      </p>
    </section>
  );
}
