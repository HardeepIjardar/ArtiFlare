import React from 'react';

const ShippingPage: React.FC = () => (
  <div className="max-w-3xl mx-auto px-4 py-12">
    <h1 className="text-3xl font-bold mb-6">Shipping & Delivery</h1>
    <p className="mb-4">
      We offer several shipping options to ensure your gifts arrive on time and in perfect condition.
    </p>
    <ul className="list-disc pl-6 mb-4">
      <li><strong>Standard Shipping:</strong> 3-7 business days</li>
      <li><strong>Express Shipping:</strong> 1-3 business days</li>
      <li><strong>SOS Gifts:</strong> Same-day delivery in select areas</li>
    </ul>
    <p className="mb-2">
      Shipping costs are calculated at checkout based on your location and the items in your cart.
    </p>
    <p>
      Once your order ships, you'll receive a tracking number by email. If you have any questions about your delivery, please contact our support team.
    </p>
  </div>
);

export default ShippingPage; 