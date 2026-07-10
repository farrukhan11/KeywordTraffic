import { requireAuth } from '@/lib/auth';
import { selectCustomer } from '@/services/google-ads-connection.service';

export async function POST(request) {
  const authResult = await requireAuth(request);
  if (authResult.error) {
    return Response.json({ error: authResult.error.message }, { status: authResult.error.status });
  }

  try {
    const body = await request.json();
    const { customerId, customerName } = body;

    if (!customerId) {
      return Response.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    const connection = await selectCustomer(authResult.user.uid, customerId, customerName);
    return Response.json({ connection: {
      selectedCustomerId: connection.selectedCustomerId,
      selectedCustomerName: connection.selectedCustomerName,
      selectedLoginCustomerId: connection.selectedLoginCustomerId,
    }});
  } catch (error) {
    return Response.json({ error: error.message || 'Failed to select customer' }, { status: 500 });
  }
}
