import React from 'react';

const FAQPage: React.FC = () => (
  <div className="max-w-3xl mx-auto px-4 py-12">
    <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>
    <ul className="space-y-8">
      <li>
        <strong>How do I place an order?</strong>
        <p>
          Browse our marketplace and add your favorite items to the cart. When you're ready, go to your cart and follow the checkout process. You'll receive an order confirmation by email.
        </p>
      </li>
      <li>
        <strong>What payment methods do you accept?</strong>
        <p>
          We accept Visa, Mastercard, American Express, and PayPal. All payments are processed securely.
        </p>
      </li>
      <li>
        <strong>How can I track my order?</strong>
        <p>
          Once your order ships, you'll receive a tracking number by email. You can also view your order status in your account dashboard.
        </p>
      </li>
      <li>
        <strong>Can I return or exchange an item?</strong>
        <p>
          Yes! Please see our <a href="/returns" className="text-primary underline">Returns & Refunds</a> page for details and instructions.
        </p>
      </li>
      <li>
        <strong>How do I contact customer support?</strong>
        <p>
          You can reach us via the <a href="/contact" className="text-primary underline">Contact Us</a> page or email support@artiflare.com.
        </p>
      </li>
    </ul>
  </div>
);

export default FAQPage; 