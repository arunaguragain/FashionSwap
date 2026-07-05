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

  test('displays donation statistics when provided', () => {
    render(<ProfilePage {...baseProps} totalDonations={5} itemsDonated={12} />);

    expect(screen.getByText('Total Donations')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Items Donated')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  test('renders correctly for Donor role and shows donor-specific stats', () => {
    const donorProps = { ...baseProps, name: 'Donor Test', role: 'Donor' as const, totalDonations: 10, itemsDonated: 3 };
    render(<ProfilePage {...donorProps} />);

    expect(screen.getByText('Donor Test')).toBeInTheDocument();
    expect(screen.getByText(/Account Type:/)).toBeInTheDocument();
    expect(screen.getByText('Donor')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
