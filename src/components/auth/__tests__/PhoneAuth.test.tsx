import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PhoneAuth } from '../PhoneAuth';
import { useAuth } from '../../../contexts/AuthContext';
import { RecaptchaVerifier } from 'firebase/auth';
import { auth } from '../../../services/firebase';

// Mock the auth context
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock the firebase auth
jest.mock('firebase/auth', () => ({
  RecaptchaVerifier: jest.fn().mockImplementation(() => ({
    render: jest.fn().mockResolvedValue(undefined),
    clear: jest.fn(),
  })),
}));

// Mock fetch for location detection
global.fetch = jest.fn();

describe('PhoneAuth', () => {
  const mockPhoneLogin = jest.fn();
  const mockVerifyPhoneCode = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      phoneLogin: mockPhoneLogin,
      verifyPhoneCode: mockVerifyPhoneCode,
    });
    (global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({ country_code: 'US' }),
    });
  });

  it('renders phone number input initially', () => {
    render(<PhoneAuth onSuccess={mockOnSuccess} onError={mockOnError} />);
    
    expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Code/i })).toBeInTheDocument();
  });

  it('shows reCAPTCHA when phone input is focused', () => {
    render(<PhoneAuth onSuccess={mockOnSuccess} onError={mockOnError} />);
    
    const phoneInput = screen.getByLabelText(/Phone Number/i);
    fireEvent.focus(phoneInput);
    
    expect(screen.getByTestId('recaptcha-container')).toBeInTheDocument();
  });

  it('validates phone number format', async () => {
    render(<PhoneAuth onSuccess={mockOnSuccess} onError={mockOnError} />);
    
    const phoneInput = screen.getByLabelText(/Phone Number/i);
    fireEvent.change(phoneInput, { target: { value: '123' } });
    
    const sendButton = screen.getByRole('button', { name: /Send Code/i });
    fireEvent.click(sendButton);
    
    expect(screen.getByText('Please enter a valid 10-digit phone number')).toBeInTheDocument();
  });

  it('handles successful phone code sending', async () => {
    const mockConfirmationResult = { confirm: jest.fn() };
    mockPhoneLogin.mockResolvedValueOnce({ 
      error: null, 
      confirmationResult: mockConfirmationResult 
    });
    
    render(<PhoneAuth onSuccess={mockOnSuccess} onError={mockOnError} />);
    
    // Fill in phone number
    const phoneInput = screen.getByLabelText(/Phone Number/i);
    fireEvent.change(phoneInput, { target: { value: '1234567890' } });
    
    // Focus to trigger reCAPTCHA
    fireEvent.focus(phoneInput);
    
    // Simulate reCAPTCHA solved
    const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'normal',
      callback: () => {},
      'expired-callback': () => {},
    });
    (recaptchaVerifier as any).callback();
    
    // Send code
    const sendButton = screen.getByRole('button', { name: /Send Code/i });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(mockPhoneLogin).toHaveBeenCalledWith('+11234567890', expect.any(Object));
      expect(screen.getByLabelText(/Verification Code/i)).toBeInTheDocument();
    });
  });

  it('handles phone code sending error', async () => {
    mockPhoneLogin.mockResolvedValueOnce({ 
      error: 'Failed to send code' 
    });
    
    render(<PhoneAuth onSuccess={mockOnSuccess} onError={mockOnError} />);
    
    // Fill in phone number
    const phoneInput = screen.getByLabelText(/Phone Number/i);
    fireEvent.change(phoneInput, { target: { value: '1234567890' } });
    
    // Focus to trigger reCAPTCHA
    fireEvent.focus(phoneInput);
    
    // Simulate reCAPTCHA solved
    const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'normal',
      callback: () => {},
      'expired-callback': () => {},
    });
    (recaptchaVerifier as any).callback();
    
    // Send code
    const sendButton = screen.getByRole('button', { name: /Send Code/i });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to send code')).toBeInTheDocument();
    });
  });

  it('handles successful code verification', async () => {
    const mockConfirmationResult = { confirm: jest.fn() };
    mockPhoneLogin.mockResolvedValueOnce({ 
      error: null, 
      confirmationResult: mockConfirmationResult 
    });
    mockVerifyPhoneCode.mockResolvedValueOnce({ error: null });
    
    render(<PhoneAuth onSuccess={mockOnSuccess} onError={mockOnError} />);
    
    // Fill in phone number and send code
    const phoneInput = screen.getByLabelText(/Phone Number/i);
    fireEvent.change(phoneInput, { target: { value: '1234567890' } });
    fireEvent.focus(phoneInput);
    
    // Simulate reCAPTCHA solved
    const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'normal',
      callback: () => {},
      'expired-callback': () => {},
    });
    (recaptchaVerifier as any).callback();
    
    const sendButton = screen.getByRole('button', { name: /Send Code/i });
    fireEvent.click(sendButton);
    
    // Fill in verification code
    await waitFor(() => {
      const codeInput = screen.getByLabelText(/Verification Code/i);
      fireEvent.change(codeInput, { target: { value: '123456' } });
      
      const verifyButton = screen.getByRole('button', { name: /Verify Code/i });
      fireEvent.click(verifyButton);
    });
    
    await waitFor(() => {
      expect(mockVerifyPhoneCode).toHaveBeenCalledWith(expect.any(Object), '123456');
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('handles code verification error', async () => {
    const mockConfirmationResult = { confirm: jest.fn() };
    mockPhoneLogin.mockResolvedValueOnce({ 
      error: null, 
      confirmationResult: mockConfirmationResult 
    });
    mockVerifyPhoneCode.mockResolvedValueOnce({ error: 'Invalid code' });
    
    render(<PhoneAuth onSuccess={mockOnSuccess} onError={mockOnError} />);
    
    // Fill in phone number and send code
    const phoneInput = screen.getByLabelText(/Phone Number/i);
    fireEvent.change(phoneInput, { target: { value: '1234567890' } });
    fireEvent.focus(phoneInput);
    
    // Simulate reCAPTCHA solved
    const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'normal',
      callback: () => {},
      'expired-callback': () => {},
    });
    (recaptchaVerifier as any).callback();
    
    const sendButton = screen.getByRole('button', { name: /Send Code/i });
    fireEvent.click(sendButton);
    
    // Fill in verification code
    await waitFor(() => {
      const codeInput = screen.getByLabelText(/Verification Code/i);
      fireEvent.change(codeInput, { target: { value: '123456' } });
      
      const verifyButton = screen.getByRole('button', { name: /Verify Code/i });
      fireEvent.click(verifyButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Invalid code')).toBeInTheDocument();
      expect(mockOnError).toHaveBeenCalled();
    });
  });

  it('enables resend button after timer expires', async () => {
    jest.useFakeTimers();
    
    const mockConfirmationResult = { confirm: jest.fn() };
    mockPhoneLogin.mockResolvedValueOnce({ 
      error: null, 
      confirmationResult: mockConfirmationResult 
    });
    
    render(<PhoneAuth onSuccess={mockOnSuccess} onError={mockOnError} />);
    
    // Fill in phone number and send code
    const phoneInput = screen.getByLabelText(/Phone Number/i);
    fireEvent.change(phoneInput, { target: { value: '1234567890' } });
    fireEvent.focus(phoneInput);
    
    // Simulate reCAPTCHA solved
    const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'normal',
      callback: () => {},
      'expired-callback': () => {},
    });
    (recaptchaVerifier as any).callback();
    
    const sendButton = screen.getByRole('button', { name: /Send Code/i });
    fireEvent.click(sendButton);
    
    // Fast-forward timer
    jest.advanceTimersByTime(60000);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Resend Code/i })).not.toBeDisabled();
    });
    
    jest.useRealTimers();
  });

  it('detects user location and sets country code', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({ country_code: 'GB' }),
    });
    
    render(<PhoneAuth onSuccess={mockOnSuccess} onError={mockOnError} />);
    
    await waitFor(() => {
      expect(screen.getByText('+44')).toBeInTheDocument();
    });
  });
}); 