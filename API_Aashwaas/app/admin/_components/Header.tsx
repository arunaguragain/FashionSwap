"use client";

// use a plain <img> for the avatar so fallback and remote URLs render reliably
import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminHeader() {
	const { user } = useAuth();
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [query, setQuery] = useState(searchParams.get("q") ?? "");

	useEffect(() => {
		setQuery(searchParams.get("q") ?? "");
	}, [searchParams]);
	return (
		<header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur">
			<div className="mx-auto flex h-16 items-center justify-between px-4">
				<div className="flex items-center gap-4">
					<nav className="hidden items-center gap-4 text-sm font-medium text-gray-600 lg:flex">
						<div className="hidden lg:flex items-center gap-3 px-2">
							<div className="h-10 w-10 rounded-full overflow-hidden ring-2 ring-white shadow-sm flex-shrink-0">
								<img
									src={user?.avatar ?? '/images/user.png'}
									alt={user?.name ?? 'avatar'}
									className="w-full h-full object-cover"
								/>
							</div>
							<div className="flex flex-col text-sm text-gray-700">
								<span className="font-medium">Hello {user?.name ?? user?.fullName ?? user?.username ?? 'Admin'}</span>
								<span className="text-xs text-gray-500">{user?.email ?? ''}</span>
							</div>
						</div>
					</nav>
				</div>

				<div className="flex flex-1 items-center justify-center">
								<div className="w-full max-w-xl px-2">
									<form onSubmit={(e) => {
										e.preventDefault();
										const next = query.trim();
										const lc = next.toLowerCase();

										// route keywords -> admin pages
										let target: string | null = null;
										if (!lc) {
											// clear q on current page
											const params = new URLSearchParams(searchParams.toString());
											params.delete('q');
											const qs = params.toString();
											router.replace(qs ? `${pathname}?${qs}` : pathname);
											return;
										}

										if (lc === 'dashboard' || lc.includes('dash')) target = '/admin/dashboard';
										else if (lc.includes('donat')) target = '/admin/donations';
										else if (lc.includes('ngo') || lc.includes('organization') || lc.includes('org')) target = '/admin/ngos';
										else if (lc.includes('user') || lc.includes('users')) target = '/admin/users';
										else if (lc.includes('volunt') || lc.includes('volunteer')) target = '/admin/users';
										else if (lc.includes('task')) target = '/admin/tasks';
										else if (lc.includes('analytic')) target = '/admin/analytics';

										if (target) {
											// navigate to the matched page, keep query for context
											const url = `${target}?q=${encodeURIComponent(next)}`;
											router.push(url);
										} else {
											// fallback: update current page's q param
											const params = new URLSearchParams(searchParams.toString());
											params.set('q', next);
											const qs = params.toString();
											router.replace(qs ? `${pathname}?${qs}` : pathname);
										}
									}}>
										<label className="relative block">
											<span className="sr-only">Search</span>
											<span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
												<Search className="h-4 w-4" />
											</span>
											<input
												className="w-full rounded-full border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
												placeholder="Search users, donations, NGOs..."
												type="search"
												value={query}
												onChange={(e) => setQuery(e.target.value)}
											/>
										</label>
									</form>
								</div>
				</div>


				<div className="flex items-center gap-3">
					<Link
						href="/admin/ngos/create"
						className="hidden items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 min-w-[140px] text-sm font-semibold text-white hover:from-indigo-700 md:inline-flex"
					>
						<span className="text-center">Add NGO</span>
					</Link>

				</div>
			</div>
		</header>
	);
}
