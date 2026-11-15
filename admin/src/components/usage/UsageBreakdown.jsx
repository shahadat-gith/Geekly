import { Card } from '../ui/Card.jsx';
import { formatNumber } from '../../utils/format.js';
import { featureLabel, formatCost, formatDuration } from '../../utils/aiUsage.js';

export function FeatureBreakdown({ features = [] }) {
  const totalRequests = features.reduce((sum, feature) => sum + feature.requests, 0);

  return (
    <Card className="flex flex-col p-5 sm:p-6">
      <div>
        <h2 className="m-0 text-[14.5px] font-semibold text-text">Usage by feature</h2>
        <p className="m-0 mt-1 text-[11.5px] text-text-tertiary">Where the AI calls come from</p>
      </div>

      {features.length === 0 ? (
        <p className="m-0 mt-6 text-[12px] text-text-tertiary">No usage recorded yet.</p>
      ) : (
        <div className="mt-5 space-y-4">
          {features.map((feature) => {
            const share = totalRequests ? Math.round((feature.requests / totalRequests) * 100) : 0;

            return (
              <div key={feature.feature}>
                <div className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-[12px] font-semibold text-text">
                    {featureLabel(feature.feature)}
                  </span>
                  <span className="shrink-0 text-[11px] font-medium text-text-tertiary">
                    {formatNumber(feature.requests)} · {share}%
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-tertiary/60">
                  <div
                    className="h-full rounded-full bg-brand transition-all duration-500"
                    style={{ width: `${Math.max(share, feature.requests > 0 ? 3 : 0)}%` }}
                  />
                </div>
                <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-3 text-[10.5px] text-text-tertiary">
                  <span>{formatNumber(feature.totalTokens)} tokens</span>
                  <span>
                    {formatCost(feature.cost)} · {formatDuration(feature.avgDurationMs)} avg
                    {feature.errors > 0 ? ` · ${feature.errors} failed` : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

export function ModelBreakdown({ models = [] }) {
  return (
    <Card className="flex flex-col p-5 sm:p-6">
      <div>
        <h2 className="m-0 text-[14.5px] font-semibold text-text">Usage by model</h2>
        <p className="m-0 mt-1 text-[11.5px] text-text-tertiary">Models called through OpenRouter</p>
      </div>

      {models.length === 0 ? (
        <p className="m-0 mt-6 text-[12px] text-text-tertiary">No usage recorded yet.</p>
      ) : (
        <div className="mt-4 divide-y divide-border-secondary/70">
          {models.map((model) => (
            <div key={model.model} className="flex items-center gap-3 py-3 first:pt-1 last:pb-0">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-button bg-surface-secondary text-text-tertiary">
                <i aria-hidden="true" className="bx bx-chip text-[16px]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="m-0 truncate text-[11.5px] font-semibold text-text" title={model.model}>
                  {model.model}
                </p>
                <p className="m-0 mt-0.5 text-[10.5px] text-text-tertiary">
                  {formatNumber(model.requests)} calls · {formatNumber(model.totalTokens)} tokens
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="m-0 text-[11.5px] font-semibold text-text-secondary">
                  {formatCost(model.cost)}
                </p>
                {model.errors > 0 && (
                  <p className="m-0 mt-0.5 text-[10px] font-semibold text-error">
                    {model.errors} failed
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
