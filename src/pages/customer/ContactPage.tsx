import React from 'react';

const ContactPage: React.FC = () => (
  <div className="max-w-3xl mx-auto px-4 py-12">
    <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
    <p className="mb-4">
      We're here to help! If you have any questions, feedback, or need assistance, please reach out to us using the information below.
    </p>
    <ul className="mb-6">
      <li className="mb-2">
        <strong>Email:</strong> <a href="mailto:support@artiflare.com" className="text-primary underline">support@artiflare.com</a>
      </li>
      <li className="mb-2">
        <strong>Phone:</strong> <a href="tel:+1234567890" className="text-primary underline">+1 (234) 567-890</a>
      </li>
      <li className="mb-2">
        <strong>Address:</strong> 123 Artisan Lane, Creators City, CA 90000
      </li>
    </ul>
    <p className="mb-4">Or fill out the form below and we'll get back to you as soon as possible:</p>
    <form className="space-y-4 max-w-lg">
      <div>
        <label htmlFor="name" className="block font-medium mb-1">Name</label>
        <input id="name" name="name" type="text" className="w-full px-4 py-2 border rounded" required />
      </div>
      <div>
        <label htmlFor="email" className="block font-medium mb-1">Email</label>
        <input id="email" name="email" type="email" className="w-full px-4 py-2 border rounded" required />
      </div>
      <div>
        <label htmlFor="message" className="block font-medium mb-1">Message</label>
        <textarea id="message" name="message" rows={4} className="w-full px-4 py-2 border rounded" required />
      </div>
      <button type="submit" className="bg-primary text-white px-6 py-2 rounded font-semibold hover:bg-primary-700 transition">Send Message</button>
    </form>
  </div>
);

export default ContactPage; 