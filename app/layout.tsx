import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IIIF Collection Explorer",
  description: "Explore manifests from a configurable IIIF Collection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <main className="mx-auto min-h-screen max-w-7xl px-6 py-10 sm:px-8 lg:px-10">{children}</main>
      </body>
    </html>
  );
}
