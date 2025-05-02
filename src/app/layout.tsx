import type { Metadata } from "next";
import "./globals.css";
import { getCurrentUser } from "@/lib/supabase/queries";
import Header from "@/components/Header/Header";

export const metadata: Metadata = {
  title: "Control de Finanzas Personales",
  description: "Aplicación para seguimiento de finanzas personales",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="es">
      <body className="bg-gray-100 min-h-screen">
        {user && <Header user={user} />}
        {children}
      </body>
    </html>
  );
}
