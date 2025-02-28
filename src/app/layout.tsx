import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'WEENSTOCKS',
  description: 'Paper Trading Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100">
        {children}
      </body>
    </html>
  )
}
