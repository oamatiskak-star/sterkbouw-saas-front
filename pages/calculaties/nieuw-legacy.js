// pages/calculaties/nieuw-legacy.js — P7.1: legacy executor-wizard is vervallen.
// De canonieke ingang is de Project Intake Center (/calculaties/nieuw). We redirecten
// zodat oude links/bladwijzers in de juiste calculator-flow uitkomen.
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function NieuwLegacyRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/calculaties/nieuw');
  }, [router]);
  return (
    <div className="flex h-[60vh] items-center justify-center text-sm text-gray-400">
      Doorsturen naar Nieuwe calculatie…
    </div>
  );
}
