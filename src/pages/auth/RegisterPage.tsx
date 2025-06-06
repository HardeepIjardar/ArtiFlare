import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createUser } from '../../services/firestore';
import { UserProfileSetup, PhoneAuth } from '../../components/auth';
import { User } from 'firebase/auth';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { UserType, FormErrors, RegistrationForm } from '../../types';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, googleLogin, currentUser } = useAuth();
  const [userType, setUserType] = useState<UserType>('buyer');
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  
  const [form, setForm] = useState<RegistrationForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    phoneNumber: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleUserTypeChange = (type: UserType) => {
    setUserType(type);
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    if (!form.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Validate artisan-specific fields if artisan is selected
    if (userType === 'artisan') {
      if (!form.companyName?.trim()) {
        newErrors.companyName = 'Shop/Company name is required';
      }
      
      if (!form.phoneNumber?.trim()) {
        newErrors.phoneNumber = 'Phone number is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getUserRole = async (user: User) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        return userDoc.data().role;
      }
      return 'customer'; // Default role if not found
    } catch (error) {
      console.error('Error fetching user role:', error);
      return 'customer'; // Default role on error
    }
  };

  const handleRedirect = async (user: User) => {
    const role = await getUserRole(user);
    if (role === 'artisan') {
      navigate('/artisan');
    } else {
      navigate('/');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      
      try {
        // Register user with Firebase Auth
        const result = await register(form.email, form.password, form.name);
        
        if (result.error) {
          setErrors({ form: result.error });
          setIsLoading(false);
        } else if (result.user) {
          // Create user document in Firestore with role
          await createUser(result.user.uid, {
            displayName: form.name,
            email: form.email,
            role: userType === 'buyer' ? 'customer' : 'artisan',
            companyName: userType === 'artisan' ? form.companyName : undefined,
            phoneNumber: userType === 'artisan' ? form.phoneNumber : undefined,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          });

          // Redirect based on role
          await handleRedirect(result.user);
          
          // Reset form fields
          setForm({
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            companyName: '',
            phoneNumber: ''
          });
        }
      } catch (error: any) {
        setErrors({ form: error.message || 'Registration failed' });
        setIsLoading(false);
      }
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    
    try {
      const result = await googleLogin();
      
      if (result.error) {
        setErrors({ form: result.error });
      } else if (result.user) {
        // Create user document in Firestore with role
        await createUser(result.user.uid, {
          displayName: result.user.displayName || '',
          email: result.user.email || '',
          role: userType === 'buyer' ? 'customer' : 'artisan',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });

        // Redirect based on role
        await handleRedirect(result.user);
      }
    } catch (error: any) {
      setErrors({ form: error.message || 'Google sign-up failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneAuthSuccess = async (user: User) => {
    try {
      setIsLoading(true);
      
      // Create user document in Firestore with role
      await createUser(user.uid, {
        displayName: form.name,
        phoneNumber: user.phoneNumber || undefined,
        role: userType === 'buyer' ? 'customer' : 'artisan',
        companyName: userType === 'artisan' ? form.companyName : undefined,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      // Redirect based on role
      await handleRedirect(user);
    } catch (error: any) {
      setErrors({ form: error.message || 'Failed to complete registration' });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (registrationComplete) {
    return <UserProfileSetup userType={userType === 'buyer' ? 'customer' : 'artisan'} />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row animate-fadeIn">
      {/* Left side - Image/Banner - Fixed, non-scrollable */}
      <div className="hidden md:block md:w-1/2 bg-primary animate-slideLeft fixed left-0 top-0 h-screen">
        <div className="h-full flex items-center justify-center p-12">
          <div className="max-w-md text-white">
            <h3 className="text-2xl font-bold mb-4">
              {userType === 'buyer' 
                ? 'Join Our Community of Art Enthusiasts' 
                : 'Start Selling Your Handcrafted Items'}
            </h3>
            <p className="text-white/80">
              {userType === 'buyer' 
                ? 'Discover unique handcrafted items and connect with skilled artisans from around the world.'
                : 'Showcase your creations to a community that values handmade quality and artistic expression.'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Right side - Form - Scrollable */}
      <div className="w-full md:w-1/2 md:ml-[50%] min-h-screen flex items-start justify-center p-8 md:p-16 overflow-y-auto">
        <div className="w-full max-w-md space-y-6 py-8">
          <div className="animate-slideDown">
            <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign up to begin your handcrafted journey
            </p>
          </div>
          
          {/* General form error */}
          {errors.form && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md animate-fadeIn">
              <p className="text-red-700 text-sm">{errors.form}</p>
            </div>
          )}

          {/* User Type Selection */}
          <div className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <div className="flex bg-gray-100 p-1 rounded-lg w-full">
              <button
                type="button"
                className={`flex-1 py-3 px-4 text-sm font-medium rounded-md transition-all duration-300 ease-in-out ${
                  userType === 'buyer'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => handleUserTypeChange('buyer')}
              >
                Join as Buyer
              </button>
              <button
                type="button"
                className={`flex-1 py-3 px-4 text-sm font-medium rounded-md transition-all duration-300 ease-in-out ${
                  userType === 'artisan'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => handleUserTypeChange('artisan')}
              >
                Join as Artisan
              </button>
            </div>
          </div>

          {authMethod === 'email' ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={`appearance-none relative block w-full px-4 py-3 border ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300`}
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className={`appearance-none relative block w-full px-4 py-3 border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300`}
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className={`appearance-none relative block w-full px-4 py-3 border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 pr-12`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-3 top-12 transform -translate-y-1/2 text-gray-400 hover:text-primary focus:outline-none"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={`appearance-none relative block w-full px-4 py-3 border ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 pr-12`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-3 top-12 transform -translate-y-1/2 text-gray-400 hover:text-primary focus:outline-none"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Artisan-specific fields */}
              {userType === 'artisan' && (
                <>
                  {/* Company Name */}
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                      Shop/Company Name
                    </label>
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      value={form.companyName}
                      onChange={handleChange}
                      className={`appearance-none relative block w-full px-4 py-3 border ${
                        errors.companyName ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300`}
                      placeholder="Your Shop Name"
                    />
                    {errors.companyName && (
                      <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={form.phoneNumber}
                      onChange={handleChange}
                      className={`appearance-none relative block w-full px-4 py-3 border ${
                        errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300`}
                      placeholder="+1 (555) 000-0000"
                    />
                    {errors.phoneNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
                    )}
                  </div>
                </>
              )}

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 disabled:opacity-70"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating account...
                    </span>
                  ) : (
                    'Create account'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={`appearance-none relative block w-full px-4 py-3 border ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300`}
                  placeholder="John Doe"
                  required
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {userType === 'artisan' && (
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    className={`appearance-none relative block w-full px-4 py-3 border ${
                      errors.companyName ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300`}
                    placeholder="Your Shop Name"
                    required
                  />
                  {errors.companyName && (
                    <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
                  )}
                </div>
              )}

              <PhoneAuth
                onSuccess={handlePhoneAuthSuccess}
                onError={(error: string) => setErrors({ form: error })}
                name={form.name}
              />
            </div>
          )}

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Google Sign-in Button */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 disabled:opacity-70"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
              </svg>
              Google
            </button>

            <button
              type="button"
              onClick={() => setAuthMethod(authMethod === 'email' ? 'phone' : 'email')}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 disabled:opacity-70"
            >
              {authMethod === 'email' ? (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  </svg>
                  Phone
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  Email
                </>
              )}
            </button>
          </div>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary-700 transition-colors duration-300">
              Sign in
            </Link>
          </p>
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

@keyframes slideLeft {
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-in-out forwards;
}

.animate-slideDown {
  animation: slideDown 0.5s ease-in-out forwards;
}

.animate-slideLeft {
  animation: slideLeft 0.5s ease-in-out forwards;
}
`;

// Add the style tag to the document
const styleTag = document.createElement('style');
styleTag.innerHTML = styles;
document.head.appendChild(styleTag);

export default RegisterPage; 