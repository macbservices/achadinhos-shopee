"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, ArrowLeft } from "lucide-react"
import { getProductById, type Product } from "@/lib/products"

export default function ProductPage() {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)

  useEffect(() => {
    if (params.id) {
      const foundProduct = getProductById(params.id as string)
      setProduct(foundProduct || null)
    }
  }, [params.id])

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Produto não encontrado</h2>
            <Button asChild>
              <Link href="/produtos">Voltar para Produtos</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <Button variant="ghost" asChild className="mb-6">
              <Link href="/produtos">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Produtos
              </Link>
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.title}
                  fill
                  className="object-cover"
                  priority
                />
                {discount > 0 && (
                  <Badge className="absolute top-4 right-4 bg-destructive text-destructive-foreground text-lg px-3 py-1">
                    -{discount}%
                  </Badge>
                )}
              </div>

              {/* Product Info */}
              <div className="flex flex-col gap-6">
                <div>
                  <Badge variant="secondary" className="mb-4">
                    {product.category}
                  </Badge>
                  <h1 className="text-3xl md:text-4xl font-bold mb-4 text-balance">{product.title}</h1>
                  <p className="text-muted-foreground text-lg text-pretty">{product.description}</p>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-primary">R$ {product.price.toFixed(2)}</span>
                  {product.originalPrice && (
                    <span className="text-xl text-muted-foreground line-through">
                      R$ {product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="space-y-4 pt-4">
                  <Button size="lg" className="w-full text-lg h-14" asChild>
                    <a href={product.shopeeLink} target="_blank" rel="noopener noreferrer">
                      Comprar na Shopee
                      <ExternalLink className="ml-2 h-5 w-5" />
                    </a>
                  </Button>

                  <div className="text-sm text-muted-foreground text-center">
                    Você será redirecionado para a Shopee para finalizar sua compra
                  </div>
                </div>

                <div className="pt-6 border-t space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Detalhes do Produto</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Entrega rápida pela Shopee</li>
                      <li>• Diversos métodos de pagamento</li>
                      <li>• Garantia do vendedor</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
