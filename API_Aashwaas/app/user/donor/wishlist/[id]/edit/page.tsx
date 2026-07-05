import React from "react";
import WishlistForm from "../../_components/WishlistForm";

type Props = { params: { id: string } };

export default function EditWishlistPage({ params }: Props) {
  const { id } = params;
  return (
    <div className="p-0">
      <WishlistForm wishlistId={id} />
    </div>
  );
}
