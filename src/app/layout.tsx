import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SubCheck — Subscription Tracking & Waste Detection",
  description: "Your subscriptions. Your money. Your control. Track subscriptions and detect waste with actionable intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-slate-100 antialiased selection:bg-brand-accent/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
