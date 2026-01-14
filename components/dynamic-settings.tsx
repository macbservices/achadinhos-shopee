"use client"

import { useEffect, useState } from "react"
import { getSettings } from "@/lib/settings"

export function DynamicSettings() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    try {
      const settings = getSettings()

      if (settings.favicon) {
        const link = document.querySelector("link[rel='icon']") as HTMLLinkElement
        if (link) {
          link.href = settings.favicon
        } else {
          const newLink = document.createElement("link")
          newLink.rel = "icon"
          newLink.href = settings.favicon
          document.head.appendChild(newLink)
        }
      }

      if (settings.storeName) {
        document.title = `${settings.storeName} - Moda Feminina e Masculina`
      }

      const metaDescription = document.querySelector("meta[name='description']")
      if (metaDescription && settings.storeDescription) {
        metaDescription.setAttribute("content", settings.storeDescription)
      }

      const fontMap: Record<string, string> = {
        Inter: "var(--font-inter)",
        Roboto: "var(--font-roboto)",
        "Open Sans": "var(--font-opensans)",
        Lato: "var(--font-lato)",
        Montserrat: "var(--font-montserrat)",
        Poppins: "var(--font-poppins)",
        Raleway: "var(--font-raleway)",
      }

      const fontVar = fontMap[settings.fontFamily] || "var(--font-inter)"
      if (fontVar && document.body) {
        document.body.style.fontFamily = fontVar
      }

      if (document.documentElement) {
        if (settings.primaryColor) {
          document.documentElement.style.setProperty("--primary", settings.primaryColor)
        }

        if (settings.accentColor) {
          document.documentElement.style.setProperty("--accent", settings.accentColor)
        }

        if (settings.backgroundColor) {
          document.documentElement.style.setProperty("--background", settings.backgroundColor)
          document.body.style.backgroundColor = settings.backgroundColor
        }

        if (settings.textColor) {
          document.documentElement.style.setProperty("--foreground", settings.textColor)
          document.body.style.color = settings.textColor
        }
      }
    } catch (error) {
      console.error("Erro ao aplicar configurações:", error)
    }
  }, [mounted])

  return null
}
