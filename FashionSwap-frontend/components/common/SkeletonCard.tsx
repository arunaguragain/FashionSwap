"use client";

import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white rounded-lg shadow p-4 h-64">
      <div className="bg-gray-200 rounded h-36 mb-3" />
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
    </div>
  );
}
