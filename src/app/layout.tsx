import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ErrorBoundary from "@/components/ErrorBoundary";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "NANMA Family Fest 2025 - Registration",
  description: "Register for NANMA Puthiyakavu Mahallu Association Dubai Committee Family Fest 2025. November at Woodlem Park School, Qusais, Dubai.",
  keywords: ["NANMA", "Family Fest", "Dubai", "Registration", "Puthiyakavu", "Mahallu", "Association"],
  authors: [{ name: "NANMA Dubai Committee" }],
  openGraph: {
    title: "NANMA Family Fest 2025 - Registration",
    description: "Join us for NANMA Family Fest 2025 on November at Woodlem Park School, Qusais, Dubai.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "NANMA Family Fest 2025",
    description: "Register now for the biggest family event of the year!",
  },
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-gray-50`}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
