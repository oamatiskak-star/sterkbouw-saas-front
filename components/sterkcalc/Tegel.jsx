// components/sterkcalc/Tegel.jsx — herbruikbare visuele tegel (categorie/subtegel/bouwdeel).
import Link from 'next/link';
import { Layers } from 'lucide-react';

export default function Tegel({ href, code, title, subtitle, image, disabled }) {
  const inner = (
    <div
      className={`group overflow-hidden rounded-xl border bg-white transition ${
        disabled ? 'border-gray-200 opacity-60' : 'border-gray-200 hover:border-sterkcalc-blue hover:shadow-md'
      }`}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={title} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            <Layers size={28} />
          </div>
        )}
        {code ? (
          <span className="absolute left-2 top-2 rounded bg-sterkcalc-navy/80 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            {code}
          </span>
        ) : null}
      </div>
      <div className="p-3">
        <div className="truncate text-sm font-semibold text-gray-900">{title}</div>
        {subtitle ? <div className="truncate text-xs text-gray-500">{subtitle}</div> : null}
      </div>
    </div>
  );
  if (disabled || !href) return <div>{inner}</div>;
  return <Link href={href}>{inner}</Link>;
}
