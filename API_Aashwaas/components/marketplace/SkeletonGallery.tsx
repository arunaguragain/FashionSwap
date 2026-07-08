"use client";

import React from 'react';

export default function SkeletonGallery() {
  return (
    <div>
      <div className="bg-gray-200 rounded h-[420px] mb-4 animate-pulse" />
      <div className="flex gap-2">
        <div className="w-24 h-24 bg-gray-200 rounded animate-pulse" />
        <div className="w-24 h-24 bg-gray-200 rounded animate-pulse" />
        <div className="w-24 h-24 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}
