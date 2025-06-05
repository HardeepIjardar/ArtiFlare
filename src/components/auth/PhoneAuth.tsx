import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { RecaptchaVerifier, User } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { PhoneAuthProps } from '../../types/auth';

// Country codes data with ISO codes for mapping
const countryCodes = [
  { code: '+1', country: 'US/Canada', iso: ['US', 'CA'] },
  { code: '+44', country: 'UK', iso: ['GB'] },
  { code: '+91', country: 'India', iso: ['IN'] },
  { code: '+61', country: 'Australia', iso: ['AU'] },
  { code: '+86', country: 'China', iso: ['CN'] },
  { code: '+81', country: 'Japan', iso: ['JP'] },
  { code: '+49', country: 'Germany', iso: ['DE'] },
  { code: '+33', country: 'France', iso: ['FR'] },
  { code: '+39', country: 'Italy', iso: ['IT'] },
  { code: '+34', country: 'Spain', iso: ['ES'] },
  { code: '+55', country: 'Brazil', iso: ['BR'] },
  { code: '+52', country: 'Mexico', iso: ['MX'] },
  { code: '+27', country: 'South Africa', iso: ['ZA'] },
  { code: '+971', country: 'UAE', iso: ['AE'] },
  { code: '+966', country: 'Saudi Arabia', iso: ['SA'] },
  { code: '+65', country: 'Singapore', iso: ['SG'] },
  { code: '+60', country: 'Malaysia', iso: ['MY'] },
  { code: '+62', country: 'Indonesia', iso: ['ID'] },
  { code: '+63', country: 'Philippines', iso: ['PH'] },
  { code: '+84', country: 'Vietnam', iso: ['VN'] },
];

