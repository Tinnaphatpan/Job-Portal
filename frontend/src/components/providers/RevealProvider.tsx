'use client';

import { useRevealOnScroll } from '@/hooks/useRevealOnScroll';

export default function RevealProvider({ children }: { children: React.ReactNode }) {
  useRevealOnScroll();
  return <>{children}</>;
}
