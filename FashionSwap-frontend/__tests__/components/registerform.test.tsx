import React from 'react';
// mock next/router before importing components that use it
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), prefetch: jest.fn() }),
}));

// mock the registration action
jest.mock('@/lib/actions/auth-actions', () => ({
  handleRegister: jest.fn(async () => ({ success: true })),
  handleVerifyEmail: jest.fn(async () => ({ success: true }))
}));

// mock GoogleSignIn
jest.mock('@/app/(auth)/_components/GoogleSignIn', () => {
  const React = require('react');
  return function MockGoogleSignIn() {
    return React.createElement('div', { 'data-testid': 'mock-google-signin' }, null);
  };
});

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import RegisterForm from '@/app/(auth)/_components/RegisterForm';
import { handleRegister } from '@/lib/actions/auth-actions';


describe('RegisterForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('submits valid data and navigates to login link for Seller', async () => {
    render(<RegisterForm userType="User" loginLink="/seller_login" />);

    await userEvent.type(screen.getByLabelText(/First name/i), 'Test');
    await userEvent.type(screen.getByLabelText(/Last name/i), 'User');
    await userEvent.type(screen.getByLabelText(/Email address/i), 'test@gmail.com');
    await userEvent.type(screen.getByLabelText(/Phone number/i), '9800000000');
    await userEvent.type(screen.getByLabelText(/Location/i), 'Kathmandu');
    await userEvent.type(screen.getByLabelText(/^Password$/i), 'Password123!');
    await userEvent.type(screen.getByLabelText(/Confirm password/i, { selector: 'input' }), 'Password123!');
    await userEvent.click(screen.getByLabelText(/I agree to the/i, { selector: 'input' }));

    const submit = screen.getByRole('button', { name: /Create Account/i });
    await userEvent.click(submit);

    // OTP UI should appear; enter code and verify
    expect(await screen.findByText(/A verification code was sent to/i)).toBeInTheDocument();
    await userEvent.type(screen.getByPlaceholderText(/123456/i), '123456');
    const verify = screen.getByRole('button', { name: /Verify/i });
    await userEvent.click(verify);

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/seller_login'));
  });

  test('shows validation errors when fields are empty', async () => {
    render(<RegisterForm userType="User" />);
    const submit = screen.getByRole('button', { name: /Create Account/i });
    await userEvent.click(submit);

    expect(await screen.findByText(/Enter your first name/i)).toBeInTheDocument();
    expect(await screen.findByText(/Enter your last name/i)).toBeInTheDocument();
    expect(await screen.findByText(/Enter a valid email/i)).toBeInTheDocument();
    expect(await screen.findByText(/Enter a valid phone number/i)).toBeInTheDocument();
    expect(await screen.findByText(/Enter your location/i)).toBeInTheDocument();
    expect(await screen.findByText(/Password must be at least 12 characters/i)).toBeInTheDocument();
    expect(await screen.findByText(/You must agree to the Terms & Conditions/i)).toBeInTheDocument();
  });

  test('shows a strong password indicator while typing', async () => {
    render(<RegisterForm userType="User" />);
    const passwordInput = screen.getByLabelText(/^Password$/i);

    await userEvent.type(passwordInput, 'StrongPass123!');

    expect(await screen.findByText(/Strong/i)).toBeInTheDocument();
  });

  test('shows invalid email message', async () => {
    render(<RegisterForm userType="User" />);
    await userEvent.type(screen.getByLabelText(/First name/i), 'Aruna');
    await userEvent.type(screen.getByLabelText(/Last name/i), 'Guragain');
    await userEvent.type(screen.getByLabelText(/Email address/i), 'not-an-email');
    await userEvent.type(screen.getByLabelText(/Phone number/i), '9840243065');
    await userEvent.type(screen.getByLabelText(/Location/i), 'Kathmandu');
    await userEvent.type(screen.getByLabelText(/^Password$/i), 'Password123!');
    await userEvent.type(screen.getByLabelText(/Confirm password/i, { selector: 'input' }), 'Password123!');
    await userEvent.click(screen.getByLabelText(/I agree to the/i, { selector: 'input' }));

    const submit = screen.getByRole('button', { name: /Create Account/i });
    await userEvent.click(submit);

    await waitFor(() => expect(handleRegister).not.toHaveBeenCalled());
  });

  test('shows password mismatch error', async () => {
    render(<RegisterForm userType="User" />);
    await userEvent.type(screen.getByLabelText(/First name/i), 'Aruna');
    await userEvent.type(screen.getByLabelText(/Last name/i), 'Guragain');
    await userEvent.type(screen.getByLabelText(/Email address/i), 'aruna@gmail.com');
    await userEvent.type(screen.getByLabelText(/Phone number/i), '9840243065');
    await userEvent.type(screen.getByLabelText(/Location/i), 'Kathmandu');
    await userEvent.type(screen.getByLabelText(/^Password$/i), 'Password123!');
    await userEvent.type(screen.getByLabelText(/Confirm password/i, { selector: 'input' }), 'Different123!');
    await userEvent.click(screen.getByLabelText(/I agree to the/i, { selector: 'input' }));

    const submit = screen.getByRole('button', { name: /Create Account/i });
    await userEvent.click(submit);

    expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();
  });
});
