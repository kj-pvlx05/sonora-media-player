import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SONORA — Media Queue System",
  description:
    "A retro-futuristic music player and DSA × OOP educational project. " +
    "Queue and media-management powered by custom data structures.",
  keywords: ["music player", "DSA", "OOP", "queue", "linked list", "Java", "Spring Boot"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('sonora-accent-color');
                  if (saved) {
                    var clean = saved.replace('#', '');
                    var num = parseInt(clean, 16);
                    var r = (num >> 16) & 255, g = (num >> 8) & 255, b = num & 255;
                    var root = document.documentElement;
                    root.style.setProperty('--sn-accent', saved);
                    root.style.setProperty('--sn-accent-muted', 'rgba(' + r + ',' + g + ',' + b + ',0.16)');
                    root.style.setProperty('--sn-accent-border', 'rgba(' + r + ',' + g + ',' + b + ',0.35)');
                    root.style.setProperty('--sn-accent-ring', 'rgba(' + r + ',' + g + ',' + b + ',0.45)');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
