// pages/calculaties/[id]/werktafel.js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Werktafel from '@/components/calculatie/werktafel/Werktafel';

export default function WerktafelPage() {
  const router = useRouter();
  const { id } = router.query;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || !id) {
    return <div className="p-6 text-sm text-gray-400">Werktafel laden…</div>;
  }
  return <Werktafel calculatieId={id} />;
}
