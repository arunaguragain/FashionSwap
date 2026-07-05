"use client";

import Card from "./Card";
import Badge from "./Badge";
import { resolveNgoPhotoUrl } from "@/lib/api/admin/ngos";

type Ngo = {
  id?: string;
  name?: string;
  address?: string;
  image?: string;
  [key: string]: any;
};

export default function NgoCard({ ngo }: { ngo: Ngo }) {
  const img = resolveNgoPhotoUrl(ngo?.image || ngo?.photo || "");
  return (
    <Card noPadding className="overflow-hidden">
        <div className="relative h-40 w-full rounded-md overflow-hidden mb-3 bg-slate-50">
          {img ? (
            <img
              src={img}
              alt={ngo?.name || "ngo"}
              loading="lazy"
              onError={(e) => {
                const imgEl = e.currentTarget as HTMLImageElement;
                if (!(imgEl.dataset as any).triedRelative) {
                  (imgEl.dataset as any).triedRelative = "1";
                  imgEl.src = `/item_photos/${ngo?.image || ngo?.photo}`;
                  return;
                }
                imgEl.src = "/images/user.png";
              }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className={`absolute inset-0 bg-amber-100 flex items-center justify-center`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="feather feather-home">
                <path d="M3 9l9-6 9 6"></path>
                <path d="M9 22V12h6v10"></path>
              </svg>
            </div>
          )}

          <span className="absolute left-4 top-4 inline-flex items-center rounded-md bg-white/80 px-2 py-0.5 text-xs font-semibold text-slate-900 backdrop-blur">
            {ngo?.focusAreas?.length ? `${ngo.focusAreas.length} focus` : "NGO"}
          </span>

          <span className="absolute right-4 top-4">
            <Badge label={ngo?.registrationNumber ? "NGO" : "NGO"} tone={ngo?.registrationNumber ? "verified" : "silver"} />
          </span>
        </div>

        <div className="p-4 bg-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">{ngo?.name}</h2>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{ngo?.address || "Address not specified"}</p>
            </div>
            <div className="ml-4">
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">Reg: {ngo?.registrationNumber || '—'}</span>
            </div>
          </div>

          <div className="mt-3 text-sm text-gray-700 space-y-2">
            {ngo?.contactPerson && (
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M4 21v-2a4 4 0 0 1 3-3.87"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>{ngo.contactPerson}</span>
              </div>
            )}
            {ngo?.email && (
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8.5v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <polyline points="3 8.5 12 13 21 8.5"></polyline>
                </svg>
                <span className="truncate">{ngo.email}</span>
              </div>
            )}

            {ngo?.phone && (
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.09 4.18 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.72c.12.9.36 1.76.7 2.56a2 2 0 0 1-.45 2.11L8.91 10.09c1.89 3.76 5.2 7.07 8.96 8.96l1.7-1.28a2 2 0 0 1 2.11-.45c.8.34 1.66.58 2.56.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <span>{ngo.phone}</span>
              </div>
            )}

            {ngo?.address && (
              <div className="text-sm text-gray-600 truncate">Address: {ngo.address}</div>
            )}

            {ngo?.focusAreas?.length ? (
              <div className="flex flex-wrap gap-2"> Focus Area: 
                {ngo.focusAreas.map((f: string, i: number) => (
                  <span key={i} className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-800">{f}</span>
                ))}
              </div>
            ) : null}

          </div>
        </div>
      </Card>
  );
}
