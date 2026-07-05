import AddDonation from "../_components/add";

export default async function EditDonationPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const { id } = (await params) as { id: string };
  return <AddDonation donationId={id} />;
}
