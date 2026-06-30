import React, { useEffect, useState } from 'react';
import { Card, Stack, Text, Flex, Spinner, Box, Select, Badge } from '@sanity/ui';

// Country code to flag emoji helper
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

export function VercelAnalyticsWidgetComponent() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics?days=${period}&t=${Date.now()}`)
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        setData({ error: err.message } as any);
        setLoading(false);
      });
  }, [period]);

  const maxPageViews = data?.topPages?.[0]?.pageviews ?? 1;
  const maxVisitors = data?.topCountries?.[0]?.visitors ?? 1;
  const totalDeviceVisitors = data?.deviceTypes?.reduce((s, d) => s + d.visitors, 0) ?? 1;

  return (
    <Card padding={4} shadow={1} radius={2}>
      <Stack space={4}>
        {/* Header */}
        <Flex align="center" justify="space-between">
          <Stack space={1}>
            <Text size={2} weight="bold">🔍 Vercel Web Analytics</Text>
            {data?.since && !data?.error && (
              <Text size={1} muted>
                {new Date(data.since).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                {' → '}
                {new Date(data.until).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>
            )}
          </Stack>
          <Select
            value={period}
            onChange={(e) => setPeriod((e.target as HTMLSelectElement).value)}
            style={{ fontSize: 13 }}
          >
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </Select>
        </Flex>

        {loading ? (
          <Flex align="center" justify="center" padding={5}>
            <Spinner />
          </Flex>
        ) : data?.error ? (
          <Card padding={3} tone="critical" radius={2}>
            <Text size={1}>{data.error}</Text>
          </Card>
        ) : (
          <Stack space={4}>
            {/* Totals */}
            <Flex gap={3}>
              <Card padding={3} border radius={2} flex={1} tone="primary">
                <Stack space={2}>
                  <Text size={1} muted>Page Views</Text>
                  <Text size={4} weight="semibold">{data?.totals?.pageviews?.toLocaleString() ?? '—'}</Text>
                </Stack>
              </Card>
              <Card padding={3} border radius={2} flex={1}>
                <Stack space={2}>
                  <Text size={1} muted>Unique Visitors</Text>
                  <Text size={4} weight="semibold">{data?.totals?.visitors?.toLocaleString() ?? '—'}</Text>
                </Stack>
              </Card>
            </Flex>

            {/* Device Breakdown */}
            {data?.deviceTypes && data.deviceTypes.length > 0 && (
              <Stack space={2}>
                <Text size={1} weight="semibold" muted>DEVICE BREAKDOWN</Text>
                <Flex gap={2}>
                  {data.deviceTypes.map((d) => {
                    const pct = Math.round((d.visitors / totalDeviceVisitors) * 100);
                    return (
                      <Card key={d.deviceType} padding={2} border radius={2} flex={1}>
                        <Stack space={1}>
                          <Text size={1} muted>{d.deviceType === 'desktop' ? '💻 Desktop' : '📱 Mobile'}</Text>
                          <Text size={2} weight="semibold">{pct}%</Text>
                          <Text size={1} muted>{d.visitors} visitors</Text>
                        </Stack>
                      </Card>
                    );
                  })}
                </Flex>
              </Stack>
            )}

            {/* Top Pages */}
            {data?.topPages && data.topPages.length > 0 && (
              <Stack space={2}>
                <Text size={1} weight="semibold" muted>TOP PAGES</Text>
                <Stack space={1}>
                  {data.topPages.filter(p => p.requestPath !== 'Others').map((page) => {
                    const pct = Math.round((page.pageviews / maxPageViews) * 100);
                    return (
                      <Card key={page.requestPath} padding={2} border radius={2}>
                        <Stack space={1}>
                          <Flex justify="space-between" align="center">
                            <Text size={1} style={{ fontFamily: 'monospace' }}>
                              {page.requestPath || '/'}
                            </Text>
                            <Flex gap={2} align="center">
                              <Text size={1} muted>{page.pageviews} views</Text>
                            </Flex>
                          </Flex>
                          {/* Progress bar */}
                          <div style={{ height: 3, background: '#e5e7eb', borderRadius: 9 }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: '#3b82f6', borderRadius: 9 }} />
                          </div>
                        </Stack>
                      </Card>
                    );
                  })}
                </Stack>
              </Stack>
            )}

            {/* Top Countries */}
            {data?.topCountries && data.topCountries.length > 0 && (
              <Stack space={2}>
                <Text size={1} weight="semibold" muted>TOP COUNTRIES</Text>
                <Stack space={1}>
                  {data.topCountries.map((c) => {
                    const pct = Math.round((c.visitors / maxVisitors) * 100);
                    return (
                      <Card key={c.country} padding={2} border radius={2}>
                        <Flex justify="space-between" align="center" gap={2}>
                          <Flex gap={2} align="center">
                            <Text size={2}>{flagEmoji(c.country)}</Text>
                            <Text size={1}>{c.country}</Text>
                          </Flex>
                          <Text size={1} muted>{c.visitors} visitors</Text>
                        </Flex>
                        <Box marginTop={1}>
                          <div style={{ height: 3, background: '#e5e7eb', borderRadius: 9 }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: '#10b981', borderRadius: 9 }} />
                          </div>
                        </Box>
                      </Card>
                    );
                  })}
                </Stack>
              </Stack>
            )}

            {/* Top Referrers */}
            {data?.topReferrers && data.topReferrers.filter(r => r.referrerHostname).length > 0 && (
              <Stack space={2}>
                <Text size={1} weight="semibold" muted>TOP REFERRERS</Text>
                <Flex gap={2} style={{ flexWrap: 'wrap' }}>
                  {data.topReferrers
                    .filter((r) => r.referrerHostname)
                    .map((r) => (
                      <Badge key={r.referrerHostname} tone="primary" padding={2} radius={3}>
                        <Text size={1}>{r.referrerHostname} · {r.visitors}</Text>
                      </Badge>
                    ))}
                </Flex>
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
    title: 'Vercel Analytics',
    component: VercelAnalyticsWidgetComponent,
    layout: { width: 'large' as const },
  };
}
