import type { Metadata } from "next";
import {
  Playfair_Display,
  Inter,
  Amiri,
  Outfit,
  Cormorant_Garamond,
  Cinzel,
  Bodoni_Moda,
  Fraunces,
  Syne,
  Prata,
  Plus_Jakarta_Sans,
  Montserrat,
  DM_Sans,
  Tajawal,
  Cairo,
} from "next/font/google";
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

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-arabic",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cinzel",
  display: "swap",
});

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bodoni",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fraunces",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const prata = Prata({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-prata",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

const dmsans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dmsans",
  display: "swap",
});

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-tajawal",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "600", "700"],
  variable: "--font-cairo",
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

const ALL_FONT_VARS = [
  playfair.variable,
  inter.variable,
  outfit.variable,
  amiri.variable,
  cormorant.variable,
  cinzel.variable,
  bodoni.variable,
  fraunces.variable,
  syne.variable,
  prata.variable,
  jakarta.variable,
  montserrat.variable,
  dmsans.variable,
  tajawal.variable,
  cairo.variable,
].join(" ");

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className={ALL_FONT_VARS} suppressHydrationWarning>
      <body
        className="min-h-screen bg-luxury-bg text-luxury-text antialiased selection:bg-luxury-accent/15 selection:text-luxury-accent"
        suppressHydrationWarning
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
