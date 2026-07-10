import { requireAuth } from '@/lib/auth';
import { listCustomers, getCustomerInfo } from '@/services/google-ads-connection.service';

export async function GET(request) {
  const authResult = await requireAuth(request);
  if (authResult.error) {
    return Response.json({ error: authResult.error.message }, { status: authResult.error.status });
  }

  try {
    const customers = await listCustomers(authResult.user.uid);

    const enrichedCustomers = await Promise.allSettled(
      customers.map(async (customer) => {
        try {
          const details = await getCustomerInfo(authResult.user.uid, customer.customerId, customer.customerId);
          return {
            ...customer,
            name: details.name || '',
            currencyCode: details.currencyCode,
            timeZone: details.timeZone,
            status: details.status,
          };
        } catch {
          return customer;
        }
      })
    );

    return Response.json({
      customers: enrichedCustomers
        .filter((r) => r.status === 'fulfilled')
        .map((r) => r.value),
    });
  } catch (error) {
    return Response.json({ error: error.message || 'Failed to list customers' }, { status: 500 });
  }
}