export const PhoneAuth: React.FC<PhoneAuthProps> = ({ onSuccess, onError, name }) => {
  const { phoneLogin, verifyPhoneCode } = useAuth();
  const [selectedCountryCode, setSelectedCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(true);
  const [showRecaptcha, setShowRecaptcha] = useState(false);
  const [recaptchaSolved, setRecaptchaSolved] = useState(false);
  const [resendAvailable, setResendAvailable] = useState(false);
  const [timer, setTimer] = useState(60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const [codeStep, setCodeStep] = useState(false);

  // Initialize reCAPTCHA when component mounts
  useEffect(() => {
    if (showRecaptcha && recaptchaContainerRef.current && !recaptchaVerifierRef.current) {
      try {
        // Create new reCAPTCHA verifier
        recaptchaVerifierRef.current = new RecaptchaVerifier(
          auth,
          recaptchaContainerRef.current,
          {
            size: 'normal',
            callback: () => {
              setRecaptchaSolved(true);
              setError(null);
            },
            'expired-callback': () => {
              setRecaptchaSolved(false);
              setError('reCAPTCHA expired. Please try again.');
              if (recaptchaVerifierRef.current) {
                recaptchaVerifierRef.current.clear();
                recaptchaVerifierRef.current = null;
              }
            },
          }
        );

        // Render the reCAPTCHA widget
        recaptchaVerifierRef.current.render().catch((err) => {
          console.error('reCAPTCHA render error:', err);
          setError('Failed to initialize reCAPTCHA. Please refresh the page.');
          if (recaptchaVerifierRef.current) {
            recaptchaVerifierRef.current.clear();
            recaptchaVerifierRef.current = null;
          }
        });
      } catch (err) {
        console.error('reCAPTCHA initialization error:', err);
        setError('Failed to initialize reCAPTCHA. Please refresh the page.');
        if (recaptchaVerifierRef.current) {
          recaptchaVerifierRef.current.clear();
          recaptchaVerifierRef.current = null;
        }
      }
    }
    return () => {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    };
  }, [showRecaptcha]);

  // Detect user's location and set country code
  useEffect(() => {
    const detectUserLocation = async () => {
      try {
        // First try to get location from IP using ipapi.co
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data.country_code) {
          const countryCode = getCountryCodeFromISO(data.country_code);
          setSelectedCountryCode(countryCode);
        }
      } catch (error) {
        console.error('Error detecting location:', error);
        // Fallback to browser's geolocation if IP detection fails
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                const { latitude, longitude } = position.coords;
                const response = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                );
                const data = await response.json();
                
                if (data.address?.country_code) {
                  const countryCode = getCountryCodeFromISO(data.address.country_code);
                  setSelectedCountryCode(countryCode);
                }
              } catch (error) {
                console.error('Error getting country from coordinates:', error);
              }
            },
            (error) => {
              console.error('Error getting geolocation:', error);
            }
          );
        }
      } finally {
        setIsDetectingLocation(false);
      }
    };

    detectUserLocation();
  }, []);

  // Function to get country code from ISO code
  const getCountryCodeFromISO = (isoCode: string): string => {
    const country = countryCodes.find(country => 
      country.iso.includes(isoCode.toUpperCase())
    );
    return country?.code || '+1'; // Default to US/Canada if not found
  };

  const validatePhoneNumber = (number: string): boolean => {
    // Basic phone number validation (adjust regex based on your needs)
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(number);
  };

  const handlePhoneFocus = () => {
    setShowRecaptcha(true);
    setError(null);
  };

  const handleSendCode = async (e: React.FormEvent, isResend = false) => {
    e.preventDefault();
    setError(null);

    // Validate phone number
    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    // If reCAPTCHA is not shown, show it and return
    if (!showRecaptcha) {
      setShowRecaptcha(true);
      setResendAvailable(false);
      setCodeStep(true);
      return;
    }

    // If this is a resend, recreate reCAPTCHA
    if (isResend) {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
      setResendAvailable(false);
      setShowRecaptcha(true);
      setCodeStep(true);
      return;
    }

    setIsLoading(true);
    setCodeStep(true);

    try {
      if (!recaptchaVerifierRef.current) {
        throw new Error('reCAPTCHA not initialized');
      }

      const fullPhone = `${selectedCountryCode}${phoneNumber}`;
      
      // Ensure reCAPTCHA is solved before proceeding
      if (!recaptchaSolved) {
        throw new Error('Please complete the reCAPTCHA verification');
      }

      // Reset reCAPTCHA state before sending code
      setRecaptchaSolved(false);
      
      // Clear any existing reCAPTCHA
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
      }

      // Create new reCAPTCHA verifier for this attempt
      recaptchaVerifierRef.current = new RecaptchaVerifier(
        auth,
        recaptchaContainerRef.current!,
        {
          size: 'normal',
          callback: () => {
            setRecaptchaSolved(true);
            setError(null);
          },
          'expired-callback': () => {
            setRecaptchaSolved(false);
            setError('reCAPTCHA expired. Please try again.');
            if (recaptchaVerifierRef.current) {
              recaptchaVerifierRef.current.clear();
              recaptchaVerifierRef.current = null;
            }
          },
        }
      );

      // Render the reCAPTCHA widget
      await recaptchaVerifierRef.current.render();
      
      const confirmation = await phoneLogin(fullPhone, recaptchaVerifierRef.current);
      
      if (confirmation.error) {
        throw new Error(confirmation.error);
      }

      setConfirmationResult(confirmation.confirmationResult);
      setResendAvailable(false);
      setTimer(60);
      
      // Start the resend timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            setResendAvailable(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err: any) {
      const message = err.message || '';
      if (
        err.code === 'auth/invalid-app-credential' ||
        err.code === 'auth/timeout' ||
        message.toLowerCase().includes('timeout') ||
        message.toLowerCase().includes('expired')
      ) {
        // Reset reCAPTCHA on invalid credential
        setShowRecaptcha(false);
        setRecaptchaSolved(false);
        if (recaptchaVerifierRef.current) {
          recaptchaVerifierRef.current.clear();
          recaptchaVerifierRef.current = null;
        }
        setError('reCAPTCHA verification failed. Please try again.');
        return;
      }
      setError(message || 'Failed to send verification code');
      onError?.(message || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!confirmationResult) {
        throw new Error('No confirmation result available');
      }

      const result = await verifyPhoneCode(confirmationResult, verificationCode);
      
      if (result.error) {
        setError(result.error);
        onError?.(result.error);
      } else if (result.user) {
        onSuccess?.(result.user);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to verify code';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={confirmationResult ? handleVerifyCode : (e) => handleSendCode(e, false)} className="space-y-6">
        {!confirmationResult ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="flex gap-2">
                <select
                  value={selectedCountryCode}
                  onChange={e => setSelectedCountryCode(e.target.value)}
                  className="w-28 px-3 py-3 border rounded-lg"
                >
                  {countryCodes.map(c => (
                    <option key={c.code} value={c.code}>{c.code} ({c.country})</option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  onFocus={handlePhoneFocus}
                  placeholder="1234567890"
                  className="flex-1 px-4 py-3 border rounded-lg"
                  required
                  pattern="[0-9]{10}"
                  title="Please enter a 10-digit phone number"
                />
              </div>
            </div>
            {showRecaptcha && (
              <div 
                ref={recaptchaContainerRef} 
                className="mb-4 flex justify-center" 
                style={{ minHeight: '78px', width: '100%' }}
              />
            )}
            <button
              type="submit"
              disabled={isLoading || !phoneNumber || !recaptchaSolved}
              className="w-full py-3 rounded-lg bg-primary text-white disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
              <input
                type="text"
                value={verificationCode}
                onChange={e => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                className="w-full px-4 py-3 border rounded-lg"
                required
                maxLength={6}
                pattern="[0-9]{6}"
                title="Please enter the 6-digit verification code"
              />
              <div className="flex justify-end mt-1">
                {!resendAvailable ? (
                  <span className="text-gray-500 text-sm">Resend code in {timer}s</span>
                ) : (
                  <button
                    type="button"
                    className="text-primary underline text-sm"
                    onClick={(e) => handleSendCode(e, true)}
                  >
                    Resend code
                  </button>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading || !verificationCode}
              className="w-full py-3 rounded-lg bg-primary text-white disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </button>
          </>
        )}
        {error && (
          <div className="text-red-500 text-sm mt-2">
            {error}
          </div>
        )}
      </form>
    </div>
  );
};

// Add type declaration for window object
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | null;
  }
} 