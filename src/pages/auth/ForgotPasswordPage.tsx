import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { resetUserPassword } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Get email from location state if available
  useEffect(() => {
    const state = location.state as { email?: string };
    if (state?.email) {
      setEmail(state.email);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const { success, error } = await resetUserPassword(email);
      
      if (error) {
        setError(error);
        return;
      }
      
      if (success) {
        setSubmitted(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row animate-fadeIn">
      {/* Left side - Form - Scrollable */}
      <div className="w-full md:w-1/2 min-h-screen flex items-start justify-center p-8 md:p-16 overflow-y-auto">
        <div className="w-full max-w-md space-y-8 py-8">
          <div className="animate-slideDown">
            <h2 className="text-3xl font-bold text-gray-900">Reset your password</h2>
            <p className="mt-2 text-sm text-gray-600">
              We'll send you instructions to reset your password
            </p>
          </div>
          
          {!submitted ? (
            <>
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md animate-fadeIn">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
              
              <form className="mt-8 space-y-6 animate-fadeIn" style={{ animationDelay: '0.1s' }} onSubmit={handleSubmit}>
                <div className="transform transition duration-300 ease-in-out hover:translate-y-[-2px]">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 ease-in-out focus:shadow-md"
                    placeholder="name@example.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 ease-in-out transform hover:translate-y-[-2px] hover:shadow-lg disabled:opacity-70 active:translate-y-[1px]"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending link...
                    </span>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-8 animate-scaleIn">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary-50 flex items-center justify-center animate-pulse">
                <svg
                  className="h-8 w-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900 animate-fadeIn" style={{ animationDelay: '0.2s' }}>Check your email</h3>
              <p className="mt-2 text-sm text-gray-600 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                We've sent a password reset link to <span className="font-medium">{email}</span>
              </p>
              <div className="mt-8 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                <button
                  onClick={() => setSubmitted(false)}
                  className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 ease-in-out transform hover:translate-y-[-2px] hover:shadow-md active:translate-y-[1px]"
                >
                  Resend Email
                </button>
              </div>
              <p className="mt-4 text-sm text-gray-600 animate-fadeIn" style={{ animationDelay: '0.5s' }}>
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-primary hover:text-primary-700 font-medium transition-colors duration-300 hover:underline"
                >
                  try another email address
                </button>
              </p>
            </div>
          )}

          <div className="border-t border-gray-200 pt-6 animate-fadeIn" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center justify-center">
              <div className="text-sm">
                <Link to="/login" className="text-primary hover:text-primary-700 font-medium flex items-center transition-all duration-300 ease-in-out transform hover:translate-x-[-4px]">
                  <svg className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-[-2px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Image/Banner - Fixed, non-scrollable */}
      <div className="hidden md:block w-1/2 bg-primary min-h-screen">
        <div className="h-full flex items-center justify-center p-12">
          <div className="max-w-md text-white">
            <h3 className="text-2xl font-bold mb-4">Password Recovery</h3>
            <p className="text-white/80">
              Don't worry, it happens to the best of us. Once you reset your password,
              you'll be back to exploring unique handcrafted treasures in no time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add these keyframe animations to the component file
const styles = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideDown {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes slideRight {
  from { transform: translateX(20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-in-out forwards;
}

.animate-slideDown {
  animation: slideDown 0.5s ease-in-out forwards;
}

.animate-slideRight {
  animation: slideRight 0.5s ease-in-out forwards;
}

.animate-scaleIn {
  animation: scaleIn 0.5s ease-in-out forwards;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
`;

// Add the style tag to the document
const styleTag = document.createElement('style');
styleTag.innerHTML = styles;
document.head.appendChild(styleTag);

export default ForgotPasswordPage; 