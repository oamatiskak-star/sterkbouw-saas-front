// components/core/Breadcrumbs.tsx

import Link from 'next/link'

export default function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <div className="text-sm text-gray-500 mb-4">
      {items.map((item, idx) => (
        <span key={idx}>
          {item.href ? (
            <Link href={item.href} className="hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-gray-700">{item.label}</span>
          )}
          {idx < items.length - 1 && ' > '}
        </span>
      ))}
    </div>
  )
}
