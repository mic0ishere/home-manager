import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Inter, JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const fontSans = Inter({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Home Manager",
    template: "%s | Home Manager",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body
        className={cn(
          "font-sans",
          `${fontSans.variable} ${fontMono.variable} antialiased`,
        )}
      >
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
