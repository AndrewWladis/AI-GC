import '../globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI GC',
  description: 'An AI generated groupchat.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className + " w-full bg-gradient-to-r from-gray-800 to-gray-900 min-h-screen flex items-center justify-center"}>{children}</body>
    </html>
  )
}
