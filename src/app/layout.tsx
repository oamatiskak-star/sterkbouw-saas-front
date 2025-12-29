// src/app/layout.tsx - Gebruik JOUW bestaande auth
"use client"

import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth' // JOUW BESTAANDE AUTH!

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <body className={inter.className}>
        <AuthProvider> {/* JOUW BESTAANDE PROVIDER */}
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
