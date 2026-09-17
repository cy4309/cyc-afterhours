import type { Metadata } from "next";
import { SharedMediaProvider } from "@/components/climbing/SharedMedia";
import { SiteChrome } from "@/components/climbing/SiteChrome";
import { isAdmin } from "@/lib/admin";
import "@/assets/styles/globals.css";

export const metadata: Metadata = {
  title: "cyc-afterhours",
  description: "cyc-afterhours. A visual climbing archive documenting bouldering results through video.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const admin = await isAdmin();

  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">
        <div className="mx-auto flex min-h-dvh w-full max-w-[720px] flex-col">
          <SiteChrome isAdmin={admin} />
          <main className="flex flex-1 flex-col">
            <SharedMediaProvider>{children}</SharedMediaProvider>
          </main>
        </div>
      </body>
    </html>
  );
}
