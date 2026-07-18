"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { handleLogout } from "@/lib/actions/auth-actions";
import Logo from "@/components/Logo";
import {
	LayoutDashboard,
	Package,
	Building2,
	Users,
	UserCog,
	ClipboardList,
	BarChart3,
	Settings,
	LogOut,
} from "lucide-react";

const navItems = [
	{ href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
	{ href: "/admin/users", label: "Users", icon: UserCog },
	{ href: "/admin/listings", label: "Listings", icon: Package },
	{ href: "/admin/orders", label: "Orders", icon: ClipboardList },
	{ href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export default function AdminSidebar() {
	const pathname = usePathname();
	const router = useRouter();

	const onLogout = async () => {
		const res = await handleLogout();
		if (res.success) {
			router.push("/login");
			return;
		}
	};

	return (
		<aside className="flex h-screen w-55 flex-col border-r border-gray-200 bg-white">
			<div className="px-4 py-6">
				<div className="flex flex-col items-start px-2">
					<Logo size="md" />
				</div>
			</div>

			<nav className="flex-1 px-5">
				<ul className="space-y-2">
					{navItems.map((item) => {
						const isActive = pathname === item.href;
						const Icon = item.icon;
						return (
							<li key={item.href}>
								<Link
									href={item.href}
									className={`flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium transition ${
										isActive
											? "bg-terracotta/10 text-terracotta"
											: "text-gray-700 hover:bg-gray-50"
									}`}
								>
									<Icon className="h-4 w-4" />
									{item.label}
								</Link>
							</li>
						);
					})}
				</ul>
			</nav>

			

			<div className="px-2 pb-6">
				<div className="border-t border-gray-200 pt-4" />
				<div className="space-y-1">
					<Link
						href="/admin/profile"
						className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
					>
						<Users className="h-4 w-4" /> Profile
					</Link>
					<button
						type="button"
						onClick={onLogout}
						className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
					>
						<LogOut className="h-4 w-4" /> Logout
					</button>
				</div>
			</div>
		</aside>
	);
}
