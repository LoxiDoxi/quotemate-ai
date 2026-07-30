import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuoteMate AI",
  description: "AI powered quoting software for Australian tradies",
  icons: {
    icon: "/logo.png",
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
      </body>
    </html>
  );
}