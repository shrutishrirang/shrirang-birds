import React, { useEffect, useState } from 'react';
import { Card, Stack, Text, Flex, Spinner, Box } from '@sanity/ui';

export function VercelAnalyticsWidgetComponent() {
  const [data, setData] = useState<{ data?: { pageviews: number; visitors: number }; error?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/analytics?t=${Date.now()}`)
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        setData({ error: err.message });
        setLoading(false);
      });
  }, []);

  return (
    <Card padding={4} shadow={1} radius={2}>
      <Stack space={3}>
        <Text size={2} weight="bold">Vercel Web Analytics</Text>
        
        <Box marginTop={2}>
          {loading ? (
            <Flex align="center" justify="center" padding={4}>
              <Spinner />
            </Flex>
          ) : data?.error ? (
            <Card padding={3} tone="critical" radius={2}>
              <Text size={1}>{data.error}</Text>
            </Card>
          ) : (
            <Flex gap={3} align="center">
              <Card padding={3} border radius={2} flex={1}>
                <Stack space={2}>
                  <Text size={1} muted>Total Page Views</Text>
                  <Text size={4} weight="semibold">
                    {typeof data?.data?.pageviews === 'number' ? data.data.pageviews.toLocaleString() : 'No data'}
                  </Text>
                </Stack>
              </Card>
              <Card padding={3} border radius={2} flex={1}>
                <Stack space={2}>
                  <Text size={1} muted>Total Visitors</Text>
                  <Text size={4} weight="semibold">
                    {typeof data?.data?.visitors === 'number' ? data.data.visitors.toLocaleString() : 'No data'}
                  </Text>
                </Stack>
              </Card>
            </Flex>
          )}
        </Box>
      </Stack>
    </Card>
  );
}

export function vercelAnalyticsWidget() {
  return {
    name: 'vercel-analytics',
    title: 'Vercel Analytics',
    component: VercelAnalyticsWidgetComponent,
    layout: { width: 'medium' as const }
  };
}
