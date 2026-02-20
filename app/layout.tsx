import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const plusJakarta = localFont({
  src: [
    { path: '../node_modules/@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2', style: 'normal' },
  ],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

const geistMono = localFont({
  src: '../node_modules/geist/dist/fonts/geist-mono/GeistMono-Regular.woff2',
  variable: '--font-geist-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'RedHotChatbot — AI Support Widget for Small Business',
  description:
    'Add an AI customer support chatbot to your website in 60 seconds. Trained on your content. Works on Shopify, WordPress, and everywhere else.',
  openGraph: {
    title: 'RedHotChatbot',
    description: 'AI support widget for small business. Paste one script tag. Done.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plusJakarta.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
