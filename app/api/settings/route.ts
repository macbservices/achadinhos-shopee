import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const DATA_DIR = path.join(process.cwd(), "data")
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json")

const initialSettings = {
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

// Garantir que o diretório data existe
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

// GET - Buscar configurações
export async function GET() {
  try {
    await ensureDataDir()

    try {
      const data = await fs.readFile(SETTINGS_FILE, "utf8")
      return NextResponse.json(JSON.parse(data))
    } catch {
      // Se arquivo não existe, criar com configurações iniciais
      await fs.writeFile(SETTINGS_FILE, JSON.stringify(initialSettings, null, 2))
      return NextResponse.json(initialSettings)
    }
  } catch (error) {
    console.error("Erro ao ler configurações:", error)
    return NextResponse.json({ error: "Erro ao carregar configurações" }, { status: 500 })
  }
}

// POST - Salvar configurações
export async function POST(request: Request) {
  try {
    await ensureDataDir()
    const settings = await request.json()
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2))
    return NextResponse.json({ success: true, settings })
  } catch (error) {
    console.error("Erro ao salvar configurações:", error)
    return NextResponse.json({ error: "Erro ao salvar configurações" }, { status: 500 })
  }
}
