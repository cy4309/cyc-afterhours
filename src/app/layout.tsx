import type { Metadata } from "next";
import { SiteChrome } from "@/components/climbing/SiteChrome";
import "@/assets/styles/globals.css";

export const metadata: Metadata = {
  title: "cyc-afterhours",
  description: "cyc-afterhours. A visual climbing archive documenting bouldering results through video.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-white text-black antialiased">
        <div className="mx-auto min-h-dvh w-full max-w-6xl px-6 py-8">
          <SiteChrome />
          <main className="pt-12">{children}</main>
        </div>
      </body>
    </html>
  );
}
