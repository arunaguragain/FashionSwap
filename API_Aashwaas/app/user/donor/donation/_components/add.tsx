"use client";

import DonationForm from "./DonationForm";

type AddDonationProps = { donationId?: string };

export default function AddDonation({ donationId }: AddDonationProps) {
  return <DonationForm donationId={donationId} />;
}

