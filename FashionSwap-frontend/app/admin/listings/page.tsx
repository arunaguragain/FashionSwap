"use client";

import { useEffect, useState } from "react";
import { getAdminListings } from "@/lib/api/admin/listings";
import ListingsTable from "./_components/ListingsTable";

export default function Page() {
    const [listings, setListings] = useState([]);

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const result = await getAdminListings();
                setListings(result?.data || []);
            } catch (err) {
                console.error("Error fetching listings:", err);
            }
        };
        fetchListings();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Listing Management</h1>
                    <p className="text-sm text-gray-500">Manage all listings on the platform</p>
                </div>
                <div className="flex items-center gap-3">
                    <div id="listings-filters-host" className="flex items-center" />
                </div>
            </div>

            <ListingsTable initialListings={listings} />
        </div>
    );
}
