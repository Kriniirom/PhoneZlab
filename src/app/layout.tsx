import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/features/layout/Navbar";
import { Footer } from "@/features/layout/Footer";
import { PWARegister } from "@/features/pwa/PWARegister";
import { PWAInstallPrompt } from "@/features/pwa/PWAInstallPrompt";
import { getSiteUrl, getOrganizationSchema, getWebsiteSchema } from "@/utils/seo";
import { StructuredData } from "@/components/StructuredData";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "PhoneZlab | Luxury Accessories",
    template: "%s | PhoneZlab",
  },
  description: "Premium luxury accessories and cases for the modern elite.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PhoneZlab",
  },
  icons: {
    apple: "/icon-192.png",
  },
  alternates: {
    canonical: "/",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || undefined,
  },
};

export const viewport: Viewport = {
  themeColor: "#2874f0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgSchema = getOrganizationSchema();
  const webSiteSchema = getWebsiteSchema();

  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <head>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
        <StructuredData data={[orgSchema, webSiteSchema]} />
      </head>
      <body className="min-h-full flex flex-col selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
        <PWARegister />
        <PWAInstallPrompt />
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

