import './globals.css'
import { Roboto } from 'next/font/google'
import type { Metadata } from 'next'

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SterkBouw App',
  description: 'Inloggen en dashboard voor het SterkBouw platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <body className={`${roboto.className} bg-gray-100 text-gray-900`}>
        {children}
      </body>
    </html>
  )
}
