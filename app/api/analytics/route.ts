import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const token = process.env.VERCEL_ACCESS_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;

  if (!token || !projectId) {
    return NextResponse.json(
      { error: 'Missing Vercel credentials (VERCEL_ACCESS_TOKEN or VERCEL_PROJECT_ID) in environment variables.' },
      { status: 500 }
    );
  }

  // Allow the caller to specify a period (days), default to 30
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get('days') ?? '30', 10);
  const until = new Date();
  const since = new Date(until.getTime() - days * 24 * 60 * 60 * 1000);
  const sinceISO = since.toISOString();
  const untilISO = until.toISOString();

  try {
    // Step 1: Get the teamId (required for team-owned projects)
    const projectRes = await fetch(`https://api.vercel.com/v1/projects/${projectId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!projectRes.ok) {
      const text = await projectRes.text();
      return NextResponse.json({ error: `Could not fetch project info: ${projectRes.statusText}`, details: text }, { status: projectRes.status });
    }
    const projectData = await projectRes.json();
    const teamParam = projectData.teamId ? `&teamId=${projectData.teamId}` : '';

    const base = `https://api.vercel.com/v1/query/web-analytics`;
    const dateParams = `&since=${encodeURIComponent(sinceISO)}&until=${encodeURIComponent(untilISO)}`;
    const commonParams = `?projectId=${projectId}${teamParam}${dateParams}`;
    const headers = { 'Authorization': `Bearer ${token}` };

    // Step 2: Fetch all data in parallel
    const [overviewRes, pagesRes, countriesRes, devicesRes, referrersRes] = await Promise.all([
      fetch(`${base}/visits/count${commonParams}`, { headers }),
      fetch(`${base}/visits/aggregate${commonParams}&by=requestPath&limit=5`, { headers }),
      fetch(`${base}/visits/aggregate${commonParams}&by=country&limit=5`, { headers }),
      fetch(`${base}/visits/aggregate${commonParams}&by=deviceType`, { headers }),
      fetch(`${base}/visits/aggregate${commonParams}&by=referrerHostname&limit=5`, { headers }),
    ]);

    const [overview, pages, countries, devices, referrers] = await Promise.all([
      overviewRes.json(),
      pagesRes.json(),
      countriesRes.json(),
      devicesRes.json(),
      referrersRes.json(),
    ]);

    return NextResponse.json({
      since: sinceISO,
      until: untilISO,
      days,
      totals: overview?.data ?? null,
      topPages: pages?.data ?? [],
      topCountries: countries?.data ?? [],
      deviceTypes: devices?.data ?? [],
      topReferrers: referrers?.data ?? [],
    });
  } catch (error: any) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
