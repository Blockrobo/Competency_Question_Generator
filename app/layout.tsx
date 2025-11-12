import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Competency-Based Questioning",
  description: "AI chat for teachers to generate competency-aligned question sets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}

