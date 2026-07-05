"use client";
import React, { useEffect, useState } from "react";
import axios from "@/lib/api/axios";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProfileEditSchema, ProfileEditType } from "@/app/(platform)/profile/ProfileEditSchema";
import { useToast } from "@/app/(platform)/_components/ToastProvider";

export default function AdminProfilePage() {
  const auth = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editData, setEditData] = useState<{ name: string; email: string; phone: string; image?: File | null }>({ name: "", email: "", phone: "", image: null });
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileEditType>({
    resolver: zodResolver(ProfileEditSchema),
    defaultValues: { name: user?.name || "", email: user?.email || "", phone: user?.phone || user?.phoneNumber || "" },
  });

  const toastCtx = (() => {
    try { return useToast(); } catch (e) { return null; }
  })();
  const pushToast = toastCtx ? toastCtx.pushToast : undefined;

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

  const handleEditProfile = () => {
    reset({ name: user?.name || "", email: user?.email || "", phone: user?.phone || user?.phoneNumber || "" });
    setEditData({ name: user?.name || "", email: user?.email || "", phone: user?.phone || user?.phoneNumber || "", image: null });
    setEditing(false);
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

  const onFormSubmit = async (data: ProfileEditType) => {
    setEditLoading(true);
    setEditError("");
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("phoneNumber", data.phone);
      if (editData?.image) {
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
      <p className="mb-6 text-gray-500">Manage your account information</p>
      <div className="flex flex-wrap gap-6">
        <div className="bg-white rounded-lg shadow p-6 flex-1 min-w-[320px]">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-20 w-20">
              {editOpen ? (
                <>
                  <label htmlFor="admin-profile-image" className="cursor-pointer block">
                    {editData && editData.image ? (
                      <img
                        src={URL.createObjectURL(editData.image)}
                        alt="Profile Preview"
                        className="h-20 w-20 object-cover rounded-full"
                      />
                    ) : user && (user.profilePicture || user.image) ? (
                      <img
                        src={user.profilePicture ? `${(axios.defaults && (axios.defaults).baseURL ? (axios.defaults).baseURL : "http://localhost:5050")}/item_photos/${user.profilePicture}` : user.image}
                        alt="Profile"
                        className="h-20 w-20 object-cover rounded-full"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-600 to-sky-400 flex items-center justify-center text-white text-xl font-semibold">{user?.name ? user.name.split(" ").map((n: string) => n[0]).slice(0,2).join("") : "A"}</div>
                    )}
                  </label>
                  <input id="admin-profile-image" name="image" type="file" accept="image/*" onChange={handleEditChange} className="hidden" />
                </>
              ) : (
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-600 to-sky-400 flex items-center justify-center text-white text-xl font-semibold">
                  {user?.name ? user.name.split(" ").map((n: string) => n[0]).slice(0,2).join("") : "A"}
                </div>
              )}
            </div>
            <div>
              {editing ? (
                <input name="name" value={editData.name} onChange={handleEditChange} className="text-xl font-semibold border rounded px-2 py-1" />
              ) : (
                <div className="text-xl font-semibold">{user.name}</div>
              )}
              <div className="text-blue-600 font-medium">Administrator</div>
            </div>
          </div>

          <div className="mb-2 flex items-center gap-2">
            <span className="material-icons">email: </span>
            <span>{user.email}</span>
          </div>
          <div className="mb-2 flex items-center gap-2">
            <span className="material-icons">phone: </span>
            <span>{user.phone || user.phoneNumber}</span>
          </div>
          <div className="mb-2 flex items-center gap-2">
            <span className="material-icons">Member since </span>
            <span>{memberSince}</span>
          </div>

          {editOpen && (
            <form onSubmit={handleSubmit(onFormSubmit)} className="mb-4 p-4 border rounded bg-gray-50">
              <div>
                <label>Name</label>
                <input {...register("name")} className="w-full border rounded px-2 py-1 mt-1" />
                {errors.name && <div className="text-xs text-rose-600">{errors.name.message}</div>}
              </div>
              <div>
                <label>Email</label>
                <input {...register("email")} className="w-full border rounded px-2 py-1 mt-1" />
                {errors.email && <div className="text-xs text-rose-600">{errors.email.message}</div>}
              </div>
              <div>
                <label>Phone</label>
                <input {...register("phone")} className="w-full border rounded px-2 py-1 mt-1" />
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

        <div className="bg-white rounded-lg shadow p-6 min-w-55">
          <div className="font-semibold mb-2">Account Status</div>
          <div className="mb-1">Account Type: <span className="font-medium">Admin</span></div>
          <div className="mb-1">Verification: <span className="text-green-600">✔ Verified</span></div>
          <div className="mb-1">Member Since: <span>{memberSince}</span></div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 min-w-55 flex flex-col gap-2">
          <div className="font-semibold mb-2">Quick Actions</div>
          <button onClick={() => router.push('/admin/dashboard')} className="bg-purple-600 text-white px-4 py-2 rounded">Go to Home</button>
          <button onClick={() => router.push('/admin/users')} className="bg-gray-200 px-4 py-2 rounded">Manage Users</button>
          <button onClick={() => router.push('/admin/ngos')}  className="bg-gray-200 px-4 py-2 rounded">Manage NGOs</button>
        </div>
      </div>
    </div>
  );
}
