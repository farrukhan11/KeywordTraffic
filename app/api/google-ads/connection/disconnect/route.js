import { requireAuth } from '@/lib/auth';
import { disconnectConnection } from '@/services/google-ads-connection.service';

export async function POST(request) {
  const authResult = await requireAuth(request);
  if (authResult.error) {
    return Response.json({ error: authResult.error.message }, { status: authResult.error.status });
  }

  try {
    await disconnectConnection(authResult.user.uid);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message || 'Failed to disconnect' }, { status: 500 });
  }
}
