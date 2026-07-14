"use client";

import React from 'react';

export default function SkeletonGallery() {
  return (
    <div className="w-full">
      <div className="mb-4 h-[420px] animate-pulse rounded-[1.5rem] bg-gradient-to-r from-surface-container to-surface-container-high" />
      <div className="flex gap-2">
        <div className="h-24 w-24 animate-pulse rounded-[1rem] bg-gradient-to-r from-surface-container to-surface-container-high" />
        <div className="h-24 w-24 animate-pulse rounded-[1rem] bg-gradient-to-r from-surface-container to-surface-container-high" />
        <div className="h-24 w-24 animate-pulse rounded-[1rem] bg-gradient-to-r from-surface-container to-surface-container-high" />
      </div>
    </div>
  );
}
