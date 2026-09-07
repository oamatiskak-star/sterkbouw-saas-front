// pages/calculaties/opnames/nieuw.js — nieuwe opname vastleggen.
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ChevronLeft, ClipboardList } from 'lucide-react';
import OpnameForm from '@/components/calculatie/opname/OpnameForm';
import { createOpname } from '@/services/opnames';

export default function NieuweOpname() {
  const router = useRouter();

  async function handleSubmit(payload) {
    await createOpname(payload);
    router.push('/calculaties/opnames');
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Link href="/calculaties/opnames" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
        <ChevronLeft size={15} /> Terug naar opnames
      </Link>
      <h1 className="mb-1 flex items-center gap-2 text-xl font-semibold text-gray-900"><ClipboardList size={20} className="text-sterkcalc-blue" /> Opname particuliere klant</h1>
      <p className="mb-6 text-sm text-gray-500">Vul dit formulier tijdens of direct na de opname in. Na opslaan kun je de opname altijd hier terugvinden en aanpassen.</p>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <OpnameForm onSubmit={handleSubmit} submitLabel="Opslaan" />
      </div>
    </div>
  );
}
