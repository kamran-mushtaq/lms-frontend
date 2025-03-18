import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import { Toaster } from "sonner";

import "react-datepicker/dist/react-datepicker.css";
import "./globals.css";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  weight: ["400", "900"]
});




export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.APP_URL
      ? `${process.env.APP_URL}`
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : `http://localhost:${process.env.PORT || 3000}`
  ),
  title: "K12 Learning Management System",
  description: "A comprehensive learning management system for K-12 education",
  openGraph: {
    url: "/",
    title: "K12 Learning Management System",
    description:
      "A comprehensive learning management system for K-12 education",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "K12 Learning Management System",
    description: "A comprehensive learning management system for K-12 education"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${urbanist.variable} antialiased`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <Toaster position="top-right" richColors closeButton />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
