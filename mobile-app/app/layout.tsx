import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Web3Provider } from "@/components/web3-provider"
import { Toaster } from "@/components/ui/toaster"
import MobileNavigation from "@/components/mobile-navigation"
import { TrailMaintenanceProvider } from "../providers/TrailMaintenanceContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "KiaOraTrails - Community-Driven Trail Management",
  description: "Report trail conditions, fundraise for improvements, and participate in DAO governance",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  themeColor: "#10b981",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "KiaOraTrails",
  },
  manifest: "/manifest.json",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Web3Provider>
          <TrailMaintenanceProvider>
            <div className="flex flex-col h-[100dvh] overflow-hidden">
              <main className="flex-1 overflow-y-auto pb-16">{children}</main>
              <MobileNavigation />
              <Toaster />
            </div>
            </TrailMaintenanceProvider>
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'