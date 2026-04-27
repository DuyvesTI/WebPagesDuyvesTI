import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://duyvesti.vercel.app'),
  title: {
    default: "DuyvesTI | Desarrollo Web y Soluciones Tecnológicas para Empresas",
    template: "%s | DuyvesTI"
  },
  description: "Impulsa tu negocio con páginas web modernas, ultrarrápidas y listas para dominar Google. En DuyvesTI creamos soluciones a medida sin mensualidades absurdas.",
  keywords: ["desarrollo web", "páginas web para pymes", "agencia web", "diseño web chile", "creación de sitios web", "desarrollo web a medida", "posicionamiento SEO"],
  authors: [{ name: "DuyvesTI" }],
  creator: "DuyvesTI",
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: "/",
    title: "DuyvesTI | Desarrollo Web Profesional",
    description: "Impulsa tu negocio con páginas web modernas, ultrarrápidas y listas para dominar Google.",
    siteName: "DuyvesTI",
  },
  twitter: {
    card: "summary_large_image",
    title: "DuyvesTI | Desarrollo Web Profesional",
    description: "Impulsa tu negocio con páginas web modernas, ultrarrápidas y listas para dominar Google.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import { ThemeProvider } from "@/context/ThemeContext";

// ... existing imports ...

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300`}>
        <ThemeProvider>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <WhatsAppButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
