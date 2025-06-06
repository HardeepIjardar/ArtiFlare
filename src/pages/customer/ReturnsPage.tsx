import React from 'react';

const ReturnsPage: React.FC = () => (
  <div className="max-w-3xl mx-auto px-4 py-12">
    <h1 className="text-3xl font-bold mb-6">Returns & Refunds</h1>
    <p className="mb-4">
      We want you to love your purchase! If you're not satisfied, you may return most items within 14 days of delivery for a refund or exchange.
    </p>
    <ul className="list-disc pl-6 mb-4">
      <li>Items must be unused and in their original packaging.</li>
      <li>Personalized or custom-made items may not be eligible for return unless defective.</li>
      <li>To start a return, please contact our support team with your order number and reason for return.</li>
      <li>Refunds are processed within 5-7 business days after we receive your return.</li>
    </ul>
    <p>
      For more information or to initiate a return, please email <a href="mailto:support@artiflare.com" className="text-primary underline">support@artiflare.com</a>.
    </p>
  </div>
);

export default ReturnsPage; 