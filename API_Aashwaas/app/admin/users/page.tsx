import Link from "next/link";
import { handleGetUsers } from "@/lib/actions/admin/user-action";
import UsersTable from "./_components/UsersTable";

export default async function Page() {
    const result = await handleGetUsers();
    const users = result.success ? (result.data || []) : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
                    <p className="text-sm text-gray-500">Manage users and roles</p>
                </div>
                <div className="flex items-center gap-3">
                    <div id="users-filters-host" className="flex items-center" />
                    <Link
                        className="inline-flex items-center rounded-lg bg-blue-600 border border-transparent px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm"
                        href="/admin/users/create"
                    >
                        Create User
                    </Link>
                </div>
            </div>

            <UsersTable initialUsers={users} />
        </div>
    );
}