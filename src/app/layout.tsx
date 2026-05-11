import type { Metadata } from "next";
import "./globals.css";
import ClientWrapper from "@/components/ClientWrapper";
import MaintenanceGuard from "@/components/MaintenanceGuard";

export const metadata: Metadata = {
  title: "The Sanctuary | A Gallery for Aaliya",
  description: "A cinematic journey through timeless moments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <MaintenanceGuard>
          <ClientWrapper>
            {children}
          </ClientWrapper>
        </MaintenanceGuard>
      </body>
    </html>
  );
}
