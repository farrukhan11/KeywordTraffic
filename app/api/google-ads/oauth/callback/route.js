import { handleOAuthCallback } from '@/services/google-ads-connection.service';

export async function GET(request) {
  const url = request.nextUrl;
  const code = url.searchParams.get('code');
  const encodedState = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  if (error) {
    const frontendUrl = new URL('/dashboard/settings/google-ads', request.url);
    frontendUrl.searchParams.set('error', error);
    return Response.redirect(frontendUrl.toString());
  }

  if (!code || !encodedState) {
    return new Response('Missing authorization code or state', { status: 400 });
  }

  try {
    await handleOAuthCallback(encodedState, code);
    const frontendUrl = new URL('/dashboard/settings/google-ads', request.url);
    frontendUrl.searchParams.set('connected', 'true');
    return Response.redirect(frontendUrl.toString());
  } catch (err) {
    const frontendUrl = new URL('/dashboard/settings/google-ads', request.url);
    frontendUrl.searchParams.set('error', 'connection_failed');
    return Response.redirect(frontendUrl.toString());
  }
}
