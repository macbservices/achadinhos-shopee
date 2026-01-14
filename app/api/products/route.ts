import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const DATA_DIR = path.join(process.cwd(), "data")
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json")

const initialProducts = [
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

// Garantir que o diretório data existe
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

// GET - Buscar produtos
export async function GET() {
  try {
    await ensureDataDir()

    try {
      const data = await fs.readFile(PRODUCTS_FILE, "utf8")
      return NextResponse.json(JSON.parse(data))
    } catch {
      // Se arquivo não existe, criar com produtos iniciais
      await fs.writeFile(PRODUCTS_FILE, JSON.stringify(initialProducts, null, 2))
      return NextResponse.json(initialProducts)
    }
  } catch (error) {
    console.error("Erro ao ler produtos:", error)
    return NextResponse.json({ error: "Erro ao carregar produtos" }, { status: 500 })
  }
}

// POST - Salvar produtos
export async function POST(request: Request) {
  try {
    await ensureDataDir()
    const products = await request.json()
    await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2))
    return NextResponse.json({ success: true, products })
  } catch (error) {
    console.error("Erro ao salvar produtos:", error)
    return NextResponse.json({ error: "Erro ao salvar produtos" }, { status: 500 })
  }
}
