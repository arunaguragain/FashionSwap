"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import type { NgoModel } from "@/app/admin/ngos/schemas";
import { AdminNGOsApi, resolveNgoPhotoUrl } from "@/lib/api/admin/ngos";


export default function AdminNGODetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [ngo, setNgo] = useState<NgoModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [photoOpen, setPhotoOpen] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("Missing NGO id.");
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);
    AdminNGOsApi.adminGetById(id)
      .then((result: { data: NgoModel }) => {
        if (!active) return;
        setNgo(result.data);
      })
      .catch(() => {
        if (!active) return;
        setError("Unable to load NGO details.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">Loading NGO...</div>;
  }

  if (error || !ngo) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 max-w-4xl mx-auto">
        <p className="text-sm text-gray-600">{error ?? "NGO not found."}</p>
        <Link href="/admin/ngos" className="mt-4 inline-flex text-sm font-semibold text-blue-600">
          Back to NGOs
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{ngo.name}</h1>
          <p className="text-sm text-gray-500">Registration: {ngo.registrationNumber}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/ngos/${ngo.id}/edit`}
            className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Edit
          </Link>
          <Link
            href="/admin/ngos"
            className="inline-flex items-center rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
          >
            Back to list
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="grid gap-0 md:[grid-template-columns:320px_1fr] items-start">
          <div className="max-w-[320px]">
            <h2 className="text-lg font-semibold text-gray-900">Contact</h2>
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <p>Contact person: {ngo.contactPerson}</p>
              <p>Email: {ngo.email}</p>
              <p>Phone: {ngo.phone}</p>
              <p>Address: {ngo.address}</p>
            </div>

            <div className="mt-4 border-t border-gray-100 pt-3">
              <h3 className="text-sm font-semibold text-gray-900">Details</h3>
              <div className="mt-3 space-y-2 text-sm text-gray-600">
                <p>Focus areas: {ngo.focusAreas?.length ? ngo.focusAreas.join(", ") : "N/A"}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">Photo</h2>
            <div className="mt-4">
              {ngo.image ? (
                <div className="rounded-lg overflow-hidden bg-slate-50 max-w-[720px] mx-auto">
                  <img
                    src={resolveNgoPhotoUrl(ngo.image)}
                    alt={`${ngo.name} photo preview`}
                    className="w-full h-96 object-cover cursor-pointer"
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-600">No photo available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}