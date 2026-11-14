import { Locale, locales, getDirection } from "@/lib/i18n";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface RootLocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RootLocaleLayout({
  children,
  params,
}: RootLocaleLayoutProps) {
  const resolved = await params;
  const locale = (resolved.locale as Locale) || "fr";
  const direction = getDirection(locale);

  return (
    <div lang={locale} dir={direction} className="min-h-screen">
      {children}
    </div>
  );
}
