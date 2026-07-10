import { connectToDatabase } from '../lib/mongodb';
import GoogleAdsConnection from '../models/GoogleAdsConnection';
import { encrypt, decrypt } from '../lib/security/encryption';
import { normalizeCustomerId } from '../lib/google-ads/config';
import { exchangeCodeForTokens, refreshAccessToken, revokeToken } from '../lib/google-ads/oauth';
import { listAccessibleCustomers, getCustomerDetails } from '../lib/google-ads/customer-service';

export async function handleOAuthCallback(encodedState, code) {
  const stateData = parseAndValidateState(encodedState);
  if (!stateData) {
    throw new Error('Invalid or expired OAuth state');
  }

  const tokens = await exchangeCodeForTokens(code);
  await connectToDatabase();

  const { encrypted, iv, authTag } = encrypt(tokens.refreshToken);

  let googleEmail = null;
  if (tokens.accessToken) {
    try {
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
      });
      if (userInfoResponse.ok) {
        const userInfo = await userInfoResponse.json();
        googleEmail = userInfo.email || null;
      }
    } catch {
      // Best-effort email fetch
    }
  }

  const connection = await GoogleAdsConnection.findOneAndUpdate(
    { userId: stateData.userId, status: { $ne: 'disconnected' } },
    {
      userId: stateData.userId,
      googleAccountEmail: googleEmail,
      encryptedRefreshToken: encrypted,
      refreshTokenIv: iv,
      refreshTokenAuthTag: authTag,
      scope: tokens.scope,
      tokenType: tokens.tokenType,
      status: 'connected',
      connectedAt: new Date(),
      lastSuccessfulAuthAt: new Date(),
      disconnectedAt: null,
      lastAuthError: null,
    },
    { upsert: true, new: true, runValidators: true }
  );

  return connection;
}

export async function getDecryptedRefreshToken(connection) {
  try {
    return decrypt(
      connection.encryptedRefreshToken,
      connection.refreshTokenIv,
      connection.refreshTokenAuthTag
    );
  } catch {
    return null;
  }
}

export async function getValidAccessToken(userId) {
  await connectToDatabase();
  const connection = await GoogleAdsConnection.findOne({ userId, status: 'connected' });
  if (!connection) {
    return { error: 'No active Google Ads connection', connection: null };
  }

  try {
    const refreshToken = await getDecryptedRefreshToken(connection);
    if (!refreshToken) {
      await markConnectionError(userId, 'Failed to decrypt refresh token');
      return { error: 'Connection credentials are invalid', connection };
    }

    const tokenData = await refreshAccessToken(refreshToken);

    await GoogleAdsConnection.findOneAndUpdate(
      { _id: connection._id },
      { lastSuccessfulAuthAt: new Date(), lastAuthError: null }
    );

    return { accessToken: tokenData.accessToken, connection };
  } catch (error) {
    const errorMsg = error.message || 'Token refresh failed';
    await markConnectionError(userId, errorMsg);

    if (errorMsg.includes('invalid_grant') || errorMsg.includes('revoked') || errorMsg.includes('Token has been expired')) {
      await GoogleAdsConnection.findOneAndUpdate(
        { _id: connection._id },
        { status: 'expired' }
      );
      return { error: 'Google Ads connection has expired. Please reconnect.', connection };
    }

    return { error: errorMsg, connection };
  }
}

export async function listCustomers(userId) {
  const { accessToken, error } = await getValidAccessToken(userId);
  if (error) throw new Error(error);

  return listAccessibleCustomers(accessToken);
}

export async function getCustomerInfo(userId, customerId, loginCustomerId) {
  const { accessToken, error } = await getValidAccessToken(userId);
  if (error) throw new Error(error);

  return getCustomerDetails(accessToken, customerId, loginCustomerId);
}

export async function selectCustomer(userId, customerId, customerName) {
  await connectToDatabase();
  const normalizedId = normalizeCustomerId(customerId);

  const connection = await GoogleAdsConnection.findOne({ userId, status: 'connected' });
  if (!connection) {
    throw new Error('No active Google Ads connection');
  }

  let loginCustomerId = normalizedId;
  try {
    const customers = await listCustomers(userId);
    const matchingCustomer = customers.find((c) => c.customerId === normalizedId);
    if (matchingCustomer) {
      loginCustomerId = normalizedId;
    }
  } catch {
    // Use default
  }

  connection.selectedCustomerId = normalizedId;
  connection.selectedCustomerName = customerName || null;
  connection.selectedLoginCustomerId = loginCustomerId;
  await connection.save();

  return connection;
}

export async function disconnectConnection(userId) {
  await connectToDatabase();
  const connection = await GoogleAdsConnection.findOne({ userId, status: 'connected' });
  if (!connection) {
    return { success: true };
  }

  try {
    const refreshToken = await getDecryptedRefreshToken(connection);
    if (refreshToken) {
      await revokeToken(refreshToken);
    }
  } catch {
    // Best-effort revocation
  }

  connection.status = 'disconnected';
  connection.disconnectedAt = new Date();
  connection.encryptedRefreshToken = '';
  connection.refreshTokenIv = '';
  connection.refreshTokenAuthTag = '';
  await connection.save();

  return { success: true };
}

export async function getConnection(userId) {
  await connectToDatabase();
  const connection = await GoogleAdsConnection.findOne({
    userId,
    status: { $in: ['connected', 'expired', 'error'] },
  }).select('-encryptedRefreshToken -refreshTokenIv -refreshTokenAuthTag');
  return connection;
}

async function markConnectionError(userId, errorMsg) {
  await GoogleAdsConnection.findOneAndUpdate(
    { userId, status: { $ne: 'disconnected' } },
    { lastAuthError: errorMsg, updatedAt: new Date() }
  );
}

function parseAndValidateState(encodedState) {
  try {
    const stateData = JSON.parse(Buffer.from(encodedState, 'base64url').toString('utf8'));
    if (!stateData.state || !stateData.userId || !stateData.expiresAt) {
      return null;
    }
    if (Date.now() > stateData.expiresAt) {
      return null;
    }
    return stateData;
  } catch {
    return null;
  }
}
