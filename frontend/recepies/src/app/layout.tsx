import type { Metadata } from "next";
import "./globals.css";

import ClientUserStore from "./posts/components/ClientUserStore";
import { AuthProvider } from "@/components/custom/contexts/AuthContext";

import {Navbar} from "@/components/custom/nav-bar";
import { getServerSession } from "next-auth";


export const metadata: Metadata = {
  title: "CRUD Demo",
  description: "A simple CRUD demo using Next.js",
};


export default async function RootLayout({
  children,
}: {  children: React.ReactNode;
}) {
  const session = await getServerSession();
  return (
    <html lang="en">
      <body>
        <AuthProvider>
        <Navbar />
        
        <ClientUserStore />

          {children}
        </AuthProvider>
        
      </body>
    </html>
  );
}