import { createOrderInSupabase } from './src/lib/supabaseService.ts';

(async () => {
  const payload = {
    id: 'ORD-TEST-001',
    customerName: 'Test User',
    customerPhone: '9999999999',
    totalAmount: 1234,
    items: [
      {
        productId: 'prod-001',
        productName: 'Test Cake',
        quantity: 1,
        price: 1234,
        total: 1234,
      },
    ],
  } as any;

  const order = await createOrderInSupabase(payload);
  console.log('Created order:', order?.id);
})();
