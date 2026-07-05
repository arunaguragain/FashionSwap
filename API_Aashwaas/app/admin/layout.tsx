import { ReactNode } from "react";
import AdminHeader from "./_components/Header";
import AdminSidebar from "./_components/Sidebar";
import ToastProvider from "@/app/(platform)/_components/ToastProvider";

export default function AdminLayout({ children }: { children: ReactNode }) {
	return (
		<div className="flex h-screen bg-gray-50">
			<AdminSidebar />
			<div className="flex min-w-0 flex-1 flex-col">
				<AdminHeader />
				<main className="flex-1 overflow-y-auto px-4 py-6">
					<ToastProvider>{children}</ToastProvider>
				</main>
			</div>
		</div>
	);
}
