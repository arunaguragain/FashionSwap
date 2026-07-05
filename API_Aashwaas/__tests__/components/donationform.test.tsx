import React from 'react';
// mock next/navigation before importing components that use it
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), prefetch: jest.fn() }),
  useSearchParams: () => ({ get: () => null }),
  useParams: () => ({}),
}));


(global as any).URL.createObjectURL = jest.fn(() => 'blob:mock');

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import DonationForm from '@/app/user/donor/donation/_components/DonationForm';

describe('DonationForm validation', () => {
  beforeEach(() => jest.clearAllMocks());

  test('shows per-field validation messages when submitting empty form', async () => {
    render(<DonationForm />);

    // the file input is `required` — upload a small dummy file so the form submit proceeds
    const fileInput = screen.getByLabelText(/Upload Image/i, { selector: 'input' });
    const file = new File(['dummy'], 'photo.png', { type: 'image/png' });
    await userEvent.upload(fileInput, file);

    const submit = screen.getByRole('button', { name: /Add Donation/i });
    await userEvent.click(submit);

    expect(await screen.findByText(/Item name is required\./i)).toBeInTheDocument();
    expect(await screen.findByText(/Quantity must be a number\./i)).toBeInTheDocument();
    expect(await screen.findByText(/Pickup location is required\./i)).toBeInTheDocument();
  });
});