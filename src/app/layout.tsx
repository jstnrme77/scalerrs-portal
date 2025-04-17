import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from 'next-themes'
import { AuthProvider } from '@/context/AuthContext'
import { themeScript } from './theme-script'

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
        <script dangerouslySetInnerHTML={{ __html: themeScript() }} />
      </head>
      <body className="bg-white dark:bg-dark text-text-light dark:text-text-dark blue-glow-top-left blue-glow-bottom-right" suppressHydrationWarning>
        <ThemeProvider attribute="class" enableSystem defaultTheme="system">
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
