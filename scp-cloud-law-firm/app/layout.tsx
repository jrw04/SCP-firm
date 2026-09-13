import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SCP Cloud Law Firm — Cabinet numérique",
  description: "Plateforme métier et extranet client de SCP Cloud Law Firm",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="h-full">{children}</body>
    </html>
  );
}
