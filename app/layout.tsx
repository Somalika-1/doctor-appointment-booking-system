"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast"; // Import Toaster
// import "react-hot-toast/style.css"; // Updated import path
// Import toast CSS styles

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster position="top-center" />{" "}
        {/* Add Toaster here for global use */}
        {children} {/* Render children components */}
      </body>
    </html>
  );
}
