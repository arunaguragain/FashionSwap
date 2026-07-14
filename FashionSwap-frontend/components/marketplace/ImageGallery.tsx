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
      <div className="relative mb-4 h-[420px] w-full overflow-hidden rounded-[1.75rem] border border-outline/15 bg-surface-container-lowest md:h-[520px]">
        <Image src={images[index]} alt={`Image ${index + 1}`} fill className="object-cover" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {images.map((src, i) => (
          <button key={src + i} onClick={() => setIndex(i)} className={`relative h-24 w-24 overflow-hidden rounded-[1rem] border ${i === index ? 'border-primary shadow-[0_8px_20px_rgba(114,68,40,0.18)]' : 'border-outline/15'}`}>
            <Image src={src} alt={`Thumb ${i + 1}`} fill className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
