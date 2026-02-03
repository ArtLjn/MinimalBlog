import React from 'react';
import { Hero } from '@/sections/Hero';
import { BlogSection } from '@/sections/BlogSection';
import { CTASection } from '@/sections/CTASection';

export const Home: React.FC = () => {
  return (
    <main className="min-h-screen">
      <Hero />
      <BlogSection />
      <CTASection />
    </main>
  );
};
