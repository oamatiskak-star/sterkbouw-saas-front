'use client'

import dynamic from 'next/dynamic'

const AntdApp = dynamic(
  () => import('./AntdRuntime'),
  { ssr: false }
)

export default function AntdBoundary({ children }) {
  return <AntdApp>{children}</AntdApp>
}
