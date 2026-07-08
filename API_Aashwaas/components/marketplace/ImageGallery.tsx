"use client";

import React, { useState } from 'react';
import Image from 'next/image';

interface ImageGalleryProps {
  images: string[];
  className?: string;
}

export default function ImageGallery({ images = [], className = '' }: ImageGalleryProps) {
  const [index, setIndex] = useState(0);

  if (!images || images.length === 0) {
    images = ['/images/placeholder.png'];
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="w-full h-[420px] md:h-[520px] rounded-lg overflow-hidden mb-4 relative">
        <Image src={images[index]} alt={`Image ${index + 1}`} fill className="object-contain" />
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {images.map((src, i) => (
          <button key={src + i} onClick={() => setIndex(i)} className={`relative w-24 h-24 rounded-md overflow-hidden ${i === index ? 'ring-2 ring-primary-600' : ''}`}>
            <Image src={src} alt={`Thumb ${i + 1}`} fill className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
