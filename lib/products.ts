export interface Product {
  id: string
  title: string
  price: number
  originalPrice?: number
  image: string
  shopeeLink: string
  category: "Camisetas" | "Calças" | "Vestidos" | "Acessórios"
  description: string
}

const STORAGE_KEY = "lojatrend_products"

export const initialProducts: Product[] = [
  {
    id: "1",
    title: "Camiseta Oversized Premium",
    price: 89.9,
    originalPrice: 129.9,
    image: "/stylish-oversized-t-shirt.jpg",
    shopeeLink: "https://shopee.com.br",
    category: "Camisetas",
    description: "Camiseta oversized 100% algodão com corte moderno",
  },
  {
    id: "2",
    title: "Calça Jeans Skinny",
    price: 159.9,
    originalPrice: 199.9,
    image: "/modern-skinny-jeans.jpg",
    shopeeLink: "https://shopee.com.br",
    category: "Calças",
    description: "Calça jeans skinny de alta qualidade",
  },
  {
    id: "3",
    title: "Vestido Floral Longo",
    price: 199.9,
    image: "/elegant-floral-dress.jpg",
    shopeeLink: "https://shopee.com.br",
    category: "Vestidos",
    description: "Vestido longo com estampa floral delicada",
  },
  {
    id: "4",
    title: "Óculos de Sol Espelhado",
    price: 79.9,
    originalPrice: 119.9,
    image: "/trendy-sunglasses.jpg",
    shopeeLink: "https://shopee.com.br",
    category: "Acessórios",
    description: "Óculos de sol com proteção UV400",
  },
  {
    id: "5",
    title: "Camiseta Básica Branca",
    price: 49.9,
    image: "/white-basic-t-shirt.jpg",
    shopeeLink: "https://shopee.com.br",
    category: "Camisetas",
    description: "Camiseta básica essencial para o guarda-roupa",
  },
  {
    id: "6",
    title: "Calça Cargo Street",
    price: 179.9,
    image: "/streetwear-cargo-pants.jpg",
    shopeeLink: "https://shopee.com.br",
    category: "Calças",
    description: "Calça cargo com estilo urbano moderno",
  },
]

export async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch("/api/products", { cache: "no-store" })
    if (!response.ok) throw new Error("Erro ao carregar")
    return await response.json()
  } catch (error) {
    console.error("Erro ao buscar produtos:", error)
    return []
  }
}

export async function saveProducts(products: Product[]): Promise<boolean> {
  try {
    const response = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(products),
    })
    return response.ok
  } catch (error) {
    console.error("Erro ao salvar produtos:", error)
    return false
  }
}

export function getProductById(products: Product[], id: string): Product | undefined {
  return products.find((p) => p.id === id)
}
