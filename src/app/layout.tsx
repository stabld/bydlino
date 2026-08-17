import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans, Space_Mono } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "700"],
  variable: "--font-display",
});

const body = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Bydlino — pokoje a byty pro studenty v Brně",
  description:
    "Pokoje a byty pro studenty v Brně. Projedeš nabídku za pár minut a s majitelem se domluvíš napřímo.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0A0A10",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <div className="ambient-glow" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
