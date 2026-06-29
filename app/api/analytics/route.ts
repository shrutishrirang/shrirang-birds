import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

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
    // First, we need to find if this project belongs to a team, because the Analytics API requires it.
    const projectUrl = `https://api.vercel.com/v1/projects/${projectId}`;
    const projectRes = await fetch(projectUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!projectRes.ok) {
      const text = await projectRes.text();
      return NextResponse.json({ error: `Vercel API error fetching project: ${projectRes.statusText}`, details: text }, { status: projectRes.status });
    }
    const projectData = await projectRes.json();
    const teamIdQuery = projectData.teamId ? `&teamId=${projectData.teamId}` : '';

    // The correct endpoint for Vercel Web Analytics is /v1/query/web-analytics/...
    const url = `https://api.vercel.com/v1/query/web-analytics/visits/count?projectId=${projectId}${teamIdQuery}`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      // Cache for 60 seconds to avoid hitting rate limits too quickly in the dashboard
      next: { revalidate: 60 }
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`Vercel API error: ${res.statusText}`, text);
      return NextResponse.json({ error: `Vercel API error: ${res.statusText}`, details: text }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
