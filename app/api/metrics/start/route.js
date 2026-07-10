import { requireAuth } from '@/lib/auth';
import { startMetricsRun } from '@/services/keyword-metrics.service';
import { connectToDatabase } from '@/lib/mongodb';
import GoogleAdsConnection from '@/models/GoogleAdsConnection';

export async function POST(request) {
  const authResult = await requireAuth(request);
  if (authResult.error) {
    return Response.json({ error: authResult.error.message }, { status: authResult.error.status });
  }

  try {
    const body = await request.json();
    const { projectId, forceRefresh } = body;

    if (!projectId) {
      return Response.json({ error: 'Project ID is required' }, { status: 400 });
    }

    await connectToDatabase();
    const connection = await GoogleAdsConnection.findOne({
      userId: authResult.user.uid,
      status: 'connected',
      selectedCustomerId: { $exists: true, $ne: null },
    });

    if (!connection) {
      return Response.json({
        error: 'Google Ads connection required. Please connect and select a customer account first.',
      }, { status: 400 });
    }

    const result = await startMetricsRun(authResult.user.uid, projectId, { forceRefresh });
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message || 'Failed to start metrics run' }, { status: 500 });
  }
}
