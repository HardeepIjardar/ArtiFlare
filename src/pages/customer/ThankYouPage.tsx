import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ThankYouPage: React.FC = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5); // New state for countdown

  useEffect(() => {
    // Set up the interval to decrement the countdown
    const countdownInterval = setInterval(() => {
      setCountdown(prevCount => {
        if (prevCount <= 1) {
          clearInterval(countdownInterval); // Clear interval when countdown reaches 0
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000); // Update every 1 second

    // Set up the timeout for navigation
    const redirectTimer = setTimeout(() => {
      navigate('/'); // Redirect to home page
    }, 5000); // 5 seconds

    return () => {
      clearInterval(countdownInterval); // Clean up countdown interval
      clearTimeout(redirectTimer); // Clean up redirect timeout
    };
  }, [navigate]);

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-dark">
          Thank You for Shopping with Us!
        </h2>
        <p className="mt-2 text-dark-600">
          Your order has been placed successfully. You will receive a confirmation email shortly.
        </p>
        <p className="mt-2 text-sm text-dark-500">
          Redirecting to the homepage in {countdown} seconds...
        </p>
      </div>
    </div>
  );
};

export default ThankYouPage; 