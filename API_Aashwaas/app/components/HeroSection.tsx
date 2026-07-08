import React from 'react';
import { Button } from '../../components/common/Button';

export const HeroSection: React.FC = () => {
  return (
    <section className="max-w-6xl mx-auto px-4 py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-display font-display text-primary-900 mb-4">Find Your Next Favorite Fashion Piece</h1>
          <p className="text-lg text-neutral-700 mb-6">Browse thousands of curated second-hand items — secure, sustainable, and trusted by our community.</p>
          <Button variant="primary">Browse Now</Button>
        </div>
        <div>
          <div className="bg-gradient-to-br from-primary-600 to-primary-400 h-64 rounded-xl" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
