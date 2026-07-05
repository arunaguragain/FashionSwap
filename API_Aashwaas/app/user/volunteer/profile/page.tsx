"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProfileEditSchema, ProfileEditType } from "@/app/(platform)/profile/ProfileEditSchema";
import axios from "@/lib/api/axios";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/(platform)/_components/ToastProvider";
import { fetchVolunteerTasks } from "@/lib/actions/volunteer/task-actions";


export default function VolunteerProfile() {
	const auth = useAuth();
	const router = useRouter();
	const [user, setUser] = React.useState<any>(null);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState("");
	const [editOpen, setEditOpen] = useState(false);
	const [editData, setEditData] = useState<{ name: string; email: string; phone: string; image?: File | null }>({ name: "", email: "", phone: "", image: null });
	const [editing, setEditing] = useState(false);
	const [editLoading, setEditLoading] = useState(false);
	const [editError, setEditError] = useState("");
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<ProfileEditType>({
		resolver: zodResolver(ProfileEditSchema),
		defaultValues: { name: user?.name || "", email: user?.email || "", phone: user?.phone || user?.phoneNumber || "" },
	});
    const toastCtx = (() => {
        try { return useToast(); } catch (e) { return null; }
    })();
    const pushToast = toastCtx ? toastCtx.pushToast : undefined;
	const onEdit = (data: ProfileEditType) => {
		// keep for compatibility but prefer onFormSubmit
		setEditOpen(false);
		reset(data);
	};

	const onFormSubmit = async (data: ProfileEditType) => {
		setEditLoading(true);
		setEditError("");
		try {
			const formData = new FormData();
			formData.append("name", data.name);
			formData.append("email", data.email);
			formData.append("phoneNumber", data.phone);
			if (editData?.image) formData.append("image", editData.image);
			const userId = user && (user._id || user.id);
			if (!userId) {
				setEditError("User ID not found. Cannot update profile.");
				setEditLoading(false);
				return;
			}
			const res = await import("@/lib/actions/auth-actions").then(m => m.handleUpdateProfile(userId, formData));
			if (res && res.success && (res.data?._id || res.data?.id)) {
				const updatedUser = { ...res.data, role: user.role } as any;
				setUser(updatedUser);
				try { auth.setUser && auth.setUser(updatedUser); } catch (e) {}
				reset({ name: updatedUser.name || "", email: updatedUser.email || "", phone: updatedUser.phone || updatedUser.phoneNumber || "" });
				setEditOpen(false);
				if (pushToast) pushToast({ title: 'Profile updated', tone: 'success' });
			} else {
				setEditError(res.message || "Failed to update profile");
				if (pushToast) pushToast({ title: 'Unable to update profile', description: res.message, tone: 'error' });
			}
		} catch (err: any) {
			setEditError(err?.response?.data?.message || err?.message || "Failed to update profile");
		}
		setEditLoading(false);
	};

	useEffect(() => {
		let mounted = true;
		async function fetchUser() {
			setLoading(true);
			setError("");
			try {
				const res = await import("@/lib/actions/auth-actions").then(m => m.handleWhoAmI());
				if (res.success) {
					if (mounted) setUser(res.data);
				} else {
					if (mounted) setError(res.message || "Failed to fetch user data");
				}
			} catch (err: any) {
				if (mounted) setError(err.message || "Failed to fetch user data");
			}
			if (mounted) setLoading(false);
		}

		if (auth.user) {
			setUser(auth.user);
			setLoading(false);
		} else {
			fetchUser();
		}

		return () => { mounted = false };
	}, [auth.user]);

	// Compute task aggregates client-side and merge into user state.
	useEffect(() => {
		let mounted = true;
		const computeTotals = async () => {
			if (!user) return;
			try {
				const volunteerId = user._id || user.id;
				let tasks: any[] = [];
				try {
					const allTasks = await fetchVolunteerTasks();
					if (Array.isArray(allTasks)) {
						tasks = allTasks.filter((t: any) => {
							const vid = t.volunteerId ?? t.volunteer ?? t.volunteer_id ?? t.user;
							if (!vid) return false;
							// Normalize possible object IDs (e.g. { _id: '...' } or { id: '...' })
							let vidValue: any = vid;
							if (typeof vid === "object" && vid !== null) {
								vidValue = vid._id ?? vid.id ?? (vid.toString ? vid.toString() : vid);
							}
							return String(vidValue) === String(volunteerId);
						});
					}
				} catch (e) {}
				const totalTasks = tasks.length;
				const completedTasks = tasks.filter((t: any) => t.status === "completed").length;
				const impactPoints = completedTasks * 10;
				if (mounted) {
					// Always preserve the role property
					const merged = { ...user, totalTasks, completedTasks, impactPoints, role: user.role };
					setUser(merged);
					try { auth.setUser && auth.setUser(merged); } catch (e) {}
				}
			} catch (err) {}
		};
		computeTotals();
		return () => { mounted = false };
	}, [user?._id, user?.id]);

	const handleEditProfile = () => {
		reset({ name: user?.name || "", email: user?.email || "", phone: user?.phone || user?.phoneNumber || "" });
		setEditData({
			name: user?.name || "",
			email: user?.email || "",
			phone: user?.phone || user?.phoneNumber || "",
			image: null,
		});
		setEditOpen(true);
	};

	const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, type, files } = e.target;
		if (type === "file") {
			setEditData({ ...editData, image: files && files[0] ? files[0] : null });
		} else {
			setEditData({ ...editData, [name]: value });
		}
	};

	const handleEditSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setEditLoading(true);
		setEditError("");
		try {
			const formData = new FormData();
			formData.append("name", editData.name);
			formData.append("email", editData.email);
			formData.append("phoneNumber", editData.phone);
			if (editData.image) {
				formData.append("image", editData.image);
			}
			const userId = user && (user._id || user.id);
			if (!userId) {
				setEditError("User ID not found. Cannot update profile.");
				setEditLoading(false);
				return;
			}
			const res = await import("@/lib/actions/auth-actions").then(m => m.handleUpdateProfile(userId, formData));
			if (res && res.success && (res.data?._id || res.data?.id)) {
				// Always preserve the role property after profile update
				const updatedUser = { ...res.data, role: user.role };
				setUser(updatedUser);
				try { auth.setUser && auth.setUser(updatedUser); } catch (e) {}
				setEditing(false);
			} else {
				setEditError(res.message || "Failed to update profile");
			}
		} catch (err: any) {
			setEditError(
				err?.response?.data?.message ||
				err?.message ||
				"Failed to update profile"
			);
		}
		setEditLoading(false);
	};

	if (loading) return <div>Loading...</div>;
	if (error) return <div className="text-red-600">{error}</div>;
	if (!user) return <div>No user data found.</div>;

	let memberSince = "";
	if (user.createdAt) {
		const date = new Date(user.createdAt);
		memberSince = date.toLocaleString("default", { month: "long", year: "numeric" });
	}

	return (
		<div className="p-0">
			<h1 className="text-3xl font-bold mb-2">My Profile</h1>
			<p className="mb-6 text-gray-500">Manage your account information and view your volunteering statistics</p>
			<div className="flex flex-wrap gap-6">
				{/* Profile Info */}
				<div className="bg-white rounded-lg shadow p-6 flex-1 min-w-[320px]">
					<div className="flex items-center gap-4 mb-4">
						<div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex flex-col items-center justify-center">
							{editOpen ? (
								<>
									<label htmlFor="volunteer-profile-image" className="cursor-pointer block">
										{editData && editData.image ? (
											<img
												src={URL.createObjectURL(editData.image)}
												alt="Profile Preview"
												className="w-20 h-20 object-cover object-center rounded-full aspect-square"
											/>
										) : user && user.profilePicture ? (
											<img
												src={`${(axios.defaults && (axios.defaults).baseURL ? (axios.defaults).baseURL : "http://localhost:5050")}/item_photos/${user.profilePicture}`}
												alt="Profile"
												className="w-20 h-20 object-cover object-center rounded-full aspect-square"
											/>
										) : user && user.image ? (
											<img
												src={user.image}
												alt="Profile"
												className="w-20 h-20 object-cover object-center rounded-full aspect-square"
											/>
										) : (
											<div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-400">No Image</div>
										)}
									</label>
									<input
										id="volunteer-profile-image"
										type="file"
										name="image"
										accept="image/*"
										onChange={handleEditChange}
										className="hidden"
									/>
								</>
							) : user.profilePicture ? (
								<img
									src={`${(axios.defaults && (axios.defaults).baseURL ? (axios.defaults).baseURL : "http://localhost:5050")}/item_photos/${user.profilePicture}`}
									alt="Profile"
									className="w-20 h-20 object-cover rounded-full"
								/>
							) : user.image ? (
								<img
									src={user.image}
									alt="Profile"
									className="w-20 h-20 object-cover rounded-full"
								/>
							) : null}
						</div>
						<div>
							{editing ? (
								<input name="name" value={editData.name} onChange={handleEditChange} className="text-xl font-semibold border rounded px-2 py-1" />
							) : (
								<div className="text-xl font-semibold">{user.name}</div>
							)}
							<div className="text-blue-600 font-medium">Verified Volunteer</div>
						</div>
					</div>
					<div className="mb-2 flex items-center gap-2">
						<span className="material-icons">email: </span>
						{editing ? (
							<input name="email" value={editData.email} onChange={handleEditChange} className="border rounded px-2 py-1" />
						) : (
							<span>{user.email}</span>
						)}
					</div>
					<div className="mb-2 flex items-center gap-2">
						<span className="material-icons">phone: </span>
						{editing ? (
							<input name="phone" value={editData.phone} onChange={handleEditChange} className="border rounded px-2 py-1" />
						) : (
							<span>{user.phone || user.phoneNumber}</span>
						)}
					</div>
					<div className="mb-2 flex items-center gap-2">
						<span className="material-icons">Volunteer since </span>
						<span>{memberSince}</span>
					</div>
					{editOpen && (
						<form onSubmit={handleSubmit(onFormSubmit)} className="mb-4 p-4 border rounded bg-gray-50">
							<div>
								<label>Name</label>
								<input {...register("name")}
									className="w-full border rounded px-2 py-1 mt-1" />
								{errors.name && <div className="text-xs text-rose-600">{errors.name.message}</div>}
							</div>
							<div>
								<label>Email</label>
								<input {...register("email")}
									className="w-full border rounded px-2 py-1 mt-1" />
								{errors.email && <div className="text-xs text-rose-600">{errors.email.message}</div>}
							</div>
							<div>
								<label>Phone</label>
								<input {...register("phone")}
									className="w-full border rounded px-2 py-1 mt-1" />
								{errors.phone && <div className="text-xs text-rose-600">{errors.phone.message}</div>}
							</div>
							<div className="flex gap-2 mt-2">
								<button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
								<button type="button" className="bg-gray-200 px-4 py-2 rounded" onClick={() => setEditOpen(false)}>Cancel</button>
							</div>
						</form>
					)}
					{!editOpen && (
						<button
							className="mt-4 inline-flex items-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
							onClick={handleEditProfile}
						>
							Edit Profile
						</button>
					)}
				</div>
				{/* Account Status */}
				<div className="bg-white rounded-lg shadow p-6 min-w-55">
					<div className="font-semibold mb-2">Account Status</div>
					<div className="mb-1">Account Type: <span className="font-medium">Volunteer</span></div>
					<div className="mb-1">Verification: <span className="text-green-600">✔ Verified</span></div>
					<div className="mb-1">Member Since: <span>{memberSince}</span></div>
					<div className="mb-1">Total Tasks: <span className="font-semibold">{user.totalTasks || 0}</span></div>
					<div className="mb-1">Tasks Completed: <span className="font-semibold">{user.completedTasks || 0}</span></div>
					<div>Total Impact: <span className="text-purple-600 font-semibold">{user.impactPoints || 0} pts</span></div>
				</div>
				{/* Quick Actions */}
				<div className="bg-white rounded-lg shadow p-6 min-w-55 flex flex-col gap-2">
					<div className="font-semibold mb-2">Quick Actions</div>
					<button onClick={() => router.push('/user/volunteer/dashboard')} className="bg-purple-600 text-white px-4 py-2 rounded">Go to Home</button>
					<button onClick={() => router.push('/user/volunteer/my-tasks')} className="bg-gray-200 px-4 py-2 rounded">View Tasks</button>
					<button onClick={() => router.push('/user/volunteer/ngos')}  className="bg-gray-200 px-4 py-2 rounded">View Ngo</button>
				</div>
			</div>
			{/* Impact This Year */}
			<div className="mt-8 bg-green-100 rounded-lg p-6 text-center">
				<div className="font-semibold mb-2">Your Impact this year</div>
				<div>Keep up the amazing work!</div>
				<div className="mt-2 text-green-700 text-xl font-bold">{user.impactPoints || 0} pts</div>
			</div>
		</div>
	);
}


