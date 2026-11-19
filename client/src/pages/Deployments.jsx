import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaArrowUpRightFromSquare, FaGlobe, FaPlus } from 'react-icons/fa6';
import { listProjectsApi } from '../api/deployments.js';
import { Alert } from '../components/ui/Alert.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { StatusChip } from '../components/resume/ResumeStatus.jsx';
import { siteHost, siteUrl } from '../components/deployments/deploymentMeta.js';

export default function Deployments() {
  const { data: projects = [], isPending, error } = useQuery({
    queryKey: ['deployments', 'projects'],
    queryFn: listProjectsApi,
  });

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <header className="flex flex-col justify-between gap-4 xs:flex-row xs:items-end">
        <div>
          <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#527C42]">
            Static hosting
          </p>
          <h1 className="m-0 mt-2 font-heading text-[28px] font-semibold tracking-[-0.035em] text-text sm:text-[36px]">
            My sites
          </h1>
          <p className="m-0 mt-2 max-w-xl text-[13.5px] leading-relaxed text-text-secondary">
            Publish a built website folder to its own geekly.in address and roll back to earlier versions at any time.
          </p>
        </div>

        <Button as={Link} to="/deployments/new" size="sm" className="w-full xs:w-auto">
          <FaPlus aria-hidden="true" className="text-[12px]" />
          New site
        </Button>
      </header>

      <div className="mt-8">
        {error ? (
          <Alert tone="error">Could not load your sites. Try again.</Alert>
        ) : isPending ? (
          <div className="flex flex-col gap-3" aria-label="Loading sites">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="h-[76px] animate-pulse rounded-card border border-border bg-surface shadow-card"
              />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <Card className="flex flex-col items-center px-6 py-10 text-center sm:py-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft">
              <FaGlobe aria-hidden="true" className="text-[19px] text-[#527C42]" />
            </div>
            <h2 className="m-0 mt-4 text-[15px] font-semibold text-text">No sites yet</h2>
            <p className="mb-0 mt-1.5 max-w-sm text-[13px] leading-relaxed text-text-secondary">
              Upload a folder that contains an index.html file to publish your first site.
            </p>
            <Button as={Link} to="/deployments/new" size="sm" className="mt-5">
              Publish your first site
            </Button>
          </Card>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {projects.map((project) => {
              const isLive = Boolean(project.currentDeploymentId);
              return (
                <li key={project.id}>
                  <Card className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <Link
                      to={`/deployments/${project.id}`}
                      className="group flex min-w-0 items-center gap-3 rounded-field focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-tertiary transition-colors group-hover:bg-brand-soft">
                        <FaGlobe aria-hidden="true" className="text-[15px] text-text-secondary group-hover:text-[#527C42]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2.5">
                          <p className="m-0 truncate text-[14.5px] font-semibold text-text">{project.name}</p>
                          <StatusChip
                            status={isLive ? 'COMPLETED' : 'QUEUED'}
                            label={isLive ? 'Live' : 'Not published'}
                          />
                        </div>
                        <p className="m-0 mt-1 truncate text-[12.5px] text-text-tertiary">{siteHost(project.slug)}</p>
                      </div>
                      <FaArrowRight
                        aria-hidden="true"
                        className="ml-1 hidden shrink-0 text-[11px] text-text-tertiary transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#527C42] sm:block"
                      />
                    </Link>

                    {isLive && (
                      <Button
                        as="a"
                        href={siteUrl(project.slug)}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="secondary"
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        Open site
                        <FaArrowUpRightFromSquare aria-hidden="true" className="text-[11px]" />
                      </Button>
                    )}
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
