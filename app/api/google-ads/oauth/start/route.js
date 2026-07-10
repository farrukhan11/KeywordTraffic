import { requireAuth } from '@/lib/auth';
import { buildOAuthUrl } from '@/lib/google-ads/oauth';

export async function GET(request) {
  const authResult = await requireAuth(request);
  if (authResult.error) {
    return Response.json({ error: authResult.error.message }, { status: authResult.error.status });
  }

  const { url } = buildOAuthUrl(authResult.user.uid);
  return Response.json({ url });
}
