"use client";
import { Controller, useForm } from "react-hook-form";
import { UserData, UserSchema } from "@/app/admin/users/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState, useTransition } from "react";
import { useToast } from "@/app/(platform)/_components/ToastProvider";
import { handleCreateUser } from "@/lib/actions/admin/user-action";
import { useRouter } from "next/navigation";
export default function CreateUserForm() {

    const router = useRouter();
    const { pushToast } = useToast();

    const [pending, startTransition] = useTransition();
    const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<UserData>({
        resolver: zodResolver(UserSchema),
        defaultValues: {
            role: "donor"
        }
    });
    const roleOptions = [
        { value: "admin", label: "Admin" },
        { value: "donor", label: "Donor" },
        { value: "volunteer", label: "Volunteer" },
    ];
    const [error, setError] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (file: File | undefined, onChange: (file: File | undefined) => void) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setPreviewImage(null);
        }
        onChange(file);
    };

    const handleDismissImage = (onChange?: (file: File | undefined) => void) => {
        setPreviewImage(null);
        onChange?.(undefined);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const onSubmit = async (data: UserData) => {
        setError(null);
        startTransition(async () => {
            try {
                const formData = new FormData();
                formData.append('name', data.name);
                formData.append('email', data.email);
                formData.append('phone', data.phone);
                formData.append('password', data.password);
                formData.append('confirmPassword', data.confirmPassword);
                formData.append('role', data.role);
                if (data.image) {
                    formData.append('image', data.image);
                }
                const response = await handleCreateUser(formData);
                if (!response.success) {
                    throw new Error(response.message || 'Create profile failed');
                }
                reset();
                handleDismissImage();
                pushToast({ title: 'User created', description: 'Profile created successfully', tone: 'success' });
                // navigate to users list after successful creation
                router.push('/admin/users');
            } catch (error: Error | any) {
                pushToast({ title: 'Unable to create user', description: error.message || 'Create profile failed', tone: 'error' });
                setError(error.message || 'Create profile failed');
            }
        });

    };
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Create User</h1>
                    <p className="text-sm text-gray-500">Add a new user to the system</p>
                </div>
                <div className="w-40">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                        className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                        {...register("role")}
                    >
                        {roleOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                    {errors.role && <p className="text-xs text-red-600">{errors.role.message}</p>}
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                        {previewImage ? (
                            <div className="relative w-24 h-24">
                                <img
                                    src={previewImage}
                                    alt="Profile Image Preview"
                                    className="w-24 h-24 rounded-full object-cover"
                                />
                                <Controller
                                    name="image"
                                    control={control}
                                    render={({ field: { onChange } }) => (
                                        <button
                                            type="button"
                                            onClick={() => handleDismissImage(onChange)}
                                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                                        >
                                            ✕
                                        </button>
                                    )}
                                />
                            </div>
                        ) : (
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                                <img src="/images/user.png" alt="placeholder" className="w-12 h-12" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                        <Controller
                            name="image"
                            control={control}
                            render={({ field: { onChange } }) => (
                                <div className="flex items-center gap-3">
                                    <label className="inline-flex items-center rounded-md bg-white px-3 py-2 border border-gray-300 text-sm text-gray-700 cursor-pointer hover:bg-gray-50">
                                        Upload Image
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            onChange={(e) => handleImageChange(e.target.files?.[0], onChange)}
                                            accept=".jpg,.jpeg,.png,.webp"
                                            className="hidden"
                                        />
                                    </label>
                                    {previewImage && (
                                        <button type="button" onClick={() => handleDismissImage(onChange)} className="text-sm text-red-600">Remove</button>
                                    )}
                                </div>
                            )}
                        />
                        {errors.image && <p className="text-sm text-red-600">{errors.image.message}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700" htmlFor="name">Full name</label>
                        <input
                            id="name"
                            type="text"
                            autoComplete="name"
                            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500"
                            {...register("name")}
                            placeholder="Rajesh Kumar"
                        />
                        {errors.name?.message && (
                            <p className="text-xs text-red-600">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700" htmlFor="phone">Phone</label>
                        <input
                            id="phone"
                            type="tel"
                            autoComplete="tel"
                            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500"
                            {...register("phone")}
                            placeholder="9800000000"
                        />
                        {errors.phone?.message && (
                            <p className="text-xs text-red-600">{errors.phone.message}</p>
                        )}
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700" htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500"
                        {...register("email")}
                        placeholder="you@example.com"
                    />
                    {errors.email?.message && (
                        <p className="text-xs text-red-600">{errors.email.message}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500"
                            {...register("password")}
                            placeholder="••••••"
                        />
                        {errors.password?.message && (
                            <p className="text-xs text-red-600">{errors.password.message}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700" htmlFor="confirmPassword">Confirm password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500"
                            {...register("confirmPassword")}
                            placeholder="••••••"
                        />
                        {errors.confirmPassword?.message && (
                            <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={isSubmitting || pending}
                        className="h-11 flex-1 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
                    >
                        {isSubmitting || pending ? "Creating account..." : "Create account"}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push('/admin/users')}
                        className="h-11 flex-1 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    
                </div>
            </form>
        </div>
    );
}