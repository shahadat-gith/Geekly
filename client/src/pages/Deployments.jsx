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
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <PageHeader
        eyebrow="Static hosting"
        title="My sites"
        description="Publish a built website folder to its own geekly.in address and roll back to earlier versions at any time."
        action={
          <Button as={Link} to="/deployments/new" size="sm">
            <FaPlus aria-hidden="true" className="text-[12px]" />
            New site
          </Button>
        }
      />

      <div className="mt-7">
        {error ? (
          <Alert tone="error">Could not load your sites. Try again.</Alert>
        ) : isPending ? (
          <div className="flex flex-col gap-3" aria-label="Loading sites" role="status">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-[82px] rounded-card" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            Icon={FaGlobe}
            title="No sites yet"
            message="Upload a folder that contains an index.html file to publish your first site."
            action={
              <Button as={Link} to="/deployments/new" size="sm">
                Publish your first site
              </Button>
            }
          />
        ) : (
          <>
            {/* List summary */}
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
              <p className="m-0 font-mono text-[10.5px] uppercase tracking-[0.1em] text-text-tertiary">
                {projects.length} {projects.length === 1 ? 'site' : 'sites'} · {liveCount} live
              </p>

              <Link
                to="/deployments/new"
                className="text-[12.5px] font-medium text-brand-strong transition-colors hover:text-brand-strong-hover focus-visible:outline-none"
              >
                Publish another
              </Link>
            </div>

            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {projects.map((project) => {
                const isLive = Boolean(project.currentDeploymentId);

                return (
                  <li key={project.id}>
                    <div className="group flex min-w-0 flex-col gap-4 rounded-card border border-border bg-surface px-4 py-4 shadow-card transition-[border-color,box-shadow] hover:border-brand-light hover:shadow-card-hover sm:flex-row sm:items-center sm:justify-between sm:px-5">
                      <Link
                        to={`/deployments/${project.id}`}
                        className="flex min-w-0 items-center gap-3.5 rounded-field focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-tertiary transition-colors group-hover:bg-brand-soft">
                          <FaGlobe
                            aria-hidden="true"
                            className="text-[15px] text-text-secondary group-hover:text-brand-strong"
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <p className="m-0 truncate text-[14.5px] font-semibold text-text">
                              {project.name}
                            </p>

                            <Badge tone={isLive ? 'success' : 'neutral'} dot={isLive}>
                              {isLive ? 'Live' : 'Not published'}
                            </Badge>
                          </div>

                          <p className="m-0 mt-1 truncate font-mono text-[11.5px] text-text-tertiary">
                            {siteHost(project.slug)}
                          </p>
                        </div>

                        <FaArrowRight
                          aria-hidden="true"
                          className="ml-1 hidden shrink-0 text-[11px] text-text-tertiary transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-brand-strong sm:block"
                        />
                      </Link>

                      <div className="flex shrink-0 items-center gap-2">
                        {isLive && (
                          <Button
                            as="a"
                            href={siteUrl(project.slug)}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="secondary"
                            size="sm"
                            className="flex-1 sm:flex-none"
                          >
                            Open site
                            <FaArrowUpRightFromSquare aria-hidden="true" className="text-[11px]" />
                          </Button>
                        )}

                        <Button
                          as={Link}
                          to={`/deployments/${project.id}`}
                          variant="ghost"
                          size="sm"
                          className="flex-1 sm:flex-none"
                        >
                          Manage
                        </Button>
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
