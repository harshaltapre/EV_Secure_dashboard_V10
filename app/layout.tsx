import type React from "react"
import "./globals.css"
import ClientLayout from "./clientLayout"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Use standard Google Fonts link to avoid next/font binary path */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={""}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
export const metadata = {
      generator: 'v0.dev'
    };
