import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ProfilePage from '@/app/user/_components/Profile';

describe('ProfilePage', () => {
  const baseProps = {
    name: 'Aruna Guragain',
    email: 'aruna@gmail.com',
    phone: '9800000000',
    address: 'Kathmandu, Nepal',
    role: 'Volunteer' as const,
    memberSince: '2022-01-01',
    impactPoints: 120,
    onEditProfile: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  test('renders profile information', () => {
    render(<ProfilePage {...baseProps} />);

    expect(screen.getByText('My Profile')).toBeInTheDocument();
    expect(screen.getByText('Aruna Guragain')).toBeInTheDocument();
    expect(screen.getByText('aruna@gmail.com')).toBeInTheDocument();
    expect(screen.getByText('9800000000')).toBeInTheDocument();
    expect(screen.getByText('Kathmandu, Nepal')).toBeInTheDocument();
    expect(screen.getByText(/Impact Points/)).toBeInTheDocument();
  });

  test('opens edit form when Edit Profile clicked', async () => {
    render(<ProfilePage {...baseProps} />);
    await userEvent.click(screen.getByRole('button', { name: /Edit Profile/i }));
    expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });

  test('shows quick actions when callbacks provided and triggers them', async () => {
    const onAddDonation = jest.fn();
    const onViewAnalytics = jest.fn();
    const onViewBadges = jest.fn();

    render(
      <ProfilePage
        {...baseProps}
        onAddDonation={onAddDonation}
        onViewAnalytics={onViewAnalytics}
        onViewBadges={onViewBadges}
      />
    );

    const addBtn = screen.getByRole('button', { name: /Add New Donation/i });
    await userEvent.click(addBtn);
    expect(onAddDonation).toHaveBeenCalled();

    const analyticsBtn = screen.getByRole('button', { name: /View Analytics/i });
    await userEvent.click(analyticsBtn);
    expect(onViewAnalytics).toHaveBeenCalled();

    const badgesBtn = screen.getByRole('button', { name: /View Badges/i });
    await userEvent.click(badgesBtn);
    expect(onViewBadges).toHaveBeenCalled();
  });

  test('displays marketplace seller and buyer stats when provided', () => {
    render(
      <ProfilePage
        {...baseProps}
        sellerRating={4.8}
        buyerRating={4.9}
        completedSales={24}
        successfulPurchases={15}
      />
    );

    expect(screen.getByText('Seller Rating')).toBeInTheDocument();
    expect(screen.getByText('4.8/5')).toBeInTheDocument();
    expect(screen.getByText('Buyer Rating')).toBeInTheDocument();
    expect(screen.getByText('4.9/5')).toBeInTheDocument();
    expect(screen.getByText('Completed Sales')).toBeInTheDocument();
    expect(screen.getByText('24')).toBeInTheDocument();
    expect(screen.getByText('Successful Purchases')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  test('renders correctly for Volunteer role and shows account details', () => {
    const volunteerProps = { ...baseProps, name: 'Volunteer Test', role: 'Volunteer' as const };
    render(<ProfilePage {...volunteerProps} />);

    expect(screen.getByText('Volunteer Test')).toBeInTheDocument();
    expect(screen.getByText(/Account Type:/)).toBeInTheDocument();
    expect(screen.getByText('Volunteer')).toBeInTheDocument();
  });
});
