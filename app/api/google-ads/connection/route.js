import { requireAuth } from '@/lib/auth';
import { getConnection } from '@/services/google-ads-connection.service';

export async function GET(request) {
  const authResult = await requireAuth(request);
  if (authResult.error) {
    return Response.json({ error: authResult.error.message }, { status: authResult.error.status });
  }

  try {
    const connection = await getConnection(authResult.user.uid);
    return Response.json({ connection });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch connection' }, { status: 500 });
  }
}
