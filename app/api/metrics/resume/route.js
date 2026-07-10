import { requireAuth } from '@/lib/auth';
import { startMetricsRun } from '@/services/keyword-metrics.service';

export async function POST(request) {
  const authResult = await requireAuth(request);
  if (authResult.error) {
    return Response.json({ error: authResult.error.message }, { status: authResult.error.status });
  }

  try {
    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return Response.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const result = await startMetricsRun(authResult.user.uid, projectId, { forceRefresh: false });
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message || 'Failed to resume' }, { status: 500 });
  }
}
