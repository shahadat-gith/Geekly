import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../api/index.js';
import { ActivityChart } from '../components/dashboard/ActivityChart.jsx';
import { ContentMix } from '../components/dashboard/ContentMix.jsx';
import { RecentArticles } from '../components/dashboard/RecentArticles.jsx';
import { StatCard } from '../components/dashboard/StatCard.jsx';
import { TopicCoverage } from '../components/dashboard/TopicCoverage.jsx';
import { Alert } from '../components/ui/Alert.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { IconButton } from '../components/ui/IconButton.jsx';
import { PageHeader } from '../components/ui/PageHeader.jsx';

function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-9 w-64 rounded-lg bg-surface-tertiary" />
      <div className="mt-2 h-4 w-96 max-w-full rounded bg-surface-tertiary/70" />
      <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-panel bg-border-secondary sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className={`h-[132px] bg-surface p-5 ${
              index === 4 ? 'col-span-2 sm:col-span-2 lg:col-span-1' : ''
            }`}
          >
            <div className="h-3 w-20 rounded bg-surface-tertiary" />
            <div className="mt-5 h-7 w-24 rounded bg-surface-tertiary" />
            <div className="mt-4 h-3 w-28 rounded bg-surface-tertiary/70" />
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-12">
        <div className="h-[330px] rounded-panel bg-surface p-6 shadow-card lg:col-span-7">
          <div className="h-4 w-36 rounded bg-surface-tertiary" />
          <div className="mt-6 h-[220px] rounded bg-surface-tertiary/60" />
        </div>
        <div className="h-[330px] rounded-panel bg-surface p-6 shadow-card lg:col-span-5">
          <div className="h-4 w-32 rounded bg-surface-tertiary" />
          <div className="mt-6 space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-9 rounded bg-surface-tertiary/60" />
            ))}
          </div>
        </div>
        <div className="h-[300px] rounded-panel bg-surface p-6 shadow-card lg:col-span-7">
          <div className="h-4 w-36 rounded bg-surface-tertiary" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-9 rounded bg-surface-tertiary/60" />
            ))}
          </div>
        </div>
        <div className="h-[300px] rounded-panel bg-surface p-6 shadow-card lg:col-span-5">
          <div className="h-4 w-28 rounded bg-surface-tertiary" />
          <div className="mt-6 space-y-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-8 rounded bg-surface-tertiary/60" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: dashboardApi.getDashboardApi,
  });

  if (isLoading) return <DashboardSkeleton />;

  if (isError) {
    return (
      <div>
        <PageHeader
          title="Content dashboard"
          description="A live view of the Noob Engineer content library."
        />
        <Alert tone="error" title="Dashboard could not load" className="mt-6">
          <p className="m-0">{error.message}</p>
          <Button variant="secondary" size="sm" className="mt-3" onClick={() => refetch()}>
            <i aria-hidden="true" className="bx bx-refresh text-[16px]" />
            Try again
          </Button>
        </Alert>
      </div>
    );
  }

  const { stats, activity, topTopics, statusBreakdown, recentArticles } = data;
  const publishedDelta =
    stats.publishedPrevMonth > 0
      ? Math.round(
          ((stats.publishedThisMonth - stats.publishedPrevMonth) / stats.publishedPrevMonth) * 100,
        )
      : null;

  const statCards = [
    {
      label: 'Total articles',
      value: stats.totalArticles,
      icon: 'bx-file-blank',
      note: `${stats.newArticlesThisMonth} new this month`,
    },
    {
      label: 'Published',
      value: stats.publishedArticles,
      icon: 'bx-check-circle',
      note: `${stats.publishedThisMonth} published this month`,
      delta: publishedDelta,
    },
    {
      label: 'Drafts',
      value: stats.draftArticles,
      icon: 'bx-edit-alt',
      note: 'Work in progress',
    },
    {
      label: 'Topics',
      value: stats.totalTopics,
      icon: 'bx-layer',
      note: `${stats.newTopicsThisMonth} added this month`,
    },
    {
      label: 'Total views',
      value: stats.totalViews,
      icon: 'bx-show',
      note: 'Across all articles',
    },
  ];

  return (
    <div className="animate-rise">
      <PageHeader
        title="Content dashboard"
        description="Track the library, keep topics organised and publish the next article."
        actions={
          <>
            <IconButton
              label="Refresh dashboard"
              variant="default"
              onClick={() => refetch()}
              disabled={isFetching}
              className="border border-border bg-surface"
            >
              <i
                aria-hidden="true"
                className={`bx bx-refresh text-[19px] ${isFetching ? 'animate-admin-spin' : ''}`}
              />
            </IconButton>
            <Button as={Link} to="/articles" variant="secondary" size="sm">
              <i aria-hidden="true" className="bx bx-list-ul text-[16px]" />
              All articles
            </Button>
          </>
        }
      />

      <Card className="mt-6 overflow-hidden">
        <div className="grid grid-cols-2 gap-px bg-border-secondary sm:grid-cols-3 lg:grid-cols-5">
          {statCards.map((stat, index) => (
            <StatCard
              key={stat.label}
              {...stat}
              className={index === statCards.length - 1 ? 'col-span-2 sm:col-span-2 lg:col-span-1' : ''}
            />
          ))}
        </div>
      </Card>

      <div className="mt-5 grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ActivityChart activity={activity} />
        </div>
        <div className="lg:col-span-5">
          <TopicCoverage topics={topTopics} publishedThisMonth={stats.publishedThisMonth} />
        </div>
        <div className="lg:col-span-7">
          <RecentArticles articles={recentArticles} />
        </div>
        <div className="lg:col-span-5">
          <ContentMix breakdown={statusBreakdown} total={stats.totalArticles} />
        </div>
      </div>
    </div>
  );
}
