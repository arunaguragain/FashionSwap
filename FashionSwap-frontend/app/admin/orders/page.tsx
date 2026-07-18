"use client";

import { useEffect, useState } from "react";
import { getAdminOrders } from "@/lib/api/admin/orders";
import OrdersTable from "./_components/OrdersTable";

export default function Page() {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const result = await getAdminOrders();
                setOrders(result?.data || []);
            } catch (err) {
                console.error("Error fetching orders:", err);
            }
        };
        fetchOrders();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Order Management</h1>
                    <p className="text-sm text-gray-500">Manage all transactions on the platform</p>
                </div>
                <div className="flex items-center gap-3">
                    <div id="orders-filters-host" className="flex items-center" />
                </div>
            </div>

            <OrdersTable initialOrders={orders} />
        </div>
    );
}
