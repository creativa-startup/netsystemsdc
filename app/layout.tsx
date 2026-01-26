import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ViewTracker from "@/components/home/ViewTracker";
import { ThemeProvider } from "next-themes";
import { GlobalConfigProvider } from "@/context/GlobalConfigContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NetSystemsDC - Infraestructura IT",
  description: "Soluciones integrales de TI y soporte especializado.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <GlobalConfigProvider>
            <ViewTracker />
            {children}
          </GlobalConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
