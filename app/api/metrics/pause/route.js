import { requireAuth } from '@/lib/auth';
import { pauseMetricsRun } from '@/services/keyword-metrics.service';

export async function POST(request) {
  const authResult = await requireAuth(request);
  if (authResult.error) {
    return Response.json({ error: authResult.error.message }, { status: authResult.error.status });
  }

  try {
    const body = await request.json();
    const { projectId, lockToken } = body;

    if (!projectId || !lockToken) {
      return Response.json({ error: 'Project ID and lock token are required' }, { status: 400 });
    }

    await pauseMetricsRun(authResult.user.uid, projectId, lockToken);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message || 'Failed to pause' }, { status: 500 });
  }
}
