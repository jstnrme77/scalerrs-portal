import type { Metadata } from 'next'
import './globals.css'
// import { ThemeProvider } from 'next-themes' - Theme switching disabled
import { AuthProvider } from '@/context/AuthContext'
// import { themeScript } from './theme-script' - Theme switching disabled

export const metadata: Metadata = {
  title: 'Scalerrs Client Portal',
  description: 'Client portal for Scalerrs - SEO & Marketing Agency',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Theme script disabled */}
      </head>
      <body className="bg-white text-text-light blue-glow-top-left blue-glow-bottom-right font-roboto" suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
