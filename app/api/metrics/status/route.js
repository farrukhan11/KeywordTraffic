import { requireAuth } from '@/lib/auth';
import { getMetricsStatus } from '@/services/keyword-metrics.service';

export async function GET(request) {
  const authResult = await requireAuth(request);
  if (authResult.error) {
    return Response.json({ error: authResult.error.message }, { status: authResult.error.status });
  }

  const url = request.nextUrl;
  const projectId = url.searchParams.get('projectId');

  if (!projectId) {
    return Response.json({ error: 'Project ID is required' }, { status: 400 });
  }

  try {
    const status = await getMetricsStatus(authResult.user.uid, projectId);
    return Response.json(status);
  } catch (error) {
    return Response.json({ error: error.message || 'Failed to get status' }, { status: 500 });
  }
}
