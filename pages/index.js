// pages/index.js — Root = primaire SterkCalc-entrypoint (redirect naar /calculaties).
// Inloggen blijft op /login. /calculaties draait in SterkCalcLayout.
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/calculaties');
  }, [router]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-gray-400">
      SterkCalc laden…
    </div>
  );
}
