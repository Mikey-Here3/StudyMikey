import type { Metadata } from "next";
import { Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/shared/navbar";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StudyMikey - Learn, Practice, Compete, Showcase, Get Hired",
  description: "A production-grade platform for student developers to learn coding, solve algorithms, compete in university contests, showcase portfolios, and get hired.",
};

// Blocking script to apply saved theme before first paint — prevents flash
const themeInitScript = `
(function(){
  try {
    var t = localStorage.getItem('app-theme');
    if (t === 'green') {
      document.documentElement.classList.add('theme-green');
    } else {
      document.documentElement.classList.add('theme-red');
    }
  } catch(e) {
    document.documentElement.classList.add('theme-red');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${geistMono.variable} h-full antialiased light`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          <ThemeProvider>
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}

