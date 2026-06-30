import React, { useEffect, useState } from 'react';
import { Card, Stack, Text, Flex, Spinner, Select } from '@sanity/ui';

function flagEmoji(code: string) {
  if (!code || code.length !== 2) return '🌐';
  return code
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(c.charCodeAt(0) + 127397))
    .join('');
}

type AnalyticsData = {
  since: string;
  until: string;
  days: number;
  totals: { pageviews: number; visitors: number } | null;
  topPages: Array<{ requestPath: string; visitors: number; pageviews: number }>;
  topCountries: Array<{ country: string; visitors: number; pageviews: number }>;
  deviceTypes: Array<{ deviceType: string; visitors: number; pageviews: number }>;
  topReferrers: Array<{ referrerHostname: string; visitors: number; pageviews: number }>;
  error?: string;
};

const PERIODS = [
  { label: 'Last 7 days', value: '7' },
  { label: 'Last 30 days', value: '30' },
  { label: 'Last 90 days', value: '90' },
];

const Divider = () => (
  <div style={{ borderTop: '1px solid var(--card-border-color, #e5e7eb)', margin: '4px 0' }} />
);

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <Text size={0} weight="semibold" style={{ letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.5 }}>
    {children}
  </Text>
);

const StatRow = ({
  label,
  value,
  sub,
  barPct,
  barColor,
}: {
  label: string;
  value: string | number;
  sub?: string;
  barPct?: number;
  barColor?: string;
}) => (
  <div style={{ paddingTop: 8, paddingBottom: 8 }}>
    <Flex justify="space-between" align="center">
      <Text size={2}>{label}</Text>
      <Flex gap={3} align="center">
        {sub && <Text size={1} muted>{sub}</Text>}
        <Text size={2} weight="semibold">{value}</Text>
      </Flex>
    </Flex>
    {barPct !== undefined && (
      <div style={{ marginTop: 6, height: 2, background: 'var(--card-border-color, #e5e7eb)', borderRadius: 9 }}>
        <div
          style={{
            height: '100%',
            width: `${Math.max(barPct, 2)}%`,
            background: barColor ?? '#3b82f6',
            borderRadius: 9,
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    )}
  </div>
);

export function VercelAnalyticsWidgetComponent() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    setLoading(true);
    setData(null);
    fetch(`/api/analytics?days=${period}&t=${Date.now()}`)
      .then((res) => res.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch((err) => { setData({ error: err.message } as any); setLoading(false); });
  }, [period]);

  const maxPageViews = data?.topPages?.[0]?.pageviews ?? 1;
  const maxCountryVisitors = data?.topCountries?.[0]?.visitors ?? 1;
  const totalDevices = data?.deviceTypes?.reduce((s, d) => s + d.visitors, 0) ?? 1;

  const sinceLabel = data?.since
    ? new Date(data.since).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return (
    <Card padding={5}>
      <Stack space={5}>

        {/* ── Header ── */}
        <Flex justify="space-between" align="flex-start">
          <Stack space={2}>
            <Text size={3} weight="bold">Analytics</Text>
            {sinceLabel && !data?.error && (
              <Text size={1} muted>Since {sinceLabel}</Text>
            )}
          </Stack>
          <Select
            value={period}
            onChange={(e) => setPeriod((e.target as HTMLSelectElement).value)}
            style={{ fontSize: 13, minWidth: 130 }}
          >
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </Select>
        </Flex>

        {loading ? (
          <Flex align="center" justify="center" padding={6}>
            <Spinner />
          </Flex>
        ) : data?.error ? (
          <Card padding={4} tone="critical" radius={2}>
            <Text size={1}>{data.error}</Text>
          </Card>
        ) : (
          <Stack space={5}>

            {/* ── Overview ── */}
            <Stack space={3}>
              <SectionHeading>Overview</SectionHeading>
              <Divider />
              <Flex gap={5}>
                <Stack space={1} flex={1}>
                  <Text size={1} muted>Page Views</Text>
                  <Text size={5} weight="bold">{data?.totals?.pageviews?.toLocaleString() ?? '—'}</Text>
                </Stack>
                <Stack space={1} flex={1}>
                  <Text size={1} muted>Unique Visitors</Text>
                  <Text size={5} weight="bold">{data?.totals?.visitors?.toLocaleString() ?? '—'}</Text>
                </Stack>
              </Flex>
            </Stack>

            {/* ── Top Pages ── */}
            {(data?.topPages ?? []).filter(p => p.requestPath !== 'Others').length > 0 && (
              <Stack space={3}>
                <SectionHeading>Top Pages</SectionHeading>
                <Divider />
                <Stack space={0}>
                  {(data?.topPages ?? [])
                    .filter((p) => p.requestPath !== 'Others')
                    .map((page, i, arr) => (
                      <React.Fragment key={page.requestPath}>
                        <StatRow
                          label={page.requestPath || '/'}
                          value={`${page.pageviews} views`}
                          sub={`${page.visitors} visitors`}
                          barPct={Math.round((page.pageviews / maxPageViews) * 100)}
                          barColor="#3b82f6"
                        />
                        {i < arr.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                </Stack>
              </Stack>
            )}

            {/* ── Devices ── */}
            {(data?.deviceTypes ?? []).length > 0 && (
              <Stack space={3}>
                <SectionHeading>Devices</SectionHeading>
                <Divider />
                <Stack space={0}>
                  {(data?.deviceTypes ?? []).map((d, i, arr) => {
                    const pct = Math.round((d.visitors / totalDevices) * 100);
                    return (
                      <React.Fragment key={d.deviceType}>
                        <StatRow
                          label={d.deviceType === 'desktop' ? '💻  Desktop' : '📱  Mobile'}
                          value={`${pct}%`}
                          sub={`${d.visitors} visitors`}
                          barPct={pct}
                          barColor="#8b5cf6"
                        />
                        {i < arr.length - 1 && <Divider />}
                      </React.Fragment>
                    );
                  })}
                </Stack>
              </Stack>
            )}

            {/* ── Countries ── */}
            {(data?.topCountries ?? []).length > 0 && (
              <Stack space={3}>
                <SectionHeading>Countries</SectionHeading>
                <Divider />
                <Stack space={0}>
                  {(data?.topCountries ?? []).map((c, i, arr) => (
                    <React.Fragment key={c.country}>
                      <StatRow
                        label={`${flagEmoji(c.country)}  ${c.country}`}
                        value={`${c.visitors} visitors`}
                        barPct={Math.round((c.visitors / maxCountryVisitors) * 100)}
                        barColor="#10b981"
                      />
                      {i < arr.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </Stack>
              </Stack>
            )}

            {/* ── Referrers ── */}
            {(data?.topReferrers ?? []).filter(r => r.referrerHostname).length > 0 && (
              <Stack space={3}>
                <SectionHeading>Referrers</SectionHeading>
                <Divider />
                <Stack space={0}>
                  {(data?.topReferrers ?? [])
                    .filter((r) => r.referrerHostname)
                    .map((r, i, arr) => (
                      <React.Fragment key={r.referrerHostname}>
                        <StatRow
                          label={r.referrerHostname}
                          value={`${r.visitors} visitors`}
                        />
                        {i < arr.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                </Stack>
              </Stack>
            )}

          </Stack>
        )}
      </Stack>
    </Card>
  );
}

export function vercelAnalyticsWidget() {
  return {
    name: 'vercel-analytics',
    title: 'Analytics',
    component: VercelAnalyticsWidgetComponent,
    layout: { width: 'large' as const },
  };
}
