import { createClient, GoogleAdsError } from './client';
import { normalizeCustomerId } from './config';

export async function listAccessibleCustomers(accessToken) {
  const client = createClient(accessToken, null);

  try {
    const result = await client.get('/customers:listAccessibleCustomers');
    const resources = result.resourceNames || [];

    const customers = resources.map((name) => {
      const customerId = name.replace('customers/', '');
      return {
        resourceName: name,
        customerId: normalizeCustomerId(customerId),
        formattedId: formatId(customerId),
      };
    });

    return customers;
  } catch (error) {
    throw new GoogleAdsError(
      {
        error: {
          message: `Failed to list accessible customers: ${error.message}`,
          details: error.rawData,
        },
        requestId: error.requestId,
      },
      error.status || 500
    );
  }
}

export async function getCustomerDetails(accessToken, customerId, loginCustomerId) {
  const client = createClient(accessToken, loginCustomerId || customerId);
  const normalizedId = normalizeCustomerId(customerId);

  try {
    const query = `SELECT customer.id, customer.descriptive_name, customer.currency_code, customer.time_zone, customer.status FROM customer WHERE customer.id = ${normalizedId}`;
    const result = await client.post(`/customers/${normalizedId}/googleAds:searchStream`, {
      query,
    });

    if (result && result.length > 0 && result[0].results && result[0].results.length > 0) {
      const row = result[0].results[0].customer;
      return {
        customerId: normalizedId,
        formattedId: formatId(normalizedId),
        name: row.descriptiveName || '',
        currencyCode: row.currencyCode || null,
        timeZone: row.timeZone || null,
        status: mapCustomerStatus(row.status),
      };
    }

    return {
      customerId: normalizedId,
      formattedId: formatId(normalizedId),
      name: '',
      currencyCode: null,
      timeZone: null,
      status: 'UNKNOWN',
    };
  } catch (error) {
    if (error instanceof GoogleAdsError) throw error;
    throw new GoogleAdsError(
      { error: { message: error.message } },
      error.status || 500
    );
  }
}

function formatId(customerId) {
  const id = normalizeCustomerId(customerId);
  if (!id || id.length !== 10) return id;
  return `${id.slice(0, 3)}-${id.slice(3, 6)}-${id.slice(6)}`;
}

function mapCustomerStatus(status) {
  const statusMap = {
    'ENABLED': 'ACTIVE',
    'PAYMENT_REQUIRED': 'PAYMENT_REQUIRED',
    'SUSPENDED': 'SUSPENDED',
    'CLOSED': 'CLOSED',
    'UNKNOWN': 'UNKNOWN',
    'UNSPECIFIED': 'UNKNOWN',
  };
  return statusMap[status] || 'UNKNOWN';
}
