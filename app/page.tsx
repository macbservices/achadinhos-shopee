"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Instagram, Facebook, Twitter, MessageCircle } from "lucide-react"
import { getProducts, type Product } from "@/lib/products"
import { getSettings, type SiteSettings } from "@/lib/settings"

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [settings, setSettings] = useState<SiteSettings | null>(null)

  useEffect(() => {
    async function loadData() {
      const productsData = await getProducts()
      setProducts(productsData)

      if (typeof window !== "undefined") {
        const settingsData = await getSettings()
        setSettings(settingsData)
      }
    }
    loadData()
  }, [])

  const featuredProducts = products.slice(0, 6)
  const bestSellers = products.filter((p) => p.originalPrice).slice(0, 4)
  const socialMedia = settings?.socialMedia

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[500px] md:h-[600px] bg-gradient-to-br from-background via-muted/30 to-primary/10 overflow-hidden">
          <div className="container h-full flex flex-col justify-center px-4 md:px-6">
            <div className="max-w-2xl space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
                Descubra os melhores achadinhos
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground text-pretty">
                As melhores ofertas em moda feminina e masculina com entrega rápida direto da Shopee
              </p>
              <div className="flex gap-4">
                <Button size="lg" asChild>
                  <Link href="/produtos">
                    Explorar Produtos
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {(socialMedia?.instagram || socialMedia?.facebook || socialMedia?.twitter || socialMedia?.whatsapp) && (
                <div className="flex items-center gap-4 pt-4">
                  <p className="text-sm font-medium">Siga-nos:</p>
                  <div className="flex gap-3">
                    {socialMedia.instagram && (
                      <a
                        href={socialMedia.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-10 w-10 items-center justify-center rounded-full border bg-background/50 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <Instagram className="h-5 w-5" />
                      </a>
                    )}
                    {socialMedia.facebook && (
                      <a
                        href={socialMedia.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-10 w-10 items-center justify-center rounded-full border bg-background/50 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <Facebook className="h-5 w-5" />
                      </a>
                    )}
                    {socialMedia.twitter && (
                      <a
                        href={socialMedia.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-10 w-10 items-center justify-center rounded-full border bg-background/50 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <Twitter className="h-5 w-5" />
                      </a>
                    )}
                    {socialMedia.whatsapp && (
                      <a
                        href={`https://wa.me/${socialMedia.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-10 w-10 items-center justify-center rounded-full border bg-background/50 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <MessageCircle className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -right-1/4 top-0 h-[600px] w-[600px] rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -left-1/4 bottom-0 h-[400px] w-[400px] rounded-full bg-accent/20 blur-3xl" />
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="mb-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Produtos em Destaque</h2>
              <p className="text-muted-foreground text-pretty">Confira nossa seleção especial de produtos</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* Best Sellers */}
        {bestSellers.length > 0 && (
          <section className="py-16 md:py-24 bg-muted/50">
            <div className="container px-4 md:px-6">
              <div className="mb-12 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Mais Vendidos</h2>
                <p className="text-muted-foreground text-pretty">Os produtos favoritos dos nossos clientes</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {bestSellers.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="mt-12 text-center">
                <Button size="lg" variant="outline" asChild>
                  <Link href="/produtos">
                    Ver Todos os Produtos
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
