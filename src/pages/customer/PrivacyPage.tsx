import React from 'react';

const PrivacyPage: React.FC = () => (
  <div className="max-w-3xl mx-auto px-4 py-12">
    <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
    <p className="mb-4">
      Your privacy is important to us. We are committed to protecting your personal information and using it only as necessary to provide our services.
    </p>
    <ul className="list-disc pl-6 mb-4">
      <li>We collect information you provide when placing an order or creating an account.</li>
      <li>Your data is used to process orders, improve our services, and communicate with you.</li>
      <li>We do not sell or share your information with third parties except as required to fulfill your order.</li>
      <li>All payments are processed securely and your payment details are never stored on our servers.</li>
      <li>You can unsubscribe from marketing emails at any time.</li>
    </ul>
    <p>
      For questions about our privacy practices, please contact us at <a href="mailto:privacy@artiflare.com" className="text-primary underline">privacy@artiflare.com</a>.
    </p>
  </div>
);

export default PrivacyPage; 