import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuoteMate AI | AI Quote Generator for Australian Tradies",

  description:
    "Create professional quotes in seconds with QuoteMate AI. AI-powered quoting software built for Australian plumbers, electricians, builders and contractors.",

  keywords: [
    "AI quoting software",
    "quote generator Australia",
    "tradie software",
    "plumber quoting software",
    "electrician quoting software",
    "builder quote software",
    "AI business tools",
    "Australian tradies",
  ],

  icons: {
    icon: "/icon.png?v=2",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },

  openGraph: {
    title: "QuoteMate AI | AI Quote Generator for Australian Tradies",
    description:
      "Create professional quotes in seconds with AI-powered quoting software made for Australian tradies.",
    url: "https://www.quotemateai.com.au",
    siteName: "QuoteMate AI",
    images: [
      {
        url: "https://www.quotemateai.com.au/icon.png",
        width: 512,
        height: 512,
        alt: "QuoteMate AI Logo",
      },
    ],
    locale: "en_AU",
    type: "website",
  },

  twitter: {
    card: "summary",
    title: "QuoteMate AI | AI Quote Generator for Australian Tradies",
    description:
      "AI-powered quoting software helping Australian tradies create professional quotes faster.",
    images: ["https://www.quotemateai.com.au/icon.png"],
  },
};


const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "QuoteMate AI",
  "url": "https://www.quotemateai.com.au",
  "logo": "https://www.quotemateai.com.au/icon.png",
  "description":
    "AI-powered quoting software built for Australian tradies including plumbers, electricians, builders and contractors.",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "provider": {
    "@type": "Organization",
    "name": "QuoteMate AI",
    "url": "https://www.quotemateai.com.au",
    "email": "quotemateai@gmail.com",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">

      <body className="min-h-screen antialiased">


        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-5FLYTCH3C7"
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-5FLYTCH3C7');
          `}
        </Script>


        {/* Google SEO Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />


        <nav className="border-b p-4 flex justify-between items-center">

          <a href="/" className="font-bold text-xl">
            QuoteMate AI
          </a>


          <div className="flex gap-5">
            <a href="/">Home</a>
            <a href="/dashboard">Dashboard</a>
            <a href="/settings">Settings</a>
            <a href="/login">Login</a>
          </div>

        </nav>


        {children}


        <footer className="border-t mt-10 py-8 text-center text-sm text-gray-500">

          <p className="font-semibold text-gray-700">
            QuoteMate AI
          </p>


          <p>
            ABN: 15 154 226 673
          </p>


          <p>
            Support:{" "}
            <a
              href="mailto:quotemateai@gmail.com"
              className="text-blue-600 hover:underline"
            >
              quotemateai@gmail.com
            </a>
          </p>


          <p className="mt-2">
            © {new Date().getFullYear()} QuoteMate AI. All rights reserved.
          </p>


          <div className="flex gap-4 justify-center mt-4">

            <a href="/privacy" className="hover:underline">
              Privacy Policy
            </a>


            <a href="/terms" className="hover:underline">
              Terms of Service
            </a>


            <a href="/refunds" className="hover:underline">
              Refund Policy
            </a>

          </div>

        </footer>


      </body>

    </html>
  );
}
