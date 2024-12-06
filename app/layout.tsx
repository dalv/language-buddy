import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/components/AuthProvider'
import { APP_VERSION } from '@/lib/version'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Language Buddy',
  description: 'A flashcard app for language learning',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <main className="flex-grow">
              {children}
            </main>
            <footer className="py-2 px-4 text-center text-xs text-gray-500">
              <p>Language Buddy {APP_VERSION}</p>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}

