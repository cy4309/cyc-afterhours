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
        <div className="mx-auto flex min-h-dvh w-full max-w-[720px] flex-col">
          <SiteChrome />
          <main className="flex flex-1 flex-col">{children}</main>
        </div>
      </body>
    </html>
  );
}
