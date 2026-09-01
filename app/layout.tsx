import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { Nav } from "@/components/Nav";
import { API_VERSION } from "@/content/spec";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "Allo Partner API";
const description =
  "You host one HTTPS URL. Allo calls it with a phone number. You answer with JSON.";

export const metadata: Metadata = {
  title: {
    default: title,
    template: `%s · ${title}`,
  },
  description,
  robots: { index: true, follow: true },
  icons: {
    icon: "/icon.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title,
    description,
    type: "website",
    images: [{ url: "/allo-logo.png", alt: "Allo" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <header className="border-b border-border">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="flex items-center gap-3 text-sm font-medium tracking-tight">
              <img
                src="/allo-logo.png"
                alt="Allo"
                width={120}
                height={32}
                className="h-8 w-auto"
              />
              <span className="text-muted">Partner API</span>
            </Link>
            <span className="font-mono text-xs text-muted">v{API_VERSION}</span>
          </div>
        </header>
        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 md:flex-row md:gap-12">
          <aside className="md:w-52 md:shrink-0">
            <Nav />
          </aside>
          <main className="min-w-0 max-w-[720px] flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
