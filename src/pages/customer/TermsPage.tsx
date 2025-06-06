import React from 'react';

const TermsPage: React.FC = () => (
  <div className="max-w-3xl mx-auto px-4 py-12">
    <h1 className="text-3xl font-bold mb-6">Terms & Conditions</h1>
    <p className="mb-4">
      By using ArtiFlare, you agree to the following terms and conditions. Please read them carefully before making a purchase.
    </p>
    <ul className="list-disc pl-6 mb-4">
      <li>All sales are subject to our return policy.</li>
      <li>Personalized and custom-made items may have special conditions and may not be eligible for return.</li>
      <li>We reserve the right to update these terms at any time. Changes will be posted on this page.</li>
      <li>Use of our website and services is at your own risk. We are not liable for any damages arising from your use of the site.</li>
    </ul>
    <p>
      If you have any questions about these terms, please contact us at <a href="mailto:support@artiflare.com" className="text-primary underline">support@artiflare.com</a>.
    </p>
  </div>
);

export default TermsPage; 