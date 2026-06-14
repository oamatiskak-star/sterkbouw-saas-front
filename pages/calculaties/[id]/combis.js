// pages/calculaties/[id]/combis.js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import CombiBibliotheek from '@/components/calculatie/combis/CombiBibliotheek';

export default function CombisPage() {
  const router = useRouter();
  const { id } = router.query;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || !id) return <div className="p-6 text-sm text-gray-400">Laden…</div>;
  return <CombiBibliotheek calculatieId={id} />;
}
