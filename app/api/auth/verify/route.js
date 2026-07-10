import { requireAuth } from '@/lib/auth';

export async function POST(request) {
  const authResult = await requireAuth(request);
  if (authResult.error) {
    return Response.json({ error: authResult.error.message }, { status: authResult.error.status });
  }
  return Response.json({ userId: authResult.user.uid });
}
