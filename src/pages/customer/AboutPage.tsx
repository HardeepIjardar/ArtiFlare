import React from 'react';

const AboutPage: React.FC = () => (
  <div className="max-w-3xl mx-auto px-4 py-12">
    <h1 className="text-3xl font-bold mb-6">About Us</h1>
    <p className="mb-4">
      <strong>ArtiFlare</strong> is a curated marketplace connecting talented artisans with customers seeking unique, handcrafted gifts. Our mission is to make it easy for you to find and send meaningful, personalized presents for every occasion.
    </p>
    <p className="mb-4">
      We believe in supporting local makers and celebrating creativity. Every product on ArtiFlare is made with care, passion, and attention to detail. Whether you're shopping for a birthday, anniversary, wedding, or just because, you'll find something special here.
    </p>
    <p className="mb-4">
      Our platform offers:
    </p>
    <ul className="list-disc pl-6 mb-4">
      <li>Handpicked, high-quality gifts from independent artisans</li>
      <li>Easy customization and personalization options</li>
      <li>Fast, reliable shipping—including same-day delivery for SOS Gifts</li>
      <li>Secure checkout and excellent customer support</li>
    </ul>
    <p>
      Thank you for supporting small businesses and choosing ArtiFlare for your gifting needs!
    </p>
  </div>
);

export default AboutPage; 