import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaArrowUpRightFromSquare, FaGlobe, FaPlus } from 'react-icons/fa6';
import { listProjectsApi } from '../api/deployments.js';
import { Alert } from '../components/ui/Alert.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import { siteHost, siteUrl } from '../components/deployments/deploymentMeta.js';

export default function Deployments() {
  const { data: projects = [], isPending, error } = useQuery({
    queryKey: ['deployments', 'projects'],
    queryFn: listProjectsApi,
  });

  const liveCount = projects.filter((project) => project.currentDeploymentId).length;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <PageHeader
        eyebrow="Sites"
        title="My sites"
        description="A built folder gets its own geekly.in address, and every version stays available"
        action={
          <Button as={Link} to="/deployments/new" size="sm">
            <FaPlus aria-hidden="true" className="text-[12px]" />
            New site
          </Button>
        }
      />

      <div className="mt-10">
        {error ? (
          <Alert tone="error">Could not load your sites. Try again.</Alert>
        ) : isPending ? (
          <div className="flex flex-col" aria-label="Loading sites" role="status">
            {[1, 2, 3].map((item) => (
              <div key={item} className="border-b border-border-secondary py-5">
                <Skeleton className="h-10 rounded-sm" />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            Icon={FaGlobe}
            title="No sites yet"
            message="Upload a folder that contains an index.html file to publish your first site"
            action={
              <Button as={Link} to="/deployments/new" size="sm">
                Publish your first site
              </Button>
            }
          />
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
              <p className="m-0 font-mono text-[11px] tabular-nums text-text-secondary">
                {projects.length} {projects.length === 1 ? 'site' : 'sites'} · {liveCount} live
              </p>

              <Link
                to="/deployments/new"
                className="text-[12.5px] font-medium text-brand-strong transition-colors hover:text-brand-strong-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Publish another
              </Link>
            </div>

            <ul className="m-0 flex list-none flex-col p-0">
              {projects.map((project, index) => {
                const isLive = Boolean(project.currentDeploymentId);

                return (
                  <li key={project.id} className="border-b border-border-secondary">
                    <div className="group flex min-w-0 flex-col gap-4 py-5 sm:grid sm:grid-cols-[28px_minmax(0,1fr)_auto] sm:items-center sm:gap-5">
                      <span className="hidden font-mono text-[10px] tabular-nums text-text-tertiary sm:block">
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <Link
                        to={`/deployments/${project.id}`}
                        className="min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
                          <p className="m-0 truncate text-[15px] font-medium text-text transition-colors group-hover:text-brand-strong">
                            {project.name}
                          </p>

                          <Badge tone={isLive ? 'success' : 'neutral'} dot={isLive}>
                            {isLive ? 'Live' : 'Not published'}
                          </Badge>
                        </div>

                        <p className="m-0 mt-1 truncate font-mono text-[11.5px] text-text-tertiary">
                          {siteHost(project.slug)}
                        </p>
                      </Link>

                      <div className="flex shrink-0 items-center gap-5 sm:justify-end">
                        {isLive && (
                          <a
                            href={siteUrl(project.slug)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-text-secondary transition-colors hover:text-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            Open site
                            <FaArrowUpRightFromSquare aria-hidden="true" className="text-[10px]" />
                          </a>
                        )}

                        <Link
                          to={`/deployments/${project.id}`}
                          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-text transition-colors hover:text-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Manage
                          <FaArrowRight
                            aria-hidden="true"
                            className="text-[10px] text-text-tertiary transition-colors group-hover:text-brand-strong"
                          />
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
