import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Data Strategis Kabupaten Toli-Toli | BPS Toli-Toli",
  description: "Portal Data Statistik dan Indikator Strategis Kabupaten Toli-Toli, Sulawesi Tengah",
  keywords: ["BPS", "Toli-Toli", "data strategis", "statistik", "kabupaten"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={plusJakarta.variable} suppressHydrationWarning>
      <head>
        {/* Prevent flash of light mode for users who saved dark theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#F5F8FC] dark:bg-[#0B1120] antialiased" style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
