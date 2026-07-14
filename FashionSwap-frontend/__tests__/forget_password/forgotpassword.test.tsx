import React from 'react';
// mock next/navigation before importing component
const mockPush = jest.fn();
const mockGet = jest.fn() as jest.Mock<string | null, []>;
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: mockGet }),
}));

// mock API
jest.mock('@/lib/api/auth', () => ({
  forgotPassword: jest.fn(async (email: string) => ({ success: true }))
}));

import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ForgotPasswordForm from '@/app/(forget-password)/_components/ForgotPasswordForm';
import { forgotPassword } from '@/lib/api/auth';

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockReturnValue(null);
  });

  test('shows validation error for invalid email', async () => {
    render(<ForgotPasswordForm />);
    const submit = screen.getByRole('button', { name: /SEND LINK/i });
    await userEvent.click(submit);

    expect(await screen.findByText(/Enter a valid email/i)).toBeInTheDocument();
  });

  test('successful submit shows success message', async () => {
    (forgotPassword as jest.Mock).mockResolvedValueOnce({ success: true });
    render(<ForgotPasswordForm />);

    const input = screen.getByPlaceholderText(/Email Address/i);
    await userEvent.type(input, 'aruna@gmail.com');
    const submit = screen.getByRole('button', { name: /SEND LINK/i });
    await userEvent.click(submit);

    expect(await screen.findByText(/We have sent a reset link\./i)).toBeInTheDocument();
  });

  test('API failure shows error message', async () => {
    (forgotPassword as jest.Mock).mockRejectedValueOnce(new Error('Backend failed'));
    render(<ForgotPasswordForm />);

    const input = screen.getByPlaceholderText(/Email Address/i);
    await userEvent.type(input, 'aruna@gmail.com');
    const submit = screen.getByRole('button', { name: /SEND LINK/i });
    await userEvent.click(submit);

    expect(await screen.findByText(/Backend failed/i)).toBeInTheDocument();
  });

  test('Back to Login navigates to from param or /', async () => {
    mockGet.mockReturnValue('/login');
    render(<ForgotPasswordForm />);

    const back = screen.getByRole('button', { name: /Back to Login/i });
    await userEvent.click(back);

    expect(mockPush).toHaveBeenCalledWith('/login');

    // when no from param (render fresh and clear previous mock calls)
    jest.clearAllMocks();
    mockGet.mockReturnValue(null);
    // cleanup previous mounts to avoid duplicate buttons in DOM
    cleanup();
    render(<ForgotPasswordForm />);
    const back2 = screen.getByRole('button', { name: /Back to Login/i });
    await userEvent.click(back2);
    expect(mockPush).toHaveBeenCalledWith('/');
  });
});
