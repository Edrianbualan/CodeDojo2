import type { Metadata } from "next";
import Link from "next/link";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CodeDojo | Master the Art of Code",
    template: "%s | CodeDojo",
  },
  description:
    "Learn programming, sharpen your coding skills, solve real challenges, and compete with developers around the world.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <header className="site-header">
          <div className="wrap nav">
            <Link className="brand" href="/">
              <span aria-hidden="true">&gt;_</span> CodeDojo
            </Link>
            <nav aria-label="Main navigation">
              <Link href="/#features">Features</Link>
              <Link href="/#languages">Languages</Link>
              <Link href="/#faq">FAQ</Link>
              <Link href="/learn">Learn</Link>
              <Link href="/practice/setup">Practice</Link>
              <Link href="/dashboard">Account</Link>
            </nav>
            <Link className="button outline" href="/#start">
              Try the demo
            </Link>
          </div>
        </header>
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <footer className="wrap footer">
          <Link className="brand" href="/">
            <span aria-hidden="true">&gt;_</span> CodeDojo
          </Link>
          <div>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
