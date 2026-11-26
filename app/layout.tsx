import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Morcoin: crypto where you already work and shop",
  description:
    "Morcoin partners with businesses to make crypto part of everyday life. Join your company's waitlist.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="nav">
          <a href="/" className="brand">
            <span className="brand-dot" aria-hidden /> Morcoin
          </a>
          <a href="/#join" className="nav-cta">Join the waitlist</a>
        </header>
        {children}
        <footer className="footer">
          <span>© {new Date().getFullYear()} Morcoin</span>
          <a href="https://x.com/morcoins" target="_blank" rel="noreferrer">@morcoins on X</a>
        </footer>
      </body>
    </html>
  );
}
