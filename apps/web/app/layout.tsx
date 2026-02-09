import "./globals.css";
import React from "react";

export const metadata = {
  title: "OmniTool AI",
  description: "Premium AI toolbox with 200+ tools",
  openGraph: {
    title: "OmniTool AI",
    description: "Premium AI toolbox with 200+ tools",
    type: "website"
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <header className="border-b bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <div className="text-xl font-semibold">OmniTool AI</div>
              <nav className="flex gap-6 text-sm text-gray-600">
                <a href="/tools" className="hover:text-gray-900">
                  Tools
                </a>
                <a href="/dashboard" className="hover:text-gray-900">
                  Dashboard
                </a>
                <a href="/admin" className="hover:text-gray-900">
                  Admin
                </a>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
