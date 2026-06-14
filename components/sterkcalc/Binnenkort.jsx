// components/sterkcalc/Binnenkort.jsx — placeholder voor secties die in een latere slice komen.
import { Hammer } from 'lucide-react';

export default function Binnenkort({ titel, slice }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center p-16 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
        <Hammer size={26} />
      </span>
      <h1 className="text-lg font-semibold text-gray-900">{titel}</h1>
      <p className="mt-1 text-sm text-gray-500">
        Deze module wordt opgeleverd in {slice}. De werktafel, browser en calculatie-instellingen zijn al beschikbaar.
      </p>
    </div>
  );
}
