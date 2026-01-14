"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Instagram, Facebook, Twitter, MessageCircle } from "lucide-react"
import { getSettings, type SiteSettings } from "@/lib/settings"

export function Footer() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSettings(getSettings())
    }
  }, [])

  const storeName = settings?.storeName || "Achadinhos Online Shopee"
  const domain = settings?.domain || "achadinhos.onlineshopee.com.br"
  const socialMedia = settings?.socialMedia

  return (
    <footer className="border-t bg-muted/50">
      <div className="container px-4 py-12 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-lg font-semibold mb-4">{storeName}</h3>
            <p className="text-sm text-muted-foreground">
              Sua loja de moda feminina e masculina com as melhores ofertas direto da Shopee.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/produtos" className="text-muted-foreground hover:text-primary transition-colors">
                  Produtos
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">Categorias</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-muted-foreground">Camisetas</li>
              <li className="text-muted-foreground">Calças</li>
              <li className="text-muted-foreground">Vestidos</li>
              <li className="text-muted-foreground">Acessórios</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">Redes Sociais</h4>
            <div className="flex gap-4">
              {socialMedia?.instagram && (
                <a
                  href={socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {socialMedia?.facebook && (
                <a
                  href={socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {socialMedia?.twitter && (
                <a
                  href={socialMedia.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {socialMedia?.whatsapp && (
                <a
                  href={`https://wa.me/${socialMedia.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
                </a>
              )}
            </div>
            {!socialMedia?.instagram && !socialMedia?.facebook && !socialMedia?.twitter && !socialMedia?.whatsapp && (
              <p className="text-xs text-muted-foreground">Configure suas redes sociais no painel admin</p>
            )}
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>
            &copy; 2026 {storeName} - {domain}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
