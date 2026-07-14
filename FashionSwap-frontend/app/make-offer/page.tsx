import MakeOfferClient from './MakeOfferClient';

interface MakeOfferPageProps {
  searchParams: { listingId?: string };
}

export default function MakeOfferPage({ searchParams }: MakeOfferPageProps) {
  const listingId = searchParams.listingId ?? '';

  return <MakeOfferClient listingId={listingId} />;
}
