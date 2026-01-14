export interface SiteSettings {
  storeName: string
  storeLogo?: string
  storeDescription: string
  domain: string
  primaryColor: string
  backgroundColor: string
  textColor: string
  accentColor: string
  headerHeight: string
  favicon?: string
  adminPassword: string
  fontFamily: string
  socialMedia: {
    instagram?: string
    facebook?: string
    twitter?: string
    whatsapp?: string
  }
}

export const initialSettings: SiteSettings = {
  storeName: "Achadinhos Online Shopee",
  storeDescription: "Encontre os melhores produtos com os melhores preços!",
  domain: "achadinhos.onlineshopee.com.br",
  primaryColor: "#8B5CF6",
  backgroundColor: "#FFFFFF",
  textColor: "#000000",
  accentColor: "#8B5CF6",
  headerHeight: "16",
  adminPassword: "admin123",
  fontFamily: "Inter",
  socialMedia: {
    instagram: "",
    facebook: "",
    twitter: "",
    whatsapp: "",
  },
}

export async function getSettings(): Promise<SiteSettings> {
  try {
    const response = await fetch("/api/settings", { cache: "no-store" })
    if (!response.ok) throw new Error("Erro ao carregar")
    return await response.json()
  } catch (error) {
    console.error("Erro ao buscar configurações:", error)
    return initialSettings
  }
}

export async function saveSettings(settings: SiteSettings): Promise<boolean> {
  try {
    const response = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    })
    return response.ok
  } catch (error) {
    console.error("Erro ao salvar configurações:", error)
    return false
  }
}

export function isFirstAccess(settings: SiteSettings): boolean {
  return settings.adminPassword === "admin123"
}
