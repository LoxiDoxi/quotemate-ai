import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuoteMate AI",
  description: "AI powered quoting software for Australian tradies",
  icons: {
  icon: "/icon.png?v=2",
  shortcut: "/icon.png",
  apple: "/icon.png",
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
        </footer>
      </body>
    </html>
  );
}