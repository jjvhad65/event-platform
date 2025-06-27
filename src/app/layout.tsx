import './globals.css';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Event Platform',
  description: 'MVP for event professionals',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[var(--background)] text-[var(--foreground)]`}>
        {/* ✅ Navbar using theme vars */}
        <nav className="bg-[var(--background)] shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
            <Link href="/" className="text-xl font-bold text-[var(--foreground)]">
              EventPro
            </Link>
            <div className="space-x-4">
              <Link href="/" className="text-[var(--foreground)] hover:text-[#60a5fa]">Home</Link>
              <Link href="/login" className="text-[var(--foreground)] hover:text-[#60a5fa]">Login</Link>
              <Link href="/signup" className="text-[var(--foreground)] hover:text-[#60a5fa]">Signup</Link>
            </div>
          </div>
        </nav>

        {/* ✅ Main section uses themed background + text */}
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
