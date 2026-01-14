import type React from "react"
import { Inter, Roboto, Open_Sans, Lato, Montserrat, Poppins, Raleway } from "next/font/google"
import "./globals.css"
import { DynamicSettings } from "@/components/dynamic-settings"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const roboto = Roboto({ weight: ["400", "500", "700"], subsets: ["latin"], variable: "--font-roboto" })
const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-opensans" })
const lato = Lato({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-lato" })
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" })
const poppins = Poppins({ weight: ["400", "500", "600", "700"], subsets: ["latin"], variable: "--font-poppins" })
const raleway = Raleway({ subsets: ["latin"], variable: "--font-raleway" })

export const metadata = {
  title: "Achadinhos Online Shopee - Moda Feminina e Masculina",
  description: "Encontre os melhores produtos com os melhores preços!",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="generator" content="v0.app" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${inter.variable} ${roboto.variable} ${openSans.variable} ${lato.variable} ${montserrat.variable} ${poppins.variable} ${raleway.variable} font-sans antialiased`}
      >
        <DynamicSettings />
        {children}
      </body>
    </html>
  )
}
