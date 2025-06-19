(async () => {
  const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
  const response = await fetch('http://localhost:5000/api/send-order-emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer: {
        email: 'customer@example.com',
        name: 'Customer Test',
      },
      artisan: {
        email: 'artisan@example.com',
        name: 'Artisan Test',
      },
      order: {
        id: 'TEST123',
        products: [
          { name: 'Test Product', image: 'https://artiflare.hardeepijardar.com/logo.png', price: 499, quantity: 2 }
        ],
        total: 998,
        date: new Date().toLocaleDateString(),
      }
    })
  });
  const data = await response.json();
  console.log('API response:', data);
})(); 