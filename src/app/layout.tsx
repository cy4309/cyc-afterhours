import type { Metadata, Viewport } from "next";
import { SharedMediaProvider } from "@/components/climbing/SharedMedia";
import { SiteChrome } from "@/components/climbing/SiteChrome";
import "@/assets/styles/globals.css";

export const metadata: Metadata = {
  title: "cyc-afterhours",
  description: "cyc-afterhours. A visual climbing archive documenting bouldering results through video.",
  icons: {
    icon: [{ url: "/cyc-logo.png", type: "image/png" }],
    apple: "/cyc-logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-dvh">
      <body className="h-dvh overflow-hidden antialiased">
        <div className="relative flex h-full w-full flex-col">
          <SiteChrome />
          <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <SharedMediaProvider>
              <div className="flex min-h-0 w-full flex-1 flex-col">{children}</div>
            </SharedMediaProvider>
          </main>
        </div>
      </body>
    </html>
  );
}
