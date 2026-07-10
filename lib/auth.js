import { getAdminAuth } from './firebase-admin';

export async function verifyFirebaseToken(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await getAdminAuth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    return null;
  }
}

export async function requireAuth(request) {
  const user = await verifyFirebaseToken(request);
  if (!user) {
    return { error: { status: 401, message: 'Unauthorized' } };
  }
  return { user };
}
