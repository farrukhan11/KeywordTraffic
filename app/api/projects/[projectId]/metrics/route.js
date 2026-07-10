import { requireAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import KeywordMetric from '@/models/KeywordMetric';

export async function GET(request, { params }) {
  const authResult = await requireAuth(request);
  if (authResult.error) {
    return Response.json({ error: authResult.error.message }, { status: authResult.error.status });
  }

  const { projectId } = await params;

  try {
    await connectToDatabase();
    const metrics = await KeywordMetric.find({
      projectId,
      userId: authResult.user.uid,
    })
      .select('-requestFingerprint')
      .sort({ normalizedKeyword: 1 });

    return Response.json({ metrics });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}
