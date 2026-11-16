'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

import Header from '@/components/ui/Header';
import Nav from '@/components/ui/Nav';
import Caption from '@/components/ui/Caption';
import Loader from '@/components/ui/Loader';
import CanvasBoundary, { Fallback } from '@/components/ui/CanvasBoundary';

const Scene = dynamic(() => import('@/components/canvas/Scene'), { ssr: false });

export default function Page() {
  const [webgl, setWebgl] = useState(true);

  useEffect(() => {
    try {
      const c = document.createElement('canvas');
      setWebgl(Boolean(c.getContext('webgl2') || c.getContext('webgl')));
    } catch {
      setWebgl(false);
    }
  }, []);

  return (
    <main className="relative w-full h-[100dvh] overflow-hidden bg-night">
      <Header />
      <div className="fixed inset-0 z-0">
        {webgl ? (
          <CanvasBoundary>
            <Scene />
          </CanvasBoundary>
        ) : (
          <Fallback />
        )}
      </div>
      <div className="z-[5] fixed inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(10,8,18,0.55)_100%)] pointer-events-none" />
      <Caption />
      <Nav />
      <Loader />
    </main>
  );
}
