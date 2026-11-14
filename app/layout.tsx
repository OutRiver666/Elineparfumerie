import type { Metadata } from "next";
import { Playfair_Display, Inter, Amiri } from "next/font/google";
import "@/app/globals.css";
import { Toaster } from "@/components/ui/toaster";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Éline Parfumerie | Haute Parfumerie Artisanale en Algérie",
  description:
    "Créations olfactives d'exception, extraits de parfum purs et coffrets personnalisés. Livraison sécurisée dans les 58 Wilayas d'Algérie avec paiement à la livraison.",
  keywords: [
    "parfum algerie",
    "parfumerie artisanale",
    "extrait de parfum",
    "oud algerie",
    "eline parfumerie",
    "عطور الجزائر",
    "عطور فاخرة",
    "توصيل 58 ولاية",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      className={`${playfair.variable} ${inter.variable} ${amiri.variable}`}
      suppressHydrationWarning
    >
      <body
        className="min-h-screen bg-white text-luxury-text antialiased selection:bg-luxury-accent/15 selection:text-luxury-accent"
        suppressHydrationWarning
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
