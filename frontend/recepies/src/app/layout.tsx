import type { Metadata } from "next";
import "./globals.css";
import LoginButton from "./posts/components/common/LoginButton";
import ClientUserStore from "./posts/components/ClientUserStore";

import { LogoutButton } from "@/components/custom/logout-button";
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
        <LogoutButton />
        <ClientUserStore />
        {children}
        
      </body>
    </html>
  );
}