import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "وقوف | دليل الوقف والابتداء",
  description: "دليل تعليمي ومرجعي متخصص في علم الوقف والابتداء في القرآن الكريم",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cairo:wght@200..1000&family=Inter:wght@100..900&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
