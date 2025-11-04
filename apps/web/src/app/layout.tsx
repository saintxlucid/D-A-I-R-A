import "./globals.css";
import { QueryProvider } from "@/lib/query-provider";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DAIRA - Share your world. Expand your circle.",
  description: "An Egypt-born global social app",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
