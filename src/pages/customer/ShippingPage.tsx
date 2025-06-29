import React from 'react';

const ShippingPage: React.FC = () => (
  <div className="max-w-3xl mx-auto px-4 py-12">
    <h1 className="text-3xl font-bold mb-6">Shipping & Delivery</h1>
    <p className="mb-4">
      We offer standard delivery to ensure your gifts arrive on time and in perfect condition.
    </p>
    
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-dark mb-4">Delivery Charges</h2>
      <div className="space-y-4">
        <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
          <div>
            <span className="text-dark font-medium">Standard Delivery</span>
            <span className="text-dark-500 text-sm block">Standard delivery (3-5 business days)</span>
          </div>
          <span className="text-dark font-bold">₹50</span>
        </div>
      </div>
    </div>
    
    <div className="bg-blue-50 p-4 rounded-lg mb-6">
      <h3 className="font-bold text-dark mb-2">How it works:</h3>
      <ul className="list-disc list-inside text-dark-600 space-y-1">
        <li>Standard delivery: ₹50 delivery charge</li>
        <li>Standard delivery takes 3-5 business days</li>
        <li>You'll receive a tracking number by email once your order ships</li>
      </ul>
    </div>
    
    <p className="mb-2">
      If you have any questions about your delivery, please contact our support team.
    </p>
  </div>
);

export default ShippingPage; 