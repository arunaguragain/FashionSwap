import React from 'react';
// mock next/navigation before importing components that use it
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), prefetch: jest.fn() }),
}));

// mock the login action
jest.mock('@/lib/actions/auth-actions', () => ({
  handleLogin: jest.fn(async () => ({ success: true, data: { role: 'volunteer' } }))
}));

// mock GoogleSignIn so we can inspect props without spreading unknown attributes
let lastGoogleProps: any = null;
jest.mock('@/app/(auth)/_components/GoogleSignIn', () => {
  const React = require('react');
  return function MockGoogleSignIn(props: any) {
    lastGoogleProps = props;
    return React.createElement('div', { 'data-testid': 'mock-google-signin' });
  };
});

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import LoginForm from '@/app/(auth)/_components/LoginForm';
import { handleLogin } from '@/lib/actions/auth-actions';

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    lastGoogleProps = null;
  });

  test('successful login navigates based on role (volunteer)', async () => {
    (handleLogin as jest.Mock).mockResolvedValueOnce({ success: true, data: { role: 'volunteer' } });
    render(<LoginForm userType="Volunteer" />);

    await userEvent.type(screen.getByLabelText(/Email Address/i), 'volunteer@example.com');
    await userEvent.type(screen.getByLabelText(/Password/i, { selector: 'input' }), 'Password123!');

    const submit = screen.getByRole('button', { name: /Sign In/i });
    await userEvent.click(submit);

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/user/volunteer/dashboard'));
  });

  test('shows validation errors when fields are empty', async () => {
    render(<LoginForm userType="Volunteer" />);
    const submit = screen.getByRole('button', { name: /Sign In/i });
    await userEvent.click(submit);

    expect(await screen.findByText(/Enter a valid email/i)).toBeInTheDocument();
    expect(await screen.findByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
  });

  test('invalid email prevents submission', async () => {
    render(<LoginForm userType="Volunteer" />);
    await userEvent.type(screen.getByLabelText(/Email Address/i), 'not-an-email');
    await userEvent.type(screen.getByLabelText(/Password/i, { selector: 'input' }), 'Password123!');

    const submit = screen.getByRole('button', { name: /Sign In/i });
    await userEvent.click(submit);

    await waitFor(() => expect(handleLogin).not.toHaveBeenCalled());
  });

  test('GoogleSignIn is rendered with autoLogin prop', () => {
    // enable the google signin button via prop
    render(<LoginForm userType="Volunteer" showGoogleSignIn />);
    const google = screen.getByTestId('mock-google-signin');
    expect(google).toBeInTheDocument();
    // verify props received by the mocked component
    expect(lastGoogleProps).toBeTruthy();
    expect(lastGoogleProps.autoLogin).toBe(true);
    expect(lastGoogleProps.userType).toBe('Volunteer');
  });
});
