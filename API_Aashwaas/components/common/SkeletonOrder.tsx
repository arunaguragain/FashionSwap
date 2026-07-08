"use client";

import React from 'react';

export default function SkeletonOrder() {
  return (
    <div className="animate-pulse bg-white rounded-lg shadow p-4 h-20 flex items-center justify-between">
      <div className="space-y-2 w-2/3">
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-20" />
    </div>
  );
}
