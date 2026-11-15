import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/', label: 'Dashboard', icon: 'bx-grid-alt', end: true },
  { to: '/topics', label: 'Topics', icon: 'bx-layer' },
  { to: '/articles', label: 'Articles', icon: 'bx-file-blank' },
  { to: '/images', label: 'Image studio', icon: 'bx-image-alt' },
  { to: '/usage', label: 'AI usage', icon: 'bx-bar-chart-alt-2' },
  { to: '/settings', label: 'Settings', icon: 'bx-cog' },
];

export function NavTabs() {
  return (
    <nav aria-label="Admin sections" className="shrink-0 border-b border-border-secondary">
      <div className="mx-auto flex w-full max-w-[1360px] items-center gap-1 overflow-x-auto px-5 py-3 sm:px-8 lg:px-12">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              [
                'inline-flex shrink-0 items-center gap-2 rounded-button px-3.5 py-2.5 text-[13px] font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft',
                isActive
                  ? 'bg-brand-soft text-brand'
                  : 'text-text-secondary hover:bg-surface-secondary hover:text-text',
              ].join(' ')
            }
          >
            <i aria-hidden="true" className={`bx ${tab.icon} text-[17px]`} />
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
