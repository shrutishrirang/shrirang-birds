import { NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.VERCEL_ACCESS_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;

  if (!token || !projectId) {
    return NextResponse.json(
      { error: 'Missing Vercel credentials (VERCEL_ACCESS_TOKEN or VERCEL_PROJECT_ID) in environment variables.' },
      { status: 500 }
    );
  }

  try {
    // Attempting to fetch total visits/pageviews
    // The exact query might need adjustment based on Vercel's API specifics,
    // but this hits the count endpoint as per docs.
    const url = `https://api.vercel.com/v1/projects/${projectId}/analytics/visits/count`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      // Cache for 60 seconds to avoid hitting rate limits too quickly in the dashboard
      next: { revalidate: 60 }
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: `Vercel API error: ${res.statusText}`, details: text }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
